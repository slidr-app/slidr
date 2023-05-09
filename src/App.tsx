import {useState, useEffect, type PropsWithChildren, useMemo} from 'react';
// Import './App.css'
import {Document, Page} from 'react-pdf';
import * as pdfjs from 'pdfjs-dist';
// Import type { DocumentProps } from 'react-pdf'
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import type {PDFDocumentProxy} from 'pdfjs-dist';
import clsx from 'clsx';
import './pdf.css';
import {useSlideIndex} from './use-slide-index';

const src = new URL('pdfjs-dist/build/pdf.worker.js', import.meta.url);
pdfjs.GlobalWorkerOptions.workerSrc = src.toString();

function App() {
  // Const [page, setPage] = useState(0);
  const [numberPages, setNumberPages] = useState(0);
  // Const [forward, setForward] = useState(true);

  const {slideIndex, setSlideIndex, forward, prevSlideIndex, nextSlideIndex} =
    useSlideIndex(numberPages);

  // Const previousPageNumber = useMemo(
  //   () => Math.max(slideIndex - 1, 0),
  //   [slideIndex],
  // );
  // const nextPageNumber = useMemo(
  //   () => Math.min(slideIndex + 1, numberPages - 1),
  //   [slideIndex, numberPages],
  // );

  // Const [postSlideIndex, setPostSlideIndex] = useState<(index: number) => void>(
  //   () => () => undefined,
  // );

  // useEffect(() => {
  //   const currentSlideChannel = new BroadcastChannel('current_slide');
  //   const currentSlideHandler = (event: MessageEvent) => {
  //     console.log(event);
  //     setPage(event.data as number);
  //   };

  //   currentSlideChannel.addEventListener('message', currentSlideHandler);
  //   setPostSlideIndex(() => (index: number) => {
  //     console.log('posting', index);
  //     currentSlideChannel.postMessage(index);
  //   });
  //   return () => {
  //     currentSlideChannel.removeEventListener('message', currentSlideHandler);
  //     currentSlideChannel.close();
  //   };
  // }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      console.log({event, numPages: numberPages});
      if (event.code === 'ArrowRight') {
        setSlideIndex(nextSlideIndex);
        // SetPage(nextPageNumber);
        // postSlideIndex(nextPageNumber);
        // setForward(true);
      }

      if (event.code === 'ArrowLeft') {
        setSlideIndex(prevSlideIndex);
        // SetPage(previousPageNumber);
        // postSlideIndex(previousPageNumber);
        // setForward(false);
      }
    }

    document.addEventListener('keydown', handleKeyDown);

    // Don't forget to clean up
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [nextSlideIndex, prevSlideIndex, setSlideIndex]);

  function onDocumentLoadSuccess({
    numPages: nextNumberPages,
  }: PDFDocumentProxy) {
    // Console.log({nextNumPages})
    setNumberPages(nextNumberPages);
  }

  // Console.log({numPages, page})

  console.log({
    numPages: numberPages,
    slideIndex,
    nextSlideIndex,
    prevSlideIndex,
    forward,
  });

  const pageUnder = (
    <Page
      key={`page-${forward ? prevSlideIndex : nextSlideIndex}`}
      pageIndex={forward ? prevSlideIndex : nextSlideIndex}
      className={clsx(
        'w-full h-full important-position-absolute top-0 left-0 opacity-100',
      )}
      width={Math.min(window.innerWidth, window.innerHeight * (16 / 9))}
    />
  );
  const pageOver = (
    <Page
      key={`page-${forward ? nextSlideIndex : prevSlideIndex}`}
      pageIndex={forward ? nextSlideIndex : prevSlideIndex}
      className={clsx(
        'w-full h-full important-position-absolute top-0 left-0 opacity-0',
      )}
      width={Math.min(window.innerWidth, window.innerHeight * (16 / 9))}
    />
  );

  const Message = ({children}: PropsWithChildren) => (
    <div className="position-absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center">
      <div>{children}</div>
    </div>
  );

  return (
    <div className="pdf-container w-screen h-screen flex flex-col items-center justify-center overflow-hidden">
      <Document
        file={'/zen-oss.pdf'}
        onLoadSuccess={onDocumentLoadSuccess}
        className="w-full aspect-video position-relative max-w-[calc(100vh_*_(16/9))]"
        loading={<Message>Loading...</Message>}
        error={<Message>Loading failed.</Message>}
        noData={<Message>No PDF file found.</Message>}
      >
        {/* <div className='bg-yellow position-absolute top-0 w-full h-full' />
        <div className='bg-blue position-absolute top-0 w-full h-full' /> */}

        {/* <div className='position-relative top-0 bg-yellow w-full h-full'> */}
        {/* Preload the previous page (if there is one) */}
        {((forward && slideIndex > 0) ||
          (!forward && slideIndex < numberPages - 1)) &&
          pageUnder}
        {/* Render the current page with a CSS transition */}
        <Page
          key={`page-${slideIndex}`}
          pageIndex={slideIndex}
          width={Math.min(window.innerWidth, window.innerHeight * (16 / 9))}
          className="transition transition-opacity duration-500 ease-linear opacity-100 w-full h-full important-position-absolute top-0 left-0"
        />
        {/* Preload the next page (if there is one) */}
        {((forward && slideIndex < numberPages - 1) ||
          (!forward && slideIndex > 0)) &&
          pageOver}
        {/* </div> */}
      </Document>
    </div>
  );
}

export default App;
