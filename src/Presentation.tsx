import {
  useState,
  type PropsWithChildren,
  useEffect,
  useMemo,
  useCallback,
} from 'react';
import {Document, Page} from 'react-pdf';
import * as pdfjs from 'pdfjs-dist';
import QRCode from 'react-qr-code';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import clsx from 'clsx';
import './pdf.css';
import {useSlideIndex} from './use-slide-index';
import useKeys from './use-keys';
import useConfetti from './use-confetti';
import useBroadcastChannel from './use-broadcast-channel';
import useSearchParametersSlideIndex from './use-search-parameter-slide-index';
import useBroadcastSupaBase from './use-broadcast-supabase';
import Confetti from './Confetti';

const src = new URL('pdfjs-dist/build/pdf.worker.js', import.meta.url);
pdfjs.GlobalWorkerOptions.workerSrc = src.toString();

function Presentation({slideUrl}: {slideUrl: string}) {
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
  } = useSlideIndex(useBroadcastChannel, slideUrl);

  const {setSlideIndex: setSupaBaseSlideIndex} = useSlideIndex(
    useBroadcastSupaBase,
    slideUrl,
  );

  useEffect(() => {
    console.log('updating', slideIndex);
    setSupaBaseSlideIndex(slideIndex);
  }, [slideIndex, setSupaBaseSlideIndex]);

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

  const keyHandlers = useMemo(
    () =>
      new Map([
        ['ArrowLeft', navPrevious],
        ['ArrowRight', navNext],
        ['Space', navNext],
        ['KeyS', openSpeakerWindow],
      ]),
    [navPrevious, navNext, openSpeakerWindow],
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

  function Message({children}: PropsWithChildren) {
    return (
      <div className="position-absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center">
        <div>{children}</div>
      </div>
    );
  }

  const [fire, setFire] = useState<boolean | Record<string, unknown>>(false);
  useConfetti(slideUrl, useBroadcastChannel, setFire);
  useConfetti(slideUrl, useBroadcastSupaBase, setFire);

  return (
    <div className="pdf-container w-screen h-screen flex flex-col items-center justify-center overflow-hidden">
      <Document
        file={slideUrl}
        className="w-full aspect-video position-relative max-w-[calc(100vh_*_(16/9))]"
        loading={<Message>Loading...</Message>}
        error={<Message>Loading failed.</Message>}
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
        />
        {/* Preload the next page (if there is one) */}
        {((forward && slideIndex < slideCount - 1) ||
          (!forward && slideIndex > 0)) &&
          pageOver}
        {/* </div> */}
        <div className="position-absolute top-4 right-4 bg-white p-2 w-40 h-40">
          <QRCode
            value={`${window.location.origin}${window.location.pathname}/view${window.location.search}`}
            // Size={128}
            // Level="M"
            className="w-full h-full"
            style={{width: '100%', height: 'auto', maxWidth: '100%'}}
          />
        </div>
      </Document>
      <Confetti fire={fire} />
    </div>
  );
}

export default Presentation;
