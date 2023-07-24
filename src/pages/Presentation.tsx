import {useState, useEffect, useMemo, useCallback} from 'react';
import QRCode from 'react-qr-code';
import {useSwipeable} from 'react-swipeable';
import {useSlideIndex} from '../components/slides/use-slide-index';
import useKeys from '../use-keys';
import useConfetti from '../components/confetti/use-confetti';
import useBroadcastChannel from '../components/broadcast/use-broadcast-channel';
import useSearchParametersSlideIndex from '../components/slides/use-search-parameter-slide-index';
import Confetti from '../components/confetti/Confetti';
import ProgressBar from '../components/ProgressBar';
import {
  useChannelHandlers,
  useCombinedHandlers,
} from '../components/broadcast/use-channel-handlers';
import {Reactions} from '../components/reactions/Reactions';
import useReactions from '../components/reactions/use-reactions';
import useRemoteReactions from '../components/reactions/use-remote-reactions';
import Toolbar from '../components/toolbar/Toolbar';
import {useSearchParametersSessionId} from '../use-search-parameter-session-id';
import Slideshow from '../components/slides/Slideshow';
import usePresentation from '../components/slides/use-presentation';
import useBroadcastFirebase from '../components/broadcast/use-broadcast-firestore';
import useClearReactions from '../components/reactions/use-clear-reactions';

function Presentation() {
  const presentation = usePresentation();

  useEffect(() => {
    document.title = `Slidr - ${
      presentation.data?.title ?? 'Unnamed Presentation'
    }`;
  }, [presentation]);

  const sessionId = useSearchParametersSessionId(true);

  // Sync the slide index with the broadcast channel (speaker view)
  const {
    handleIncomingBroadcast: handleIncomingBroadcastChannel,
    setHandlers: setHandlersBroadcastChannel,
  } = useChannelHandlers();
  const postBroadcastChannel = useBroadcastChannel({
    sessionId,
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
    slideCount: presentation.data?.pages?.length ?? 0,
  });
  useSearchParametersSlideIndex(setSlideIndex, slideIndex);

  // Broadcast the slide index with supabase
  const {
    handleIncomingBroadcast: handleIncomingBroadcastSupabase,
    setHandlers: setHandlersBroadcastSupabase,
  } = useChannelHandlers();
  const {postMessage: postBroadcastSupabase} = useBroadcastFirebase({
    sessionId,
    onIncoming: handleIncomingBroadcastSupabase,
  });
  const {setSlideIndex: setSupabaseSlideIndex} = useSlideIndex({
    postMessage: postBroadcastSupabase,
    slideCount: presentation.data?.pages?.length ?? 0,
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

  const {reactions, removeReaction, addReactions, clearReactions} =
    useReactions();
  const {handlers: handlersReactions} = useRemoteReactions({
    onReactions: addReactions,
  });

  // Listen, but don't post, confetti to the BroadcastChannel
  const {
    handlers: handlersConfettiBroadcastChannel,
    confettiReactions: confettiReactionsBroadcastChannel,
  } = useConfetti({});

  const {
    handlers: handlersConfettiBroadcastSupabase,
    confettiReactions: confettiReactionsFirebase,
    postConfetti,
  } = useConfetti({postMessage: postBroadcastSupabase});

  const throwConfetti = useCallback(() => {
    setFire({});
    postConfetti();
  }, [setFire, postConfetti]);

  const resetConfetti = useCallback(() => {
    setReset({});
  }, [setReset]);

  const {clearReactions: clearAllReaction, handlers: clearHandlers} =
    useClearReactions({
      postMessage: postBroadcastSupabase,
      setClearConfetti: resetConfetti,
      setClearIcons: clearReactions,
    });

  const confettiReactions = useMemo(
    () => [...confettiReactionsBroadcastChannel, ...confettiReactionsFirebase],
    [confettiReactionsBroadcastChannel, confettiReactionsFirebase],
  );

  useCombinedHandlers(
    setHandlersBroadcastChannel,
    handlersConfettiBroadcastChannel,
    handlersSlideIndexBroadcastChannel,
    clearHandlers,
  );
  useCombinedHandlers(
    setHandlersBroadcastSupabase,
    handlersConfettiBroadcastSupabase,
    handlersReactions,
    // Can't clear via firebase, right?
    // ClearHandlers,
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
        ['KeyR', clearAllReaction],
        ['KeyC', throwConfetti],
      ]),
    [openSpeakerWindow, clearAllReaction, throwConfetti, navNext, navPrevious],
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
          pages={presentation.data?.pages ?? []}
          forward={forward}
        />
      </div>
      <Confetti
        confettiReactions={confettiReactions}
        clear={reset}
        fire={fire}
      />
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
        slideCount={presentation.data?.pages?.length ?? 0}
      />
      <div
        className="position-absolute top-0 left-0 h-full w-full pointer-events-none"
        {...swipeHandlers}
      />
      {presentation && (
        <Toolbar
          presentation={presentation}
          onNext={navNext}
          onPrevious={navPrevious}
          onStart={() => {
            setSlideIndex(0);
          }}
          onEnd={() => {
            setSlideIndex((presentation.data?.pages?.length ?? 1) - 1);
          }}
        />
      )}
    </div>
  );
}

export default Presentation;
