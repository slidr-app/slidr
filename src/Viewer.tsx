import {Document, Page} from 'react-pdf';
import * as pdfjs from 'pdfjs-dist';
import {type PropsWithChildren} from 'react';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import useConfetti from './use-confetti-supabase';
import './pdf.css';
import {useSlideIndex} from './use-slide-index';
import useBroadcastSupaBase from './use-broadcast-supabase';
import useSearchParametersSlideIndex from './use-search-parameter-slide-index';

const src = new URL('pdfjs-dist/build/pdf.worker.js', import.meta.url);
pdfjs.GlobalWorkerOptions.workerSrc = src.toString();

export default function Viewer() {
  const postConfetti = useConfetti();
  const {setSlideCount, slideIndex, setSlideIndex} = useSlideIndex(
    useBroadcastSupaBase,
    true,
  );
  useSearchParametersSlideIndex(setSlideIndex, slideIndex);

  const Message = ({children}: PropsWithChildren) => (
    <div className="w-full h-full flex flex-col items-center justify-center">
      <div>{children}</div>
    </div>
  );

  return (
    <div className="max-w-md mx-auto flex flex-col justify-center gap-4 py-2">
      <Document
        className="w-full aspect-video"
        file={'/oss.pdf'}
        onLoadSuccess={(pdf) => {
          setSlideCount(pdf.numPages);
        }}
        loading={<Message>Loading...</Message>}
        error={<Message>Loading failed.</Message>}
        noData={<Message>No PDF file found.</Message>}
      >
        <Page
          className="w-full h-full"
          key={`page-${slideIndex}`}
          pageIndex={slideIndex}
        />
      </Document>
      <button className="btn" onClick={postConfetti}>
        Boom 🎉
      </button>

      <div className="prose text-center">
        <a href="https://devrel.codyfactory.eu">Learn more</a>
      </div>
    </div>
  );
}
