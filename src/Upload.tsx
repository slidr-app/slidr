import {useCallback, useEffect, useRef, useState} from 'react';
import {useDropzone} from 'react-dropzone';
import {Document, Page} from 'react-pdf';
import {zip} from 'fflate';
import * as pdfjs from 'pdfjs-dist';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import './pdf.css';

const src = new URL('pdfjs-dist/build/pdf.worker.js', import.meta.url);
pdfjs.GlobalWorkerOptions.workerSrc = src.toString();

export default function Export() {
  const [file, setFile] = useState<File>();
  const [pageIndex, setPageIndex] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [ready, setReady] = useState(false);
  const [zipfile, setZipfile] = useState<Uint8Array>();
  const onDrop = useCallback((acceptedFiles: File[]) => {
    console.log('incoming', acceptedFiles);
    setFile(acceptedFiles[0]);
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

  const [zipEntries, setZipEntries] = useState<Record<string, Uint8Array>>({});
  const addPageBlob = useCallback((name: string, data: Uint8Array) => {
    setZipEntries((zipEntries) => ({
      ...zipEntries,
      [name]: data,
    }));
  }, []);

  function pageRendered() {
    console.log('rendering page', pageIndex);
    canvasRef.current?.toBlob(async (blob) => {
      if (blob) {
        addPageBlob(
          `page${pageIndex}.webp`,
          new Uint8Array(await blob.arrayBuffer()),
        );
        setPageIndex((currentIndex) => currentIndex + 1);
      }
    }, 'image/webp');
  }

  useEffect(() => {
    if (pageIndex !== pageCount || pageIndex === 0) {
      return;
    }

    console.log('entries', zipEntries);

    zip(
      zipEntries,
      {
        level: 0,
      },
      (error, data) => {
        if (error) {
          throw error;
        }

        console.log('data', data.length);

        // Console.log('data', data);
        setZipfile(data);
      },
    );
  }, [pageIndex, pageCount, zipEntries]);

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

  return (
    <div className="w-screen h-screen overflow-hidden flex flex-col items-center">
      <div className="w-screen-sm">
        {file && (
          <Document
            file={file}
            className="h-[1090px] w-[1920px]"
            onLoadSuccess={(pdf) => {
              setPageCount(pdf.numPages);
            }}
          >
            <Page
              pageIndex={pageIndex}
              className="w-full h-full"
              canvasRef={canvasRef}
              width={1920}
              onRenderSuccess={() => {
                pageRendered();
              }}
            />
          </Document>
        )}
      </div>
      <div {...getRootProps()}>
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Drop the files here ...</p>
        ) : (
          <p>Drag 'n' drop some files here, or click to select files</p>
        )}
      </div>
      {zipfile && (
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
      )}
    </div>
  );
}
