import {Document, Page} from 'react-pdf';
import * as pdfjs from 'pdfjs-dist';
import {useState, useEffect, useRef} from 'react';
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
import {pageMessageProperties, pdfMessageProperties} from './PdfMessages';
import ProgressBar from './ProgressBar';
import {useChannelHandlers, useCombinedHandlers} from './use-channel-handlers';
import useRemoteReactions from './use-remote-reactions';
import useReactions from './use-reactions';
import Reactions from './Reactions';
import ReactionControls from './ReactionControls';

const src = new URL('pdfjs-dist/build/pdf.worker.js', import.meta.url);
pdfjs.GlobalWorkerOptions.workerSrc = src.toString();

export default function Viewer() {
  // Determine the presentation and update the page title
  const {presentationSlug} = useParams();

  if (presentations[presentationSlug!] === undefined) {
    // Intentionally throw so we can show our error page
    throw new Error(`Presentation '${presentationSlug!}' does not exist`);
  }

  useEffect(() => {
    document.title = `Present - ${presentationSlug!} - Audience`;
  }, [presentationSlug]);

  // Setup supabase broadcast channel
  const {handleIncomingBroadcast, setHandlers} = useChannelHandlers();
  const postBroadcastMessage = useBroadcastSupabase({
    channelId: presentationSlug!,
    onIncoming: handleIncomingBroadcast,
  });

  // Track the slide index from the broadcast channel
  const {
    setSlideCount,
    slideIndex,
    setSlideIndex,
    slideCount,
    handlers: slideIndexHandlers,
  } = useSlideIndex({
    postMessage: postBroadcastMessage,
    ignorePost: true,
  });
  useSearchParametersSlideIndex(setSlideIndex, slideIndex);

  // Configure the confetti to use the broadcast channel
  const [fire, setFire] = useState<boolean | Record<string, unknown>>(false);
  const {postConfetti, handlers: confettiHandlers} = useConfetti({
    postMessage: postBroadcastMessage,
    onConfetti: setFire,
  });

  // Configure reaction broadcasting
  const {reactions, removeReaction, addReaction} = useReactions();
  const {postReaction, handlers: handlersReactions} = useRemoteReactions({
    postMessage: postBroadcastMessage,
    onReaction: addReaction,
  });

  // Combine all of the incoming message handlers
  useCombinedHandlers(
    setHandlers,
    confettiHandlers,
    slideIndexHandlers,
    handlersReactions,
  );

  // Optimize the rendering of pdf pages by tracking the container width
  const pdfRef = useRef<HTMLDivElement>(null);
  const pdfWidth = pdfRef.current?.clientWidth;

  return (
    <div className="flex flex-col gap-4 p-4 position-relative overflow-x-hidden overflow-y-auto min-h-screen">
      <div ref={pdfRef} className="max-w-2xl mx-auto w-full">
        <Document
          className="w-full aspect-video"
          file={presentations[presentationSlug!]}
          {...pdfMessageProperties}
          onLoadSuccess={(pdf) => {
            setSlideCount(pdf.numPages);
          }}
        >
          <Page
            key={`page-${slideIndex}`}
            className="w-full h-full"
            pageIndex={slideIndex}
            width={pdfWidth}
            {...pageMessageProperties}
          />
        </Document>
      </div>

      <Confetti fire={fire} />
      <Reactions reactions={reactions} removeReaction={removeReaction} />
      <ReactionControls
        handleConfetti={() => {
          setFire({});
          postConfetti();
        }}
        handleReaction={(icon) => {
          addReaction(icon);
          postReaction(icon);
        }}
      />
      <div className="prose text-center relative self-center">
        <a href="https://devrel.codyfactory.eu">
          <button type="button" className="btn">
            Learn More
          </button>
        </a>
      </div>
      <ProgressBar slideIndex={slideIndex} slideCount={slideCount} />
    </div>
  );
}
