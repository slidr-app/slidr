import {useState, useEffect} from 'react';
import {useParams} from 'react-router-dom';
import useConfetti from '../confetti/use-confetti';
import {useSlideIndex} from '../slides/use-slide-index';
import useBroadcastSupabase from '../broadcast/use-broadcast-supabase';
import useSearchParametersSlideIndex from '../slides/use-search-parameter-slide-index';
import Confetti from '../confetti/Confetti';
import ProgressBar from '../components/ProgressBar';
import {
  useChannelHandlers,
  useCombinedHandlers,
} from '../broadcast/use-channel-handlers';
import useRemoteReactions from '../reactions/use-remote-reactions';
import useReactions from '../reactions/use-reactions';
import Reactions from '../reactions/Reactions';
import ReactionControls from '../reactions/ReactionControls';
import {useSearchParametersSessionId} from '../use-search-parameter-session-id';
import Disconnected from '../components/Disconnected';
import Slideshow from '../components/Slideshow';
import usePresentation from '../use-presentation';

export default function Viewer() {
  const {presentationId} = useParams();
  const presentation = usePresentation(presentationId);

  useEffect(() => {
    document.title = `Slidr - ${
      presentation?.title ?? 'Unnamed Presentation'
    } - Audience`;
  }, [presentation]);

  const sessionId = useSearchParametersSessionId();

  // Setup supabase broadcast channel
  const {handleIncomingBroadcast, setHandlers} = useChannelHandlers();
  const {
    postMessage: postBroadcastMessage,
    connected: connectedSupabase,
    paused,
    unPause,
  } = useBroadcastSupabase({
    channelId: presentationId!,
    sessionId,
    onIncoming: handleIncomingBroadcast,
    // Pause supabase after 5 mins of inactivity (no reactions)
    // Visibility changes will automatically reconnect
    idleTimeout: 5 * 60 * 1000,
  });

  console.log({connectedSupabase});
  // Track the slide index from the broadcast channel
  const {
    slideIndex,
    setSlideIndex,
    handlers: slideIndexHandlers,
  } = useSlideIndex({
    postMessage: postBroadcastMessage,
    ignorePost: true,
    slideCount: presentation?.pages?.length ?? 0,
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

  return (
    <div className="flex flex-col gap-4 p-4 position-relative overflow-x-hidden overflow-y-auto min-h-screen">
      <div className="max-w-2xl mx-auto w-full">
        <Slideshow pageIndex={slideIndex} pages={presentation?.pages ?? []} />
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
      <ProgressBar
        slideIndex={slideIndex}
        slideCount={presentation?.pages?.length ?? 0}
      />
      <Disconnected paused={paused} unPause={unPause} />
    </div>
  );
}
