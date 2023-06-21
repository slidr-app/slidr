import {useCallback, useState, useMemo} from 'react';
import {
  type HandlerEntries,
  type Handler,
  type Payload,
} from '../broadcast/use-channel-handlers';

export function useSlideIndex({
  ignorePost,
  postMessage,
  slideCount,
}: {
  ignorePost?: boolean;
  postMessage: Handler;
  slideCount: number;
}): {
  slideIndex: number;
  setSlideIndex: (index: number) => void;
  navNext: () => void;
  navPrevious: () => void;
  handlers: HandlerEntries;
} {
  const [slideIndex, setSlideIndex] = useState(0);
  const previousSlideIndex = slideCount > 0 ? Math.max(slideIndex - 1, 0) : 0;
  const nextSlideIndex =
    slideCount > 0 ? Math.min(slideIndex + 1, slideCount - 1) : 0;

  const updateSlideIndex = useCallback((index?: number) => {
    // Heartbeat messages can include an index (if sent from the presentation view)
    // Sometimes this gets called and there is no index (heartbeats from other views)
    // Update the index if one is included.
    // Use isInteger because the 0 index is a falsy value (can't just check for a truthy value)
    if (Number.isInteger(index)) {
      setSlideIndex(index!);
    }
  }, []);

  const postSlideIndex = useCallback(
    (index: number) => {
      postMessage({id: 'slide index', index});
    },
    [postMessage],
  );

  const updateSlideIndexAndPost = useCallback(
    (index: number) => {
      updateSlideIndex(index);
      if (!ignorePost) {
        postSlideIndex(index);
      }
    },
    [updateSlideIndex, postSlideIndex, ignorePost],
  );

  const navNext = useCallback(() => {
    updateSlideIndexAndPost(nextSlideIndex);
  }, [updateSlideIndexAndPost, nextSlideIndex]);

  const navPrevious = useCallback(() => {
    updateSlideIndexAndPost(previousSlideIndex);
  }, [updateSlideIndexAndPost, previousSlideIndex]);

  const handlers = useMemo<HandlerEntries>(
    () => [
      [
        'slide index',
        (payload: Payload) => {
          updateSlideIndex(payload.index);
        },
      ],
      [
        'heartbeat',
        (payload: Payload) => {
          updateSlideIndex(payload.index);
        },
      ],
    ],
    [updateSlideIndex],
  );

  return {
    handlers,
    slideIndex,
    setSlideIndex: updateSlideIndexAndPost,
    navNext,
    navPrevious,
  };
}
