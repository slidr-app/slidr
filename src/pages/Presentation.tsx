import {useState, useEffect, useMemo, useCallback} from 'react';
import QRCode from 'react-qr-code';
import {useParams} from 'react-router-dom';
import {useSwipeable} from 'react-swipeable';
import {useSlideIndex} from '../components/slides/use-slide-index';
import useKeys from '../use-keys';
import useConfetti from '../components/confetti/use-confetti';
import useBroadcastChannel from '../components/broadcast/use-broadcast-channel';
import useSearchParametersSlideIndex from '../components/slides/use-search-parameter-slide-index';
import useBroadcastSupabase from '../components/broadcast/use-broadcast-supabase';
import Confetti from '../components/confetti/Confetti';
import ProgressBar from '../components/ProgressBar';
import {
  useChannelHandlers,
  useCombinedHandlers,
} from '../components/broadcast/use-channel-handlers';
import Reactions from '../components/reactions/Reactions';
import useReactions from '../components/reactions/use-reactions';
import useRemoteReactions from '../components/reactions/use-remote-reactions';
import Toolbar from '../components/Toolbar';
import {useSearchParametersSessionId} from '../use-search-parameter-session-id';
import Disconnected from '../components/Disconnected';
import Slideshow from '../components/Slideshow';
import usePresentation from '../components/slides/use-presentation';

function Presentation() {
  const {presentationId} = useParams();
  const presentation = usePresentation();

  useEffect(() => {
    document.title = `Slidr - ${presentation?.title ?? 'Unnamed Presentation'}`;
  }, [presentation]);

  // Const [forward, setForward] = useState<boolean>(true);
  const sessionId = useSearchParametersSessionId(true);

  // Sync the slide index with the broadcast channel (speaker view)
  const {
    handleIncomingBroadcast: handleIncomingBroadcastChannel,
    setHandlers: setHandlersBroadcastChannel,
  } = useChannelHandlers();
  const postBroadcastChannel = useBroadcastChannel({
    channelId: presentationId!,
    onIncoming: handleIncomingBroadcastChannel,
  });
  const {
    slideIndex,
    setSlideIndex,
    navNext,
    navPrevious,
    handlers: handlersSlideIndexBroadcastChannel,
    forward,
  } = useSlideIndex({
    postMessage: postBroadcastChannel,
    slideCount: presentation?.pages?.length ?? 0,
  });
  useSearchParametersSlideIndex(setSlideIndex, slideIndex);

  // Broadcast the slide index with supabase
  const {
    handleIncomingBroadcast: handleIncomingBroadcastSupabase,
    setHandlers: setHandlersBroadcastSupabase,
  } = useChannelHandlers();
  const {
    postMessage: postBroadcastSupabase,
    paused,
    unPause,
  } = useBroadcastSupabase({
    channelId: presentationId!,
    sessionId,
    onIncoming: handleIncomingBroadcastSupabase,
    // Pause the presentation view after 1 hour
    idleTimeout: 60 * 60 * 1000,
    heartbeatData: {index: slideIndex},
  });
  const {setSlideIndex: setSupabaseSlideIndex} = useSlideIndex({
    postMessage: postBroadcastSupabase,
    slideCount: presentation?.pages?.length ?? 0,
  });
  useEffect(() => {
    setSupabaseSlideIndex(slideIndex);
  }, [slideIndex, setSupabaseSlideIndex]);

  const openSpeakerWindow = useCallback(
    () =>
      window.open(
        `${window.location.origin}/s/${presentation?.id ?? ''}${
          window.location.search
        }`,
        undefined,
        'popup',
      ),
    [presentation?.id],
  );

  const [fire, setFire] = useState<boolean | Record<string, unknown>>(false);
  const [reset, setReset] = useState<boolean | Record<string, unknown>>(false);
  const throwConfetti = useCallback(() => {
    setFire({});
  }, [setFire]);

  const {reactions, removeReaction, addReaction, clearReactions} =
    useReactions();
  const {handlers: handlersReactions} = useRemoteReactions({
    onReaction: addReaction,
  });
  const resetAllReactions = useCallback(() => {
    setReset({});
    clearReactions();
  }, [setReset, clearReactions]);

  const {handlers: handlersConfettiBroadcastChannel} = useConfetti({
    postMessage: postBroadcastChannel,
    onConfetti: setFire,
    onReset: resetAllReactions,
  });

  const {handlers: handlersConfettiBroadcastSupabase} = useConfetti({
    onConfetti: setFire,
  });

  useCombinedHandlers(
    setHandlersBroadcastChannel,
    handlersConfettiBroadcastChannel,
    handlersSlideIndexBroadcastChannel,
  );
  useCombinedHandlers(
    setHandlersBroadcastSupabase,
    handlersConfettiBroadcastSupabase,
    handlersReactions,
  );

  // Swipe and key bindings
  const swipeHandlers = useSwipeable({
    onSwipedRight() {
      navPrevious();
    },
    onSwipedLeft() {
      navNext();
    },
  });

  const keyHandlers = useMemo(
    () =>
      new Map([
        ['ArrowLeft', navPrevious],
        ['ArrowRight', navNext],
        ['Space', navNext],
        ['KeyS', openSpeakerWindow],
        ['KeyR', resetAllReactions],
        ['KeyC', throwConfetti],
      ]),
    [openSpeakerWindow, resetAllReactions, throwConfetti, navNext, navPrevious],
  );
  useKeys(keyHandlers);

  return (
    <div
      className="h-screen flex flex-col items-center justify-center overflow-hidden position-relative select-none"
      onClick={() => {
        navNext();
      }}
    >
      <div className="w-full max-w-[calc(100vh_*_(16/9))] aspect-video">
        <Slideshow
          pageIndex={slideIndex}
          pages={presentation?.pages ?? []}
          forward={forward}
        />
      </div>
      <Confetti fire={fire} reset={reset} />
      <Reactions reactions={reactions} removeReaction={removeReaction} />
      {/* Inspired from https://stackoverflow.com/a/44233700 */}
      <div className="pointer-events-none position-fixed top-1rem w-10rem h-[calc(100%_-_10rem_-_2rem)] right-4 animate-longbounce 2xl:w-12rem 2xl:h-[calc(100%_-_12rem_-_2rem)] lt-sm:w-8rem lt-sm:h-[calc(100%_-_8rem_-_2rem)] z-2">
        <div className=" bg-white p-2 w-10rem h-10rem 2xl:w-12rem 2xl:h-12rem lt-sm:w-8rem lt-sm:h-8rem">
          <QRCode
            value={`${window.location.origin}/i/${presentation?.id ?? ''}${
              window.location.search
            }`}
            className="w-full h-full"
            style={{width: '100%', height: 'auto', maxWidth: '100%'}}
          />
        </div>
      </div>
      <ProgressBar
        slideIndex={slideIndex}
        slideCount={presentation?.pages?.length ?? 0}
      />
      <div
        className="position-absolute top-0 left-0 h-full w-full pointer-events-none"
        {...swipeHandlers}
      />
      <Disconnected paused={paused} unPause={unPause} />
      {presentation && (
        <Toolbar
          presentation={presentation}
          onNext={navNext}
          onPrevious={navPrevious}
          onStart={() => {
            setSlideIndex(0);
          }}
          onEnd={() => {
            setSlideIndex((presentation?.pages?.length ?? 1) - 1);
          }}
        />
      )}
    </div>
  );
}

export default Presentation;
