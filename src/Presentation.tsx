import {useState, useEffect, useMemo, useCallback} from 'react';
import {Document, Page} from 'react-pdf';
import * as pdfjs from 'pdfjs-dist';
import QRCode from 'react-qr-code';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import clsx from 'clsx';
import {useParams} from 'react-router-dom';
import './pdf.css';
import {useSlideIndex} from './use-slide-index';
import useKeys from './use-keys';
import useConfetti from './use-confetti';
import useBroadcastChannel from './use-broadcast-channel';
import useSearchParametersSlideIndex from './use-search-parameter-slide-index';
import useBroadcastSupabase from './use-broadcast-supabase';
import Confetti from './Confetti';
import {presentations} from './presentation-urls';
import Message from './Message';
import Loading from './Loading';

const src = new URL('pdfjs-dist/build/pdf.worker.js', import.meta.url);
pdfjs.GlobalWorkerOptions.workerSrc = src.toString();

function Presentation() {
  const {presentationSlug} = useParams();
  useEffect(() => {
    document.title = `Present - ${presentationSlug!}`;
  }, [presentationSlug]);

  const {
    slideIndex,
    setSlideIndex,
    forward,
    prevSlideIndex,
    nextSlideIndex,
    slideCount,
    setSlideCount,
    navNext,
    navPrevious,
  } = useSlideIndex(useBroadcastChannel, presentationSlug!);

  const {setSlideIndex: setSupabaseSlideIndex} = useSlideIndex(
    useBroadcastSupabase,
    presentationSlug!,
  );

  useEffect(() => {
    console.log('updating', slideIndex);
    setSupabaseSlideIndex(slideIndex);
  }, [slideIndex, setSupabaseSlideIndex]);

  useSearchParametersSlideIndex(setSlideIndex, slideIndex);

  const openSpeakerWindow = useCallback(
    () =>
      window.open(
        `${window.location.origin}${window.location.pathname}/speaker${window.location.search}`,
        undefined,
        'popup',
      ),
    [],
  );

  const [fire, setFire] = useState<boolean | Record<string, unknown>>(false);
  const [reset, setReset] = useState<boolean | Record<string, unknown>>(false);

  const resetConfetti = useCallback(() => {
    setReset({});
  }, [setReset]);

  useConfetti(presentationSlug!, useBroadcastChannel, setFire, resetConfetti);
  useConfetti(presentationSlug!, useBroadcastSupabase, setFire);

  const keyHandlers = useMemo(
    () =>
      new Map([
        ['ArrowLeft', navPrevious],
        ['ArrowRight', navNext],
        ['Space', navNext],
        ['KeyS', openSpeakerWindow],
        ['KeyC', resetConfetti],
      ]),
    [navPrevious, navNext, openSpeakerWindow, resetConfetti],
  );
  useKeys(keyHandlers);

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
      loading={<Loading message="Loading page..." />}
      error={<Message>Failed to load page.</Message>}
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
      loading={<Loading message="Loading page..." />}
      error={<Message>Failed to load page.</Message>}
    />
  );

  return (
    <div className="pdf-container w-screen h-screen flex flex-col items-center justify-center overflow-hidden position-relative">
      <Document
        file={presentations[presentationSlug!]}
        className="w-full aspect-video position-relative max-w-[calc(100vh_*_(16/9))]"
        loading={<Loading message="Loading pdf..." />}
        error={<Message>Loading PDF failed.</Message>}
        noData={<Message>No PDF file found.</Message>}
        onLoadSuccess={(pdf) => {
          setSlideCount(pdf.numPages);
        }}
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
          loading={<Loading message="Loading page..." />}
          error={<Message>Failed to load page.</Message>}
        />
        {/* Preload the next page (if there is one) */}
        {((forward && slideIndex < slideCount - 1) ||
          (!forward && slideIndex > 0)) &&
          pageOver}
      </Document>
      <Confetti fire={fire} reset={reset} />
      <div className="position-absolute top-1rem w-10rem h-[calc(100%_-_10rem_-_2rem)] right-4 animate-longbounce 2xl:w-12rem 2xl:h-[calc(100%_-_12rem_-_2rem)] lt-sm:w-8rem lt-sm:h-[calc(100%_-_8rem_-_2rem)]">
        <div className=" bg-white p-2 w-10rem h-10rem 2xl:w-12rem 2xl:h-12rem lt-sm:w-8rem lt-sm:h-8rem">
          <QRCode
            value={`${window.location.origin}${window.location.pathname}/view${window.location.search}`}
            // Size={128}
            // level="Q"
            className="w-full h-full"
            style={{width: '100%', height: 'auto', maxWidth: '100%'}}
          />
        </div>
      </div>
    </div>
  );
}

export default Presentation;
