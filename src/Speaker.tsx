import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {Document, Page} from 'react-pdf';
import * as pdfjs from 'pdfjs-dist';
import {useMemo, useState, useCallback, useEffect, useRef} from 'react';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import {useParams} from 'react-router-dom';
import clsx from 'clsx';
import {useSwipeable} from 'react-swipeable';
import {useSlideIndex} from './use-slide-index';
import './pdf.css';
import useKeys from './use-keys';
import useConfetti from './use-confetti';
import useBroadcastChannel from './use-broadcast-channel';
import useSearchParametersSlideIndex from './use-search-parameter-slide-index';
import useBroadcastSupabase from './use-broadcast-supabase';
import {presentations} from './presentation-urls';
import useNotes from './use-notes';
import {pageMessageProperties, pdfMessageProperties} from './PdfMessages';
import ProgressBar from './ProgressBar';
import {useChannelHandlers, useCombinedHandlers} from './use-channel-handlers';

const src = new URL('pdfjs-dist/build/pdf.worker.js', import.meta.url);
pdfjs.GlobalWorkerOptions.workerSrc = src.toString();

const textSizes = [
  'text-xs',
  'text-sm',
  'text-base',
  'text-lg',
  'text-xl',
  'text-2xl',
  'text-3xl',
  'text-4xl',
  'text-5xl',
  'text-6xl',
  'text-7xl',
  'text-8xl',
];

export default function Speaker() {
  const {presentationSlug} = useParams();

  if (presentations[presentationSlug!] === undefined) {
    throw new Error(`Presentation '${presentationSlug!}' does not exist`);
  }

  useEffect(() => {
    document.title = `Present - ${presentationSlug!} - Speaker`;
  }, [presentationSlug]);

  const notes = useNotes(presentationSlug!);

  // Sync the slide index with the broadcast channel (speaker view)
  const {
    handleIncomingBroadcast: handleIncomingBroadcastChannel,
    setHandlers: setHandlersBroadcastChannel,
  } = useChannelHandlers();
  const postBroadcastChannel = useBroadcastChannel({
    channelId: presentationSlug!,
    onIncoming: handleIncomingBroadcastChannel,
  });
  const {
    slideIndex,
    setSlideIndex,
    prevSlideIndex,
    nextSlideIndex,
    slideCount,
    setSlideCount,
    navNext,
    navPrevious,
    handlers: handlersSlideIndexBroadcastChannel,
  } = useSlideIndex({postMessage: postBroadcastChannel});
  useCombinedHandlers(
    setHandlersBroadcastChannel,
    handlersSlideIndexBroadcastChannel,
  );
  useSearchParametersSlideIndex(setSlideIndex, slideIndex);

  // We fire and reset confetti on the broadcast channel (ignoring incoming confetti)
  const {
    postConfetti: postConfettiBroadcastChannel,
    postConfettiReset: postConfettiResetBroadcastChannel,
  } = useConfetti({postMessage: postBroadcastChannel});
  const postBroadcastSupabase = useBroadcastSupabase({
    channelId: presentationSlug!,
  });
  // We fire confetti on the supabase channel (never reset, ignore incoming confetti)
  const {postConfetti: postConfettiBroadcastSupabase} = useConfetti({
    postMessage: postBroadcastSupabase,
  });

  // Swipe and key bindings
  const swipeHandlers = useSwipeable({
    onSwipedRight() {
      navPrevious();
    },
    onSwipedLeft() {
      navNext();
    },
  });
  const keyHandlers = useMemo(
    () =>
      new Map([
        ['ArrowLeft', navPrevious],
        ['ArrowRight', navNext],
        ['Space', navNext],
      ]),
    [navPrevious, navNext],
  );
  useKeys(keyHandlers);

  // Speaker note sizes
  const [textSize, setTextSize] = useState('text-base');
  const zoom = useCallback((zoomIn: boolean) => {
    return (currentSize: string) => {
      const currentIndex = textSizes.indexOf(currentSize);
      if (currentIndex === -1) {
        return 'text-base';
      }

      const nextIndex = Math.min(
        Math.max(currentIndex + (zoomIn ? 1 : -1), 0),
        textSizes.length - 1,
      );
      return textSizes[nextIndex];
    };
  }, []);

  // Calculate the correct width for the pdf pages
  // This ensures that they are rendered at the ideal resolution, rather than scaled by css
  const previousRef = useRef<HTMLDivElement>(null);
  const nextRef = useRef<HTMLDivElement>(null);
  const currentRef = useRef<HTMLDivElement>(null);
  const previousWidth = previousRef.current?.clientWidth;
  const nextWidth = nextRef.current?.clientWidth;
  const currentWidth = currentRef.current?.clientWidth;

  return (
    <div
      className="p-4 pt-0 grid grid-cols-[auto_1fr] gap-5 h-screen overflow-hidden lt-sm:(flex flex-col overflow-auto h-auto w-full)"
      {...swipeHandlers}
    >
      <div className="flex flex-col overflow-x-hidden overflow-y-auto sm:resize-x w-md lt-sm:w-full">
        <div className="flex flex-col gap-4">
          <div className="self-center w-full header">
            Slide: <span className="font-bold">{slideIndex + 1}</span>
          </div>
          <Document
            file={presentations[presentationSlug!]}
            className="grid grid-cols-2 gap-4"
            {...pdfMessageProperties}
            onLoadSuccess={(pdf) => {
              setSlideCount(pdf.numPages);
            }}
          >
            <div ref={currentRef} className="w-full col-span-2 aspect-video">
              <Page
                key={`page-${slideIndex}`}
                pageIndex={slideIndex}
                className="w-full h-full"
                width={currentWidth}
                {...pageMessageProperties}
              />
            </div>
            <div ref={previousRef} className="w-full aspect-video col-start-1">
              {slideIndex > 0 ? (
                <Page
                  key={`page-${prevSlideIndex}`}
                  pageIndex={prevSlideIndex}
                  className="w-full h-full"
                  width={previousWidth}
                  {...pageMessageProperties}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center">
                  <div className="i-tabler-circle-filled text-green text-4xl" />
                  <div className="">start</div>
                </div>
              )}
            </div>
            <div ref={nextRef} className="w-full aspect-video col-start-2">
              {slideIndex < slideCount - 1 ? (
                <Page
                  key={`page-${nextSlideIndex}`}
                  pageIndex={nextSlideIndex}
                  className="w-full h-full"
                  width={nextWidth}
                  {...pageMessageProperties}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center">
                  <div className="i-tabler-circle-filled text-red text-4xl" />
                  <div className="">end</div>
                </div>
              )}
            </div>
          </Document>
          <div className="self-center grid grid-cols-2 gap-6">
            <button
              type="button"
              className="btn"
              onClick={() => {
                navPrevious();
              }}
            >
              <div className="i-tabler-circle-arrow-left w-9 h-9" />
            </button>
            <button
              type="button"
              className="btn"
              onClick={() => {
                navNext();
              }}
            >
              <div className="i-tabler-circle-arrow-right w-9 h-9" />
            </button>
            <button
              type="button"
              className="btn"
              onClick={() => {
                setSlideIndex(0);
              }}
            >
              <div className="i-tabler-circle-chevrons-left w-6 h-6" />
            </button>
            <button
              type="button"
              className="btn"
              onClick={() => {
                setSlideIndex(slideCount - 1);
              }}
            >
              <div className="i-tabler-circle-chevrons-right w-6 h-6" />
            </button>
            <button
              type="button"
              className="btn"
              onClick={() => {
                postConfettiBroadcastChannel();
              }}
            >
              <div className="i-tabler-confetti w-6 h-6 mr-2" />
              local
            </button>
            <button
              type="button"
              className="btn"
              onClick={() => {
                postConfettiBroadcastSupabase();
              }}
            >
              <div className="i-tabler-confetti w-6 h-6 mr-2" />
              supabase
            </button>
            <button
              type="button"
              className="btn col-span-2"
              onClick={() => {
                postConfettiResetBroadcastChannel();
              }}
            >
              <div className="i-tabler-circle-off w-6 h-6 mr-2" />
            </button>
          </div>
        </div>
      </div>
      <div className="overflow-x-hidden overflow-y-auto w-full h-full">
        <div className="flex flex-col gap-4">
          <div className="self-center w-full header">Speaker Notes</div>
          <div className="self-center grid grid-cols-3 gap-4">
            <button
              className="btn"
              type="button"
              onClick={() => {
                setTextSize(zoom(false));
              }}
            >
              <div className="i-tabler-zoom-out" />
            </button>
            <div className="flex justify-center items-center text-base">
              <div>{textSize.replace('text-', '')}</div>
            </div>
            <button
              className="btn"
              type="button"
              onClick={() => {
                setTextSize(zoom(true));
              }}
            >
              <div className="i-tabler-zoom-in" />
            </button>
          </div>
          <div className={clsx('p-2 prose max-w-full', textSize)}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {notes.get(slideIndex) ?? ''}
            </ReactMarkdown>
          </div>
        </div>
      </div>
      <ProgressBar slideIndex={slideIndex} slideCount={slideCount} />
    </div>
  );
}
