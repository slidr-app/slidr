import {useCallback, useEffect, useRef, useState} from 'react';
import {useDropzone} from 'react-dropzone';
import {Document, Page} from 'react-pdf';
import * as pdfjs from 'pdfjs-dist';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import clsx from 'clsx';
import {
  type DocumentReference,
  addDoc,
  collection,
  updateDoc,
} from 'firebase/firestore/lite';
import {ref as storageRef, uploadBytes, getDownloadURL} from 'firebase/storage';
import {nanoid} from 'nanoid';
import {auth, firestore, storage} from '../firebase';
import '../pdf/pdf.css';

const src = new URL('pdfjs-dist/build/pdf.worker.js', import.meta.url);
pdfjs.GlobalWorkerOptions.workerSrc = src.toString();

export default function Export() {
  const [file, setFile] = useState<File>();
  const [pageIndex, setPageIndex] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [uploadDone, setUploadDone] = useState(false);
  const [rendering, setRendering] = useState(false);
  const [presentationRef, setPresentationRef] = useState<DocumentReference>();
  // Const [ready, setReady] = useState(false);
  // Const [zipfile, setZipfile] = useState<Uint8Array>();
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    console.log('incoming', acceptedFiles);

    setFile(acceptedFiles[0]);
    const presentationRef = await addDoc(
      collection(firestore, 'presentations'),
      {created: new Date(), uid: auth.currentUser?.uid},
    );
    setPresentationRef(presentationRef);
    const originalName = `${nanoid()}.pdf`;
    const originalRef = storageRef(
      storage,
      `presentations/${presentationRef.id}/${originalName}`,
    );
    await uploadBytes(originalRef, acceptedFiles[0]);
    const originalDownloadUrl = await getDownloadURL(originalRef);
    await updateDoc(presentationRef, {original: originalDownloadUrl});
    setRendering(true);
  }, []);

  const {getRootProps, getInputProps, isDragActive} = useDropzone({
    onDrop,
    accept: {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      'application/pdf': ['.pdf'],
    },
    maxFiles: 1,
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Const [zipEntries, setZipEntries] = useState<Record<string, Uint8Array>>({});
  // const addPageBlob = useCallback((name: string, data: Uint8Array) => {
  //   setZipEntries((zipEntries) => ({
  //     ...zipEntries,
  //     [name]: data,
  //   }));
  // }, []);

  const [renderingDone, setRenderingDone] = useState(false);
  const [pageBlob, setPageBlob] = useState<Blob>();
  function pageRendered() {
    console.log('rendering page', pageIndex);
    // Return;
    canvasRef.current?.toBlob(async (blob) => {
      if (!blob) {
        throw new Error(`Error rendering page index ${pageIndex}`);
      }

      setPageBlob(blob);
    }, 'image/webp');
  }

  const [uploadPromises, setUploadPromises] = useState<Array<Promise<void>>>(
    [],
  );
  const [pageUrls, setPageUrls] = useState<string[]>([]);
  useEffect(() => {
    async function uploadPage() {
      console.log('uploading page', pageIndex);

      const pageStorageRef = storageRef(
        storage,
        `presentations/${presentationRef!.id}/${pageIndex
          .toString()
          .padStart(3, '0')}_${nanoid()}.webp`,
      );

      await uploadBytes(pageStorageRef, pageBlob!);
      const pageUrl = await getDownloadURL(pageStorageRef);
      setPageUrls((currentUrls) => [...currentUrls, pageUrl]);
      console.log('uploaded page', pageIndex);
    }

    if (!rendering || !pageBlob || !presentationRef) {
      return;
    }

    setUploadPromises((currentPromises) => [...currentPromises, uploadPage()]);
    setPageBlob(undefined);

    if (pageIndex < pageCount - 1) {
      setPageIndex(pageIndex + 1);
    } else {
      setRenderingDone(true);
    }
  }, [rendering, pageBlob, pageIndex, presentationRef, pageCount]);

  useEffect(() => {
    async function updatePages() {
      if (!presentationRef || !renderingDone) {
        return;
      }

      await Promise.all(uploadPromises);

      console.log('setting pages');
      await updateDoc(presentationRef, {pages: pageUrls, rendered: new Date()});
      setUploadDone(true);
      // SetPresentationRef(undefined);
    }

    void updatePages();
  }, [presentationRef, pageUrls, renderingDone, uploadPromises]);

  // UseEffect(() => {
  //   if (pageIndex !== pageCount || pageIndex === 0) {
  //     return;
  //   }

  //   console.log('entries', zipEntries);

  //   zip(
  //     zipEntries,
  //     {
  //       level: 0,
  //     },
  //     (error, data) => {
  //       if (error) {
  //         throw error;
  //       }

  //       console.log('data', data.length);

  //       // Console.log('data', data);
  //       setZipfile(data);
  //     },
  //   );
  // }, [pageIndex, pageCount, zipEntries]);

  // UseEffect(() => {
  //   if (!pageBlob) {
  //     return;
  //   }

  //   console.log('blob', pageBlob);

  //   const blobUrl = URL.createObjectURL(pageBlob);
  //   const newTab = window.open(blobUrl, '_blank');

  //   setPageIndex((current) => current + 1);
  //   // If(pageIndex)
  //   // setPageIndex()
  // }, [pageBlob]);

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

  return (
    <div className="overflow-hidden flex flex-col items-center p-4 gap-4">
      {!file && (
        <div
          className="btn rounded-xl p-8 flex flex-col items-center w-screen-sm mb-10"
          {...getRootProps()}
        >
          <input {...getInputProps()} />
          {isDragActive ? (
            <>
              <div className="i-tabler-arrow-big-down-lines text-5xl animate-bounce animate-duration-500 text-teal-500" />
              <div className="text-center">Drop the files here ...</div>
            </>
          ) : (
            <>
              <div className="i-tabler-arrow-big-down-lines text-5xl animate-bounce" />
              <div className="text-center">
                Drag 'n' drop some files here, or click to select files
              </div>
            </>
          )}
        </div>
      )}
      {file && (
        <div className="flex flex-col w-80 aspect-video">
          <Document
            file={file}
            className="w-full aspect-video relative"
            onLoadSuccess={(pdf) => {
              setPageCount(pdf.numPages);
            }}
          >
            <Page
              pageIndex={pageIndex}
              className="w-full h-full"
              canvasRef={canvasRef}
              width={1920}
              // We want the exported images to be 1920, irrespective of the pixel ratio
              // Fix the ratio to 1
              devicePixelRatio={1}
              onRenderSuccess={() => {
                pageRendered();
              }}
            />
            <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center bg-teal-800 bg-opacity-90">
              <div className={clsx('w-10 h-10', icon)} />
              <div>{message}</div>
            </div>
          </Document>
          <div
            className="h-[6px] bg-teal"
            style={{width: `${((pageIndex + 1) * 100) / pageCount}%`}}
          />
          <div>Rendering slide: {pageIndex + 1}</div>
          <div>Remaining: {pageCount - pageIndex - 1}</div>
        </div>
      )}
      {/* {zipfile && (
        <button
          className="btn"
          type="button"
          onClick={() => {
            window.open(
              URL.createObjectURL(
                new Blob([zipfile], {type: 'application/zip'}),
              ),
              '_blank',
            );
          }}
        >
          Download
        </button>
      )} */}
    </div>
  );
}
