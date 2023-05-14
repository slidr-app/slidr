import {Document, Page} from 'react-pdf';
import * as pdfjs from 'pdfjs-dist';
import {useState, useEffect} from 'react';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import {useParams} from 'react-router-dom';
import useConfetti from './use-confetti';
import './pdf.css';
import {useSlideIndex} from './use-slide-index';
import useBroadcastSupabase from './use-broadcast-supabase';
import useSearchParametersSlideIndex from './use-search-parameter-slide-index';
import Confetti from './Confetti';
import {presentations} from './presentation-urls';
import Loading from './Loading';
import Message from './Message';

const src = new URL('pdfjs-dist/build/pdf.worker.js', import.meta.url);
pdfjs.GlobalWorkerOptions.workerSrc = src.toString();

export default function Viewer() {
  const {presentationSlug} = useParams();
  useEffect(() => {
    document.title = `Present - ${presentationSlug!} - Audience`;
  }, [presentationSlug]);
  const [fire, setFire] = useState<boolean | Record<string, unknown>>(false);
  const {postConfetti} = useConfetti(
    presentationSlug!,
    useBroadcastSupabase,
    setFire,
  );
  const {setSlideCount, slideIndex, setSlideIndex} = useSlideIndex(
    useBroadcastSupabase,
    presentationSlug!,
    true,
  );
  useSearchParametersSlideIndex(setSlideIndex, slideIndex);

  return (
    <div className="flex flex-col gap-4 p-4 position-relative overflow-x-hidden overflow-y-auto min-h-screen">
      <div className="max-w-2xl mx-auto">
        <Document
          className="w-full aspect-video"
          file={presentations[presentationSlug!]}
          loading={<Loading message="Loading pdf..." />}
          error={<Message>Loading PDF failed.</Message>}
          noData={<Message>No PDF file found.</Message>}
          onLoadSuccess={(pdf) => {
            setSlideCount(pdf.numPages);
          }}
        >
          <Page
            key={`page-${slideIndex}`}
            className="w-full h-full"
            pageIndex={slideIndex}
            loading={<Loading message="Loading page..." />}
            error={<Message>Failed to load page.</Message>}
          />
        </Document>
      </div>

      <Confetti fire={fire} />
      <div className="max-w-lg mx-auto flex flex-col gap-4">
        <button
          type="button"
          className="btn position-relative"
          onClick={() => {
            setFire({});
            postConfetti({});
          }}
        >
          <div className="i-tabler-confetti w-8 h-8" />
        </button>
        <div className="prose text-center position-relative">
          <a href="https://devrel.codyfactory.eu">Learn more</a>
        </div>
      </div>
    </div>
  );
}
