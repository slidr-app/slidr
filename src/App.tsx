import {useState, type PropsWithChildren, useEffect} from 'react';
import {Document, Page} from 'react-pdf';
import * as pdfjs from 'pdfjs-dist';
import ReactCanvasConfetti from 'react-canvas-confetti';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import clsx from 'clsx';
import './pdf.css';
import {useSlideIndex} from './use-slide-index';
import useArrowKeys from './use-arrow-keys';
import useConfetti from './use-confetti-supabase';

const src = new URL('pdfjs-dist/build/pdf.worker.js', import.meta.url);
pdfjs.GlobalWorkerOptions.workerSrc = src.toString();

function App() {
  // UseEffect(() => {
  //   const channel = supabase.channel('boom');
  //   channel
  //     .on('broadcast', {event: 'supa'}, (payload) => {
  //       console.log(payload);
  //     })
  //     .subscribe((status) => {
  //       if (status === 'SUBSCRIBED') {
  //         void channel.send({
  //           type: 'broadcast',
  //           event: 'supa',
  //           payload: {org: 'supabase'},
  //         });
  //       }
  //     });

  //   return () => {
  //     void channel.unsubscribe();
  //   };
  // });

  const {
    slideIndex,
    forward,
    prevSlideIndex,
    nextSlideIndex,
    slideCount,
    setSlideCount,
    navNext,
    navPrevious,
  } = useSlideIndex();

  useArrowKeys(navPrevious, navNext);

  console.log({
    slideCount,
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

  const [fire, setFire] = useState<boolean | Record<string, unknown>>(false);
  useConfetti(setFire);

  return (
    <div className="pdf-container w-screen h-screen flex flex-col items-center justify-center overflow-hidden">
      <Document
        file={'/zen-oss.pdf'}
        onLoadSuccess={(pdf) => {
          setSlideCount(pdf.numPages);
        }}
        className="w-full aspect-video position-relative max-w-[calc(100vh_*_(16/9))]"
        loading={<Message>Loading...</Message>}
        error={<Message>Loading failed.</Message>}
        noData={<Message>No PDF file found.</Message>}
      >
        {/* Preload the previous page (if there is one) */}
        {((forward && slideIndex > 0) ||
          (!forward && slideIndex < slideCount - 1)) &&
          pageUnder}
        {/* Render the current page with a CSS transition */}
        <Page
          key={`page-${slideIndex}`}
          pageIndex={slideIndex}
          width={Math.min(window.innerWidth, window.innerHeight * (16 / 9))}
          className="transition transition-opacity duration-500 ease-linear opacity-100 w-full h-full important-position-absolute top-0 left-0"
        />
        {/* Preload the next page (if there is one) */}
        {((forward && slideIndex < slideCount - 1) ||
          (!forward && slideIndex > 0)) &&
          pageOver}
        {/* </div> */}
        <ReactCanvasConfetti
          fire={fire}
          angle={90}
          className="canvas position-absolute top-0 w-screen h-screen"
          colors={[
            '#26ccff',
            '#a25afd',
            '#ff5e7e',
            '#88ff5a',
            '#fcff42',
            '#ffa62d',
            '#ff36ff',
          ]}
          decay={0.8}
          drift={0}
          gravity={1}
          origin={{
            x: Math.random(),
            y: Math.random(),
          }}
          particleCount={500}
          resize
          scalar={1}
          shapes={['circle', 'square', 'star']}
          spread={360}
          startVelocity={45}
          ticks={600}
          useWorker
        />
      </Document>
    </div>
  );
}

export default App;
