import {useState, useEffect} from 'react';
import {Link, useParams} from 'react-router-dom';
import useConfetti from '../components/confetti/use-confetti';
import {useSlideIndex} from '../components/slides/use-slide-index';
import useBroadcastSupabase from '../components/broadcast/use-broadcast-supabase';
import useSearchParametersSlideIndex from '../components/slides/use-search-parameter-slide-index';
import Confetti from '../components/confetti/Confetti';
import ProgressBar from '../components/ProgressBar';
import {
  useChannelHandlers,
  useCombinedHandlers,
} from '../components/broadcast/use-channel-handlers';
import useRemoteReactions from '../components/reactions/use-remote-reactions';
import useReactions from '../components/reactions/use-reactions';
import Reactions from '../components/reactions/Reactions';
import ReactionControls from '../components/reactions/ReactionControls';
import {useSearchParametersSessionId} from '../use-search-parameter-session-id';
import Disconnected from '../components/Disconnected';
import Slideshow from '../components/slides/Slideshow';
import usePresentation from '../components/slides/use-presentation';
import Shares from '../components/Shares';

export default function Audience() {
  const {presentationId} = useParams();
  const presentation = usePresentation();

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
    <div className="flex flex-col gap-8 p-4 position-relative overflow-x-hidden overflow-y-auto min-h-screen items-center">
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
      <Shares presentation={presentation} slideIndex={slideIndex} />
      <div className="flex flex-col items-center relative gap-1 prose">
        <Link to="/" className="not-prose">
          slidr.app
        </Link>
        <a
          href="https://devrel.codyfactory.eu"
          target="_blank"
          title="Learn more about me"
          rel="noreferrer"
          className="prose text-sm"
        >
          {/* <button type="button" className="btn text-sm"> */}
          learn more
          {/* </button> */}
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
