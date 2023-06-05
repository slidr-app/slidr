import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {useMemo, useState, useCallback, useEffect} from 'react';
import {useParams} from 'react-router-dom';
import clsx from 'clsx';
import {useSwipeable} from 'react-swipeable';
import {useSlideIndex} from '../slides/use-slide-index';
import useKeys from '../use-keys';
import useConfetti from '../confetti/use-confetti';
import useBroadcastChannel from '../broadcast/use-broadcast-channel';
import useSearchParametersSlideIndex from '../slides/use-search-parameter-slide-index';
import useBroadcastSupabase from '../broadcast/use-broadcast-supabase';
import useNotes from '../slides/use-notes';
import ProgressBar from '../components/ProgressBar';
import {
  useChannelHandlers,
  useCombinedHandlers,
} from '../broadcast/use-channel-handlers';
import ReactionControls from '../reactions/ReactionControls';
import useRemoteReactions from '../reactions/use-remote-reactions';
import Timer from '../components/Timer';
import {useSearchParametersSessionId} from '../use-search-parameter-session-id';
import Disconnected from '../components/Disconnected';
import usePresentation from '../use-presentation';
import Slideshow from '../components/Slideshow';

const textSizes = [
  'text-xs',
  'text-sm',
  'text-base',
  'text-lg',
  'text-xl',
  'text-2xl',
  'text-3xl',
  'text-4xl',
  'text-5xl',
  'text-6xl',
  'text-7xl',
  'text-8xl',
];

export default function Speaker() {
  const {presentationId} = useParams();
  const presentation = usePresentation(presentationId);

  useEffect(() => {
    document.title = `Present - ${
      presentation?.title ?? 'Unnamed Presentation'
    } - Speaker`;
  }, [presentation]);

  const sessionId = useSearchParametersSessionId();

  const notes = useNotes(presentationId!);

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
  } = useSlideIndex({
    postMessage: postBroadcastChannel,
    slideCount: presentation?.pages?.length ?? 0,
  });
  useCombinedHandlers(
    setHandlersBroadcastChannel,
    handlersSlideIndexBroadcastChannel,
  );
  useSearchParametersSlideIndex(setSlideIndex, slideIndex);

  // We fire and reset confetti on the broadcast channel (ignoring incoming confetti)
  const {postConfettiReset: postConfettiResetBroadcastChannel} = useConfetti({
    postMessage: postBroadcastChannel,
  });
  const {
    postMessage: postBroadcastSupabase,
    paused,
    unPause,
  } = useBroadcastSupabase({
    channelId: presentationId!,
    sessionId,
    // Pause the speaker view after 1 hour
    idleTimeout: 60 * 60 * 1000,
  });
  // We fire confetti on the supabase channel (never reset, ignore incoming confetti)
  const {postConfetti: postConfettiBroadcastSupabase} = useConfetti({
    postMessage: postBroadcastSupabase,
  });
  const {postReaction} = useRemoteReactions({
    postMessage: postBroadcastSupabase,
  });

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
      ]),
    [navPrevious, navNext],
  );
  useKeys(keyHandlers);

  // Speaker note sizes
  const [textSize, setTextSize] = useState('text-base');
  const zoom = useCallback((zoomIn: boolean) => {
    return (currentSize: string) => {
      const currentIndex = textSizes.indexOf(currentSize);
      if (currentIndex === -1) {
        return 'text-base';
      }

      const nextIndex = Math.min(
        Math.max(currentIndex + (zoomIn ? 1 : -1), 0),
        textSizes.length - 1,
      );
      return textSizes[nextIndex];
    };
  }, []);

  return (
    <div
      className="p-4 pt-0 grid grid-cols-[auto_1fr] gap-5 h-screen overflow-hidden lt-sm:(flex flex-col overflow-auto h-auto w-full)"
      {...swipeHandlers}
    >
      <div className="flex flex-col overflow-x-hidden overflow-y-auto sm:resize-x w-md lt-sm:w-full">
        <div className="flex flex-col gap-4">
          <div className="w-full header flex flex-row gap-4 justify-evenly">
            <div>
              Slide:{' '}
              <span className="font-bold font-mono">{slideIndex + 1}</span>
            </div>
            <div>
              <Timer />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Slideshow
                pages={presentation?.pages ?? []}
                pageIndex={slideIndex}
              />
            </div>
            <div className="w-full aspect-video col-start-1">
              {slideIndex > 0 ? (
                <Slideshow
                  pages={presentation?.pages ?? []}
                  pageIndex={slideIndex - 1}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center">
                  <div className="i-tabler-circle-filled text-green text-4xl" />
                  <div className="">start</div>
                </div>
              )}
            </div>
            <div className="w-full aspect-video col-start-2">
              {slideIndex < (presentation?.pages?.length ?? 1) - 1 ? (
                <Slideshow
                  pages={presentation?.pages ?? []}
                  pageIndex={slideIndex + 1}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center">
                  <div className="i-tabler-circle-filled text-red text-4xl" />
                  <div className="">end</div>
                </div>
              )}
            </div>
          </div>
          <div className="self-center flex flex-col gap-6">
            <div className="grid grid-cols-2 gap-6">
              <button
                type="button"
                className="btn"
                onClick={() => {
                  navPrevious();
                }}
              >
                <div className="i-tabler-circle-arrow-left w-9 h-9" />
              </button>
              <button
                type="button"
                className="btn"
                onClick={() => {
                  navNext();
                }}
              >
                <div className="i-tabler-circle-arrow-right w-9 h-9" />
              </button>
              <button
                type="button"
                className="btn"
                onClick={() => {
                  setSlideIndex(0);
                }}
              >
                <div className="i-tabler-circle-chevrons-left w-6 h-6" />
              </button>
              <button
                type="button"
                className="btn"
                onClick={() => {
                  setSlideIndex((presentation?.pages?.length ?? 1) - 1);
                }}
              >
                <div className="i-tabler-circle-chevrons-right w-6 h-6" />
              </button>
            </div>
            <ReactionControls
              handleConfetti={postConfettiBroadcastSupabase}
              handleReaction={postReaction}
            />
            <button
              type="button"
              className="btn"
              onClick={() => {
                postConfettiResetBroadcastChannel();
              }}
            >
              <div className="i-tabler-circle-off w-6 h-6 mr-2" />
            </button>
          </div>
        </div>
      </div>
      <div className="overflow-x-hidden overflow-y-auto w-full h-full">
        <div className="flex flex-col gap-4">
          <div className="self-center w-full header">Speaker Notes</div>
          <div className="self-center flex flex-row gap-4 flex-wrap">
            <button
              className="btn flex-shrink-0"
              type="button"
              onClick={() => {
                setTextSize(zoom(true));
              }}
            >
              <div className="i-tabler-zoom-in" />
            </button>
            <div className="flex justify-center items-center text-base flex-shrink-0">
              <div>{textSize.replace('text-', '')}</div>
            </div>
            <button
              className="btn flex-shrink-0"
              type="button"
              onClick={() => {
                setTextSize(zoom(false));
              }}
            >
              <div className="i-tabler-zoom-out" />
            </button>
          </div>
          <div className={clsx('p-2 prose max-w-full', textSize)}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {notes.get(slideIndex) ?? ''}
            </ReactMarkdown>
          </div>
        </div>
      </div>
      <ProgressBar
        slideIndex={slideIndex}
        slideCount={presentation?.pages?.length ?? 0}
      />
      <Disconnected paused={paused} unPause={unPause} />
    </div>
  );
}
