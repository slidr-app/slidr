import {useCallback, useContext, useEffect, useState} from 'react';
import {useDropzone} from 'react-dropzone';
import * as pdfjs from 'pdfjs-dist';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import clsx from 'clsx';
import {
  type DocumentReference,
  addDoc,
  collection,
  updateDoc,
  getDoc,
  doc,
} from 'firebase/firestore';
import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
  getStorage,
  connectStorageEmulator,
} from 'firebase/storage';
import {nanoid} from 'nanoid';
import {auth, firestore, app} from '../firebase';
import '../components/pdf/pdf.css';
import PresentationPreferencesEditor, {
  type NotesSaveState,
} from '../components/PresentationPreferencesEditor';
import {
  type PresentationCreate,
  type Note,
  type PresentationUpdate,
} from '../../functions/src/presentation';
import DefaultLayout from '../layouts/DefaultLayout';
import {UserContext, type UserDoc} from '../components/UserProvider';
import Loading from '../components/Loading';
import Pdf from '../components/pdf/Pdf';

const src = new URL('pdfjs-dist/build/pdf.worker.js', import.meta.url);
pdfjs.GlobalWorkerOptions.workerSrc = src.toString();

const storage = getStorage(app);

if (import.meta.env.MODE === 'emulator') {
  connectStorageEmulator(storage, '127.0.0.1', 9199);
}

export default function Upload() {
  useEffect(() => {
    document.title = `Slidr - Upload`;
  }, []);

  const {user} = useContext(UserContext);
  const [userData, setUserData] = useState<UserDoc>();

  useEffect(() => {
    async function getUserDoc() {
      if (!user) {
        setUserData(undefined);
        return;
      }

      const userSnapshot = await getDoc(doc(firestore, 'users', user.uid));
      if (!userSnapshot.exists()) {
        setUserData({});
        return;
      }

      setUserData(userSnapshot.data() as UserDoc);
    }

    void getUserDoc();
  }, [user]);

  const [file, setFile] = useState<File>();
  const [pageIndex, setPageIndex] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [uploadDone, setUploadDone] = useState(false);
  const [rendering, setRendering] = useState(false);
  const [presentationRef, setPresentationRef] = useState<DocumentReference>();
  const [notes, setNotes] = useState<Note[]>([]);
  const [title, setTitle] = useState('');
  const [savingState, setSavingState] = useState<NotesSaveState>('saved');

  const {getRootProps, getInputProps, isDragActive, acceptedFiles} =
    useDropzone({
      accept: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        'application/pdf': ['.pdf'],
      },
      maxFiles: 1,
    });

  useEffect(() => {
    async function startRenderingFile() {
      if (!acceptedFiles[0]) {
        return;
      }

      setFile(acceptedFiles[0]);

      const presentationRef = await addDoc(
        collection(firestore, 'presentations'),
        {
          created: new Date(),
          uid: auth.currentUser!.uid,
          username: userData?.username ?? '',
          twitterHandle: userData?.twitterHandle ?? '',
          pages: [],
          notes: [],
          title: '',
        } satisfies PresentationCreate,
      );
      setPresentationRef(presentationRef);
      const originalName = `${nanoid()}.pdf`;
      const originalRef = storageRef(
        storage,
        `presentations/${presentationRef.id}/${originalName}`,
      );

      await uploadBytes(originalRef, acceptedFiles[0], {
        cacheControl: 'public;max-age=604800',
      });

      const originalDownloadUrl = await getDownloadURL(originalRef);
      await updateDoc(presentationRef, {
        original: originalDownloadUrl,
      } satisfies PresentationUpdate);
      setRendering(true);
    }

    void startRenderingFile();
  }, [acceptedFiles, userData?.twitterHandle, userData?.username]);

  const [renderingDone, setRenderingDone] = useState(false);
  const [pageBlob, setPageBlob] = useState<Blob>();

  const pageRendered = useCallback((canvas: HTMLCanvasElement) => {
    // Watermark rendered image
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const rootStyles = window.getComputedStyle(
        document.querySelector('#root')!,
      );

      const fontFamily = rootStyles.getPropertyValue('font-family');

      // The weight should match an already loaded font so that all watermarks have the same dimensions.
      // Otherwise, the first page may not have the correctly scaled font.
      const fontStyle = `500 16px ${fontFamily}`;

      ctx.font = fontStyle;
      ctx.fillStyle = 'rgba(255,255,255,0.75)';
      ctx.strokeStyle = 'rgba(0,0,0,0.45)';

      const textMetrics = ctx.measureText('slidr.app');
      const x =
        canvas.width -
        20 -
        textMetrics.actualBoundingBoxLeft -
        textMetrics.actualBoundingBoxRight;
      const y =
        canvas.height -
        0 -
        textMetrics.fontBoundingBoxAscent -
        textMetrics.fontBoundingBoxDescent;
      ctx.fillText('slidr.app', x, y);
      ctx.strokeText('slidr.app', x, y);
    }

    canvas.toBlob(async (blob) => {
      if (!blob) {
        throw new Error(`Error rendering pdf canvas to image webp blob`);
      }

      setPageBlob(blob);
    }, 'image/webp');
  }, []);

  const [uploadPromises, setUploadPromises] = useState<Array<Promise<string>>>(
    [],
  );
  const [pages, setPages] = useState<string[]>([]);
  useEffect(() => {
    async function uploadPage() {
      const pageStorageRef = storageRef(
        storage,
        `presentations/${presentationRef!.id}/${pageIndex
          .toString()
          .padStart(3, '0')}_${nanoid()}.webp`,
      );

      await uploadBytes(pageStorageRef, pageBlob!, {
        cacheControl: 'public, max-age=604800, immutable',
      });
      const pageUrl = await getDownloadURL(pageStorageRef);
      return pageUrl;
    }

    if (!rendering || !pageBlob || !presentationRef) {
      return;
    }

    const uploadPromise = uploadPage();
    setUploadPromises((currentPromises) => [...currentPromises, uploadPromise]);
    setPageBlob(undefined);

    if (pageIndex < pageCount - 1) {
      setPageIndex(pageIndex + 1);
    } else {
      setRenderingDone(true);
    }
  }, [rendering, pageBlob, pageIndex, presentationRef, pageCount]);

  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    async function updatePages() {
      if (!presentationRef || !renderingDone || uploadDone || uploading) {
        return;
      }

      setUploading(true);

      const nextPages = await Promise.all(uploadPromises);
      const nextNotes = nextPages.map((_, pageIndex) => ({
        pageIndices: [pageIndex] as [number, ...number[]],
        markdown: '',
      }));

      setSavingState('saving');
      setPages(nextPages);
      setNotes(nextNotes);

      await updateDoc(presentationRef, {
        pages: nextPages,
        rendered: new Date(),
        title,
        notes: nextNotes,
      } satisfies PresentationUpdate);
      setUploadDone(true);
      setSavingState((currentState) =>
        currentState === 'saving' ? 'saved' : currentState,
      );
    }

    void updatePages();
  }, [
    presentationRef,
    renderingDone,
    uploadPromises,
    title,
    notes,
    uploadDone,
    uploading,
  ]);

  function getUserFeedback() {
    if (file && !rendering) {
      return [
        'Initializing...',
        'i-tabler-loader-3 animate-spin animate-duration-1000',
      ];
    }

    if (file && rendering && !renderingDone) {
      return ['Rendering...', 'i-tabler-loader-3 animate-spin'];
    }

    if (file && rendering && renderingDone && !uploadDone) {
      return ['Uploading...', 'i-tabler-arrow-big-up-lines animate-bounce'];
    }

    if (file && rendering && renderingDone && uploadDone) {
      return ['Done', 'i-tabler-check'];
    }

    return ['', ''];
  }

  const [message, icon] = getUserFeedback();

  async function savePreferences() {
    // TODO: there is probably a race condition between uploading === true and uploadDone === true
    // Could it be possible to lose some updates?
    // The core problem is probably that the this save can happen async and the uploading save happens with an effect
    // Consider: always updating here, ignoring uploadingDone
    // Or do the upload synchronously 🤔
    // if (!uploadDone || !presentationRef) {
    // Update, let them both save, we may lose a note if the uploading save happens after this save, but that seems unlikely
    if (!uploading || !presentationRef) {
      return;
    }

    setSavingState('saving');
    await updateDoc(presentationRef, {
      notes,
      title,
    } satisfies PresentationUpdate);
    setSavingState((currentState) =>
      currentState === 'saving' ? 'saved' : currentState,
    );
  }

  return (
    <DefaultLayout title="New Presentation">
      {/* TODO: loading spinner */}
      {userData ? (
        <div className="overflow-hidden flex flex-col items-center p-4 gap-6 pb-10 w-full max-w-screen-md mx-auto">
          {!file && (
            <div
              className="btn rounded-md p-8 flex w-full max-w-screen-sm aspect-video gap-4 cursor-pointer mx-6"
              {...getRootProps({role: 'button'})}
            >
              <label className="flex flex-col items-center justify-center w-full cursor-pointer">
                {isDragActive ? (
                  <>
                    <div className="i-tabler-arrow-big-down-lines text-6xl animate-bounce animate-duration-500 text-teal-500" />
                    <div className="text-center">
                      Drop the pdf presentation here...
                    </div>
                  </>
                ) : (
                  <>
                    <div className="i-tabler-arrow-big-down-lines text-6xl animate-bounce" />
                    <div className="text-center">
                      Drag &apos;n&apos; drop a pdf presentation here, or click
                      to select a pdf presentation
                    </div>
                  </>
                )}
                <input {...getInputProps()} />
              </label>
            </div>
          )}
          {file && (
            <div className="relative flex flex-col w-full max-w-screen-sm">
              {!renderingDone && (
                <Pdf
                  pageIndex={pageIndex}
                  file={file}
                  onSetPageCount={setPageCount}
                  onPageRendered={pageRendered}
                />
              )}
              <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center bg-teal-800 bg-opacity-90">
                <div className={clsx('w-10 h-10', icon)} />
                <div>{message}</div>
              </div>
              <div
                className="absolute bottom-0 h-[6px] bg-teal"
                style={{width: `${((pageIndex + 1) * 100) / pageCount}%`}}
              />
              <div>Rendering slide: {pageIndex + 1}</div>
            </div>
          )}
          <PresentationPreferencesEditor
            saveState={savingState}
            notes={notes}
            title={title}
            setNotes={(updater) => {
              setNotes(updater);
            }}
            setTitle={(nextTitle) => {
              setTitle(nextTitle);
            }}
            pages={pages}
            onSave={() => {
              void savePreferences();
            }}
            onDirty={() => {
              setSavingState('dirty');
            }}
          />
        </div>
      ) : (
        <div className="flex flex-col col-span-2 lt-sm:col-span-1 h-40 items-center justify-center">
          <Loading />
        </div>
      )}
    </DefaultLayout>
  );
}
