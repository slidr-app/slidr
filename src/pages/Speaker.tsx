import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {useMemo, useState, useCallback, useEffect} from 'react';
import clsx from 'clsx';
import {useSwipeable} from 'react-swipeable';
import {useSlideIndex} from '../components/slides/use-slide-index';
import useKeys from '../use-keys';
import useConfetti from '../components/confetti/use-confetti';
import useBroadcastChannel from '../components/broadcast/use-broadcast-channel';
import useSearchParametersSlideIndex from '../components/slides/use-search-parameter-slide-index';
import ProgressBar from '../components/ProgressBar';
import {
  useChannelHandlers,
  useCombinedHandlers,
} from '../components/broadcast/use-channel-handlers';
import ReactionControls from '../components/reactions/ReactionControls';
import useRemoteReactions from '../components/reactions/use-remote-reactions';
import Timer from '../components/Timer';
import {useSearchParametersSessionId} from '../use-search-parameter-session-id';
import usePresentation from '../components/slides/use-presentation';
import Slideshow from '../components/slides/Slideshow';
import NavButtons from '../components/toolbar/NavButtons';
import Button from '../components/toolbar/Button';
import useBroadcastFirebase from '../components/broadcast/use-broadcast-firestore';
import useClearReactions from '../components/reactions/use-clear-reactions';

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
  const presentation = usePresentation();

  useEffect(() => {
    document.title = `Slidr - ${
      presentation.data?.title ?? 'Unnamed Presentation'
    } - Speaker`;
  }, [presentation]);

  const sessionId = useSearchParametersSessionId();

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
  } = useSlideIndex({
    postMessage: postBroadcastChannel,
    slideCount: presentation.data?.pages?.length ?? 0,
  });
  useCombinedHandlers(
    setHandlersBroadcastChannel,
    handlersSlideIndexBroadcastChannel,
  );
  useSearchParametersSlideIndex(setSlideIndex, slideIndex);

  const {postMessage: postBroadcastSupabase} = useBroadcastFirebase({
    sessionId,
  });
  // We fire confetti on the supabase channel (never reset, ignore incoming confetti)
  const {postConfetti: postConfettiBroadcastSupabase} = useConfetti({
    postMessage: postBroadcastSupabase,
  });
  const {postReaction} = useRemoteReactions({
    postMessage: postBroadcastSupabase,
  });

  const {clearReactions: clearBroadcastChannel} = useClearReactions({
    postMessage: postBroadcastChannel,
  });
  const {clearReactions: clearFirebase} = useClearReactions({
    postMessage: postBroadcastSupabase,
  });

  const clear = useCallback(() => {
    clearBroadcastChannel();
    clearFirebase();
  }, [clearBroadcastChannel, clearFirebase]);

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
          <div className="w-full header flex flex-row gap-4 justify-evenly items-center h-14">
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
                pages={presentation.data?.pages ?? []}
                pageIndex={slideIndex}
              />
            </div>
            <div className="w-full aspect-video col-start-1">
              {slideIndex > 0 ? (
                <Slideshow
                  pages={presentation.data?.pages ?? []}
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
              {slideIndex < (presentation.data?.pages?.length ?? 1) - 1 ? (
                <Slideshow
                  pages={presentation.data?.pages ?? []}
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
            <div className="grid grid-cols-2 gap-6 first:children:p6">
              <NavButtons
                border
                onNext={navNext}
                onPrevious={navPrevious}
                onStart={() => {
                  setSlideIndex(0);
                }}
                onEnd={() => {
                  setSlideIndex((presentation.data?.pages?.length ?? 1) - 1);
                }}
              />
            </div>
            <ReactionControls
              handleConfetti={postConfettiBroadcastSupabase}
              handleReaction={postReaction}
            />
            <Button
              border
              icon="i-tabler-circle-off"
              label="clear"
              title="Clear reactions"
              onClick={() => {
                clear();
              }}
            />
          </div>
        </div>
      </div>
      <div className="overflow-x-hidden overflow-y-auto w-full h-full">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col self-center w-full header h-14 justify-center">
            Speaker Notes
          </div>
          <div className="self-center flex flex-row gap-4 flex-wrap">
            <Button
              border
              icon="i-tabler-zoom-in"
              label="in"
              title="Zoom in"
              onClick={() => {
                setTextSize(zoom(true));
              }}
            />

            <div className="flex justify-center items-center text-base flex-shrink-0">
              <div>{textSize.replace('text-', '')}</div>
            </div>
            <Button
              border
              icon="i-tabler-zoom-out"
              label="out"
              title="Zoom out"
              onClick={() => {
                setTextSize(zoom(false));
              }}
            />
          </div>
          <div className={clsx('p-2 prose max-w-full font-inter', textSize)}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {presentation.data?.notes?.find((note) =>
                note.pageIndices.includes(slideIndex),
              )?.markdown ?? ''}
            </ReactMarkdown>
          </div>
        </div>
      </div>
      <ProgressBar
        slideIndex={slideIndex}
        slideCount={presentation.data?.pages?.length ?? 0}
      />
    </div>
  );
}
