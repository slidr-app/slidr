import {useContext, useEffect, useState} from 'react';
import {useDropzone} from 'react-dropzone';
import clsx from 'clsx/lite';
import {
  type DocumentReference,
  addDoc,
  collection,
  onSnapshot,
  setDoc,
} from 'firebase/firestore';
import {
  ref as storageReference,
  uploadBytes,
  getDownloadURL,
  getStorage,
  connectStorageEmulator,
} from 'firebase/storage';
import {nanoid} from 'nanoid';
import {firestore, app} from '../firebase';
import '../components/pdf/pdf.css';
import PresentationPreferencesEditor, {
  type NotesSaveState,
} from '../components/PresentationPreferencesEditor';
import DefaultLayout from '../layouts/DefaultLayout';
import {UserContext} from '../components/UserProvider';
import Loading from '../components/Loading';
import {
  fromFirestore,
  type Note,
  toFirestore,
  type Presentation,
} from '../../functions/src/presentation-schema';

type UploadState =
  | 'fetching user'
  | 'ready'
  | 'uploading'
  | 'processing'
  | 'done';

const storage = getStorage(app);

if (import.meta.env.MODE === 'emulator') {
  connectStorageEmulator(storage, '127.0.0.1', 9199);
}

const presentationConverter = {
  toFirestore,
  fromFirestore,
};

export default function Upload() {
  useEffect(() => {
    document.title = `Slidr - Upload`;
  }, []);

  const [uploadState, setUploadState] = useState<UploadState>('fetching user');
  const [file, setFile] = useState<File>();
  const [presentationReference, setPresentationReference] =
    useState<DocumentReference<Presentation>>();
  const [notes, setNotes] = useState<Note[]>([]);
  const [title, setTitle] = useState('');
  const [savingState, setSavingState] = useState<NotesSaveState>('saved');
  const [pages, setPages] = useState<string[]>([]);

  const {user} = useContext(UserContext);

  useEffect(() => {
    if (uploadState === 'fetching user' && user?.data !== undefined) {
      setUploadState('ready');
    }
  }, [uploadState, user?.data]);

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
      if (!acceptedFiles[0] || uploadState !== 'ready') {
        return;
      }

      setFile(acceptedFiles[0]);

      const presentationReference_ = await addDoc(
        collection(firestore, 'presentations').withConverter(
          presentationConverter,
        ),
        {
          created: new Date(),
          uid: user?.uid ?? '',
          username: user?.data?.username ?? '',
          twitterHandle: user?.data?.twitterHandle ?? '',
          pages: [],
          notes: [],
          title: '',
          status: 'uploading',
          rendered: new Date(),
        } satisfies Presentation,
      );
      setPresentationReference(presentationReference_);
      const originalName = `${nanoid()}.pdf`;
      const originalReference = storageReference(
        storage,
        `presentations/${presentationReference_.id}/${originalName}`,
      );

      await uploadBytes(originalReference, acceptedFiles[0], {
        cacheControl: 'public;max-age=604800',
      });

      const originalDownloadUrl = await getDownloadURL(originalReference);
      await setDoc(
        presentationReference_,
        {
          original: originalDownloadUrl,
          status: 'created',
        },
        {
          merge: true,
        },
      );
      setUploadState('processing');
    }

    void startRenderingFile();
  }, [
    acceptedFiles,
    uploadState,
    user?.uid,
    user?.data?.twitterHandle,
    user?.data?.username,
  ]);

  useEffect(() => {
    if (!presentationReference) {
      return;
    }

    // Only start listening for changes if we are processing the upload
    if (uploadState !== 'processing') {
      return;
    }

    return onSnapshot(presentationReference, async (snapshot) => {
      if (!snapshot.exists()) {
        return;
      }

      const data = snapshot.data();

      if (data.status === 'rendered') {
        setUploadState('done');

        // The function will set the default notes
        setNotes(data.notes);
        setPages(data.pages);

        // Save the title if the user changed the title
        if (data.title !== title) {
          await setDoc(
            presentationReference,
            {
              title,
            },
            {
              merge: true,
            },
          );
          setPages(data.pages);
        }
      }
    });
  }, [uploadState, presentationReference, notes, title]);

  // UseEffect(() => {
  //   async function updatePresentation() {
  //     if (uploadState !== 'done' || !presentationReference) {
  //       return;
  //     }

  //     await updateDoc(presentationReference, {
  //       notes,
  //       title,
  //     });
  //   }

  //   void updatePresentation();
  // }, [uploadState, presentationReference, notes, title]);

  function getUserFeedback() {
    if (uploadState === 'processing') {
      return ['Processing...', 'i-tabler-loader-3 animate-spin'];
    }

    if (uploadState === 'uploading') {
      return ['Uploading...', 'i-tabler-arrow-big-up-lines animate-bounce'];
    }

    if (uploadState === 'done') {
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
    if (uploadState !== 'done' || !presentationReference) {
      return;
    }

    setSavingState('saving');
    await setDoc(
      presentationReference,
      {
        notes,
        title,
      },
      {
        merge: true,
      },
    );
    setSavingState((currentState) => {
      const nextState = currentState === 'saving' ? 'saved' : currentState;
      return nextState;
    });
  }

  return (
    <DefaultLayout title="New Presentation">
      {uploadState === 'fetching user' ? (
        <div className="flex flex-col col-span-2 lt-sm:col-span-1 h-40 items-center justify-center">
          <Loading />
        </div>
      ) : (
        <div className="overflow-hidden flex flex-col items-center p-4 gap-6 pb-10 w-full max-w-screen-md mx-auto">
          <div className="flex w-full max-w-screen-sm aspect-video mx-6 relative">
            {file ? (
              <>
                {pages.length > 0 ? (
                  <img
                    src={pages[0]}
                    alt="Presentation thumbnail"
                    className="w-full h-full object-cover rounded-md"
                  />
                ) : null}
                <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center bg-teal-800 bg-opacity-90 rounded-md">
                  <div className={clsx('w-10 h-10', icon)} />
                  <div>{message}</div>
                </div>
              </>
            ) : (
              <div
                className="btn rounded-md p-8 flex w-full gap-4 cursor-pointer"
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
                        Drag &apos;n&apos; drop a pdf presentation here, or
                        click to select a pdf presentation
                      </div>
                    </>
                  )}
                  <input {...getInputProps()} />
                </label>
              </div>
            )}
          </div>
          <PresentationPreferencesEditor
            saveState={savingState}
            notes={notes}
            title={title}
            setNotes={setNotes}
            setTitle={setTitle}
            pages={pages}
            onSave={() => {
              void savePreferences();
            }}
            onDirty={() => {
              setSavingState('dirty');
            }}
          />
        </div>
      )}
    </DefaultLayout>
  );
}
