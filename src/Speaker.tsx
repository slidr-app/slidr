import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {Document, Page} from 'react-pdf';
import * as pdfjs from 'pdfjs-dist';
import {type PropsWithChildren} from 'react';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import {useSlideIndex} from './use-slide-index';
import './pdf.css';
import useArrowKeys from './use-arrow-keys';
import useConfetti from './use-confetti';
import useBroadcastChannel from './use-broadcast-channel';
import useSearchParametersSlideIndex from './use-search-parameter-slide-index';
import useBroadcastSupaBase from './use-broadcast-supabase';

const src = new URL('pdfjs-dist/build/pdf.worker.js', import.meta.url);
pdfjs.GlobalWorkerOptions.workerSrc = src.toString();

const markdown = `# Start here

- Just a link: https://reactjs.com.
- some other stuff
- and even more

This is how **it works**.
`;

export default function Speaker({slideUrl}: {slideUrl: string}) {
  const {
    slideIndex,
    setSlideIndex,
    nextSlideIndex,
    prevSlideIndex,
    setSlideCount,
    slideCount,
    navNext,
    navPrevious,
  } = useSlideIndex(useBroadcastChannel, slideUrl);
  useSearchParametersSlideIndex(setSlideIndex, slideIndex);
  useArrowKeys(navPrevious, navNext);
  const postConfettiBroadcastChannel = useConfetti(
    slideUrl,
    useBroadcastChannel,
  );
  const postConfettiBroadcastSupaBase = useConfetti(
    slideUrl,
    useBroadcastSupaBase,
  );

  const Message = ({children}: PropsWithChildren) => (
    <div className="position-absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center">
      <div>{children}</div>
    </div>
  );

  return (
    <div className="p-4 grid grid-cols-[auto_1fr] gap-5 w-screen h-screen overflow-hidden lt-sm:flex lt-sm:flex-col lt-sm:overflow-auto lt-sm:h-auto">
      <div className="flex flex-col gap-4 overflow-x-hidden overflow-y-auto resize-x w-md lt-sm:w-full">
        <div className="text-center">Slide: {slideIndex}</div>
        <Document
          file={slideUrl}
          onLoadSuccess={(pdf) => {
            setSlideCount(pdf.numPages);
          }}
          className="grid grid-cols-2 gap-4 items-center"
          loading={<Message>Loading...</Message>}
          error={<Message>Loading failed.</Message>}
          noData={<Message>No PDF file found.</Message>}
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
            className="btn py-6"
            onClick={() => {
              navPrevious();
            }}
          >
            prev
          </button>
          <button
            className="btn py-6"
            onClick={() => {
              navNext();
            }}
          >
            next
          </button>
          <button
            onClick={() => {
              setSlideIndex(0);
            }}
            className="btn"
          >
            start
          </button>
          <button
            onClick={() => {
              setSlideIndex(slideCount - 1);
            }}
            className="btn"
          >
            end
          </button>
          <button
            onClick={() => {
              postConfettiBroadcastChannel({});
            }}
            className="btn py-6"
          >
            🎉 local
          </button>
          <button
            onClick={() => {
              postConfettiBroadcastSupaBase({});
            }}
            className="btn py-6"
          >
            🎉 supabase
          </button>
        </div>
      </div>
      <div className="flex flex-col gap-4 overflow-x-hidden overflow-y-auto">
        <div className="text-center">Speaker Notes</div>
        <div className="p-2 prose">
          <ReactMarkdown children={markdown} remarkPlugins={[remarkGfm]} />
        </div>
      </div>
      {/* <div className="grid grid-cols-3 gap-4 content-start"> */}
      {/* </div> */}
    </div>
  );
}
