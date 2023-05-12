import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {Document, Page} from 'react-pdf';
import * as pdfjs from 'pdfjs-dist';
import {useMemo, type PropsWithChildren, useEffect, useState} from 'react';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import {useParams} from 'react-router-dom';
import {useSlideIndex} from './use-slide-index';
import './pdf.css';
import useKeys from './use-keys';
import useConfetti from './use-confetti';
import useBroadcastChannel from './use-broadcast-channel';
import useSearchParametersSlideIndex from './use-search-parameter-slide-index';
import useBroadcastSupaBase from './use-broadcast-supabase';
import {presentations} from './presentation-urls';
import useNotes from './use-notes';

const src = new URL('pdfjs-dist/build/pdf.worker.js', import.meta.url);
pdfjs.GlobalWorkerOptions.workerSrc = src.toString();

export default function Speaker() {
  const {presentationSlug} = useParams();
  const notes = useNotes(presentationSlug!);
  console.log('notes', notes);
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
    useBroadcastSupaBase,
  );

  function Message({children}: PropsWithChildren) {
    return (
      <div className="position-absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center">
        <div>{children}</div>
      </div>
    );
  }

  return (
    <div className="p-4 grid grid-cols-[auto_1fr] gap-5 w-screen h-screen overflow-hidden lt-sm:flex lt-sm:flex-col lt-sm:overflow-auto lt-sm:h-auto">
      <div className="flex flex-col gap-4 overflow-x-hidden overflow-y-auto resize-x w-md lt-sm:w-full">
        <div className="text-center">Slide: {slideIndex + 1}</div>
        <Document
          file={presentations[presentationSlug!]}
          className="grid grid-cols-2 gap-4 items-center"
          loading={<Message>Loading...</Message>}
          error={<Message>Loading failed.</Message>}
          noData={<Message>No PDF file found.</Message>}
          onLoadSuccess={(pdf) => {
            setSlideCount(pdf.numPages);
          }}
        >
          <Page
            key={`page-${slideIndex}`}
            pageIndex={slideIndex}
            className="w-full h-full col-span-2"
          />
          {slideIndex > 0 && (
            <Page
              key={`page-${prevSlideIndex}`}
              pageIndex={prevSlideIndex}
              className="w-full h-full pr-2"
            />
          )}
          {slideIndex < slideCount - 1 && (
            <Page
              key={`page-${nextSlideIndex}`}
              pageIndex={nextSlideIndex}
              className="w-full h-full pl-2"
            />
          )}
        </Document>
        <div className="grid grid-cols-2 gap-6">
          <button
            type="button"
            className="btn py-6"
            onClick={() => {
              navPrevious();
            }}
          >
            prev
          </button>
          <button
            type="button"
            className="btn py-6"
            onClick={() => {
              navNext();
            }}
          >
            next
          </button>
          <button
            type="button"
            className="btn"
            onClick={() => {
              setSlideIndex(0);
            }}
          >
            start
          </button>
          <button
            type="button"
            className="btn"
            onClick={() => {
              setSlideIndex(slideCount - 1);
            }}
          >
            end
          </button>
          <button
            type="button"
            className="btn py-6"
            onClick={() => {
              postConfettiBroadcastChannel({});
            }}
          >
            🎉 local
          </button>
          <button
            type="button"
            className="btn py-6"
            onClick={() => {
              postConfettiBroadcastSupaBase({});
            }}
          >
            🎉 supabase
          </button>
          <button
            type="button"
            className="btn py-6"
            onClick={() => {
              postConfettiReset({});
            }}
          >
            🚫
          </button>
        </div>
      </div>
      <div className="flex flex-col gap-4 overflow-x-hidden overflow-y-auto">
        <div className="text-center">Speaker Notes</div>
        <div className="text-sm p-2 prose">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {notes.get(slideIndex) ?? ''}
          </ReactMarkdown>
        </div>
      </div>
      {/* <div className="grid grid-cols-3 gap-4 content-start"> */}
      {/* </div> */}
    </div>
  );
}
