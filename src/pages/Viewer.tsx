import {useState, useEffect} from 'react';
import {Link, useParams} from 'react-router-dom';
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

  const shareUrl = `https://slidr.app/p/${presentation?.id ?? ''}?slide=${
    slideIndex + 1
  }`;

  const tweetText = `${presentation?.title ?? 'preentation'}${
    presentation?.username === undefined ? '' : ' by ' + presentation.username
  } ${shareUrl}`;

  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!copied) {
      return;
    }

    let handle: NodeJS.Timeout | undefined;
    handle = setTimeout(() => {
      handle = undefined;
      setCopied(false);
    }, 2000);

    return () => {
      if (handle !== undefined) {
        clearTimeout(handle);
      }
    };
  }, [copied]);

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
      <div className="flex flex-row justify-center gap-4 relative flex-wrap">
        <a
          href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
            tweetText,
          )}`}
          target="_blank"
          rel="noreferrer"
          className="flex flex-col items-center"
        >
          <button
            type="button"
            className="btn rounded-full w-[4rem] h-[4rem] flex items-center justify-center"
            title="Tweet this slide"
          >
            <div className="i-tabler-brand-twitter w-[2rem] h-[2rem]" />
          </button>
          <div className="text-sm">tweet</div>
        </a>
        <a
          href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
            shareUrl,
          )}`}
          target="_blank"
          className="flex flex-col items-center"
          rel="noreferrer"
        >
          <button
            type="button"
            className="btn rounded-full w-[4rem] h-[4rem] flex items-center justify-center"
            title="Post slide to LinkedIn"
          >
            <div className="i-tabler-brand-linkedin w-[2rem] h-[2rem]" />
          </button>
          <div className="text-sm">share</div>
        </a>
        <a
          href={`https://twitter.com/intent/tweet?text=${tweetText}`}
          className="flex flex-col items-center"
          onClick={(event) => {
            event.preventDefault();
            void window.navigator.clipboard.writeText(shareUrl);
            setCopied(true);
          }}
        >
          <button
            type="button"
            className="btn rounded-full w-[4rem] h-[4rem] flex items-center justify-center"
            title="Copy link to slide"
          >
            <div className="i-tabler-link w-[2rem] h-[2rem]" />
          </button>
          <div className="text-sm">{copied ? 'copied!' : 'copy'}</div>
        </a>
      </div>
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
