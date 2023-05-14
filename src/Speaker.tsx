import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {Document, Page} from 'react-pdf';
import * as pdfjs from 'pdfjs-dist';
import {useMemo, useState, useCallback, useEffect} from 'react';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import {useParams} from 'react-router-dom';
import clsx from 'clsx';
import {useSlideIndex} from './use-slide-index';
import './pdf.css';
import useKeys from './use-keys';
import useConfetti from './use-confetti';
import useBroadcastChannel from './use-broadcast-channel';
import useSearchParametersSlideIndex from './use-search-parameter-slide-index';
import useBroadcastSupabase from './use-broadcast-supabase';
import {presentations} from './presentation-urls';
import useNotes from './use-notes';
import Loading from './Loading';
import Message from './Message';

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
  useEffect(() => {
    document.title = `Present - ${presentationSlug!} - Speaker`;
  }, [presentationSlug]);

  const notes = useNotes(presentationSlug!);

  const {
    slideIndex,
    setSlideIndex,
    nextSlideIndex,
    prevSlideIndex,
    setSlideCount,
    slideCount,
    navNext,
    navPrevious,
  } = useSlideIndex(useBroadcastChannel, presentationSlug!);
  useSearchParametersSlideIndex(setSlideIndex, slideIndex);
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
  const {postConfetti: postConfettiBroadcastChannel, postConfettiReset} =
    useConfetti(presentationSlug!, useBroadcastChannel);
  const {postConfetti: postConfettiBroadcastSupaBase} = useConfetti(
    presentationSlug!,
    useBroadcastSupabase,
  );
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

  return (
    <div className="p-4 grid grid-cols-[auto_1fr] gap-5 w-screen h-screen overflow-hidden lt-sm:flex lt-sm:flex-col lt-sm:overflow-auto lt-sm:h-auto">
      <div className="overflow-x-hidden overflow-y-auto sm:resize-x w-md lt-sm:w-full h-full">
        <div className="flex flex-col gap-4">
          <div className="text-center">Slide: {slideIndex + 1}</div>
          <Document
            file={presentations[presentationSlug!]}
            className="grid grid-cols-2 gap-4 items-center"
            loading={<Loading message="Loading pdf..." />}
            error={<Message>Loading PDF failed.</Message>}
            noData={<Message>No PDF file found.</Message>}
            onLoadSuccess={(pdf) => {
              setSlideCount(pdf.numPages);
            }}
          >
            <Page
              key={`page-${slideIndex}`}
              pageIndex={slideIndex}
              className="w-full col-span-2"
              loading={<Loading message="Loading page..." />}
              error={<Message>Failed to load page.</Message>}
            />
            {slideIndex > 0 && (
              <Page
                key={`page-${prevSlideIndex}`}
                pageIndex={prevSlideIndex}
                className="w-full pr-2"
                loading={<Loading message="Loading page..." />}
                error={<Message>Failed to load page.</Message>}
              />
            )}
            {slideIndex < slideCount - 1 && (
              <Page
                key={`page-${nextSlideIndex}`}
                pageIndex={nextSlideIndex}
                className="w-full pl-2"
                loading={<Loading message="Loading page..." />}
                error={<Message>Failed to load page.</Message>}
              />
            )}
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
                postConfettiBroadcastChannel({});
              }}
            >
              <div className="i-tabler-confetti w-6 h-6 mr-2" />
              local
            </button>
            <button
              type="button"
              className="btn"
              onClick={() => {
                postConfettiBroadcastSupaBase({});
              }}
            >
              <div className="i-tabler-confetti w-6 h-6 mr-2" />
              supabase
            </button>
            <button
              type="button"
              className="btn col-span-2"
              onClick={() => {
                postConfettiReset({});
              }}
            >
              <div className="i-tabler-circle-off w-6 h-6 mr-2" />
            </button>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-4 overflow-x-hidden overflow-y-auto">
        <div className="self-center">Speaker Notes</div>
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
        <div className={clsx('p-2 prose', textSize)}>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {notes.get(slideIndex) ?? ''}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
