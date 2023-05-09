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
import useConfetti from './use-confetti-supabase';
import useBroadcastChannel from './use-broadcast-channel';
import useSearchParametersSlideIndex from './use-search-parameter-slide-index';

const src = new URL('pdfjs-dist/build/pdf.worker.js', import.meta.url);
pdfjs.GlobalWorkerOptions.workerSrc = src.toString();

const markdown = `# Start here

- Just a link: https://reactjs.com.
- some other stuff
- and even more

This is how **it works**.
`;

export default function Speaker() {
  const {
    slideIndex,
    setSlideIndex,
    nextSlideIndex,
    prevSlideIndex,
    setSlideCount,
    slideCount,
    navNext,
    navPrevious,
  } = useSlideIndex(useBroadcastChannel);

  useSearchParametersSlideIndex(setSlideIndex, slideIndex);

  useArrowKeys(navPrevious, navNext);
  const postConfetti = useConfetti();

  console.log({slideIndex});

  const Message = ({children}: PropsWithChildren) => (
    <div className="position-absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center">
      <div>{children}</div>
    </div>
  );

  return (
    <div className="m-2 grid grid-cols-2 grid-rows-[auto_1fr] gap-2 h-screen">
      <div className="col-span-2 p-2">Current Slide: {slideIndex}</div>
      <div className="grid grid-cols-3 p-2 gap-4 content-start">
        <Document
          file={'/oss.pdf'}
          onLoadSuccess={(pdf) => {
            setSlideCount(pdf.numPages);
          }}
          className="col-span-3 grid grid-cols-3 gap-2 w-full"
          loading={<Message>Loading...</Message>}
          error={<Message>Loading failed.</Message>}
          noData={<Message>No PDF file found.</Message>}
        >
          {slideIndex > 0 && (
            <Page
              key={`page-${prevSlideIndex}`}
              pageIndex={prevSlideIndex}
              className="col-start-1 w-full h-full scale-75"
            />
          )}
          <Page
            key={`page-${slideIndex}`}
            pageIndex={slideIndex}
            className="col-start-2 w-full h-full"
          />
          {slideIndex < slideCount - 1 && (
            <Page
              key={`page-${nextSlideIndex}`}
              pageIndex={nextSlideIndex}
              className="col-start-3 w-full h-full scale-75"
            />
          )}
        </Document>
        <button
          className="col-start-1 btn m-2"
          onClick={() => {
            navPrevious();
          }}
        >
          Prev
        </button>
        <button
          className="col-start-3 btn m-2"
          onClick={() => {
            navNext();
          }}
        >
          Next
        </button>
        <button
          onClick={() => {
            setSlideIndex(0);
          }}
          className="col-start-1 btn m-2"
        >
          Start
        </button>
        <button
          onClick={() => {
            setSlideIndex(slideCount - 1);
          }}
          className="col-start-3 btn m-2"
        >
          End
        </button>
        <button onClick={postConfetti} className="col-start-2 btn m-2">
          Boom
        </button>
      </div>
      <div className="p-2 prose">
        <ReactMarkdown children={markdown} remarkPlugins={[remarkGfm]} />
      </div>
    </div>
  );
}
