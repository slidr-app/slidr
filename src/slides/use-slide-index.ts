import {useCallback, useState, useMemo} from 'react';
import {
  type HandlerEntries,
  type Handler,
  type Payload,
} from '../broadcast/use-channel-handlers';

export function useSlideIndex({
  ignorePost,
  postMessage,
}: {
  ignorePost?: boolean;
  postMessage: Handler;
}): {
  slideIndex: number;
  setSlideIndex: (index: number) => void;
  prevSlideIndex: number;
  nextSlideIndex: number;
  slideCount: number;
  setSlideCount: (count: number) => void;
  navNext: () => void;
  navPrevious: () => void;
  handlers: HandlerEntries;
} {
  const [slideIndex, setSlideIndex] = useState(0);
  const [slideCount, setSlideCount] = useState(0);

  const previousSlideIndex = useMemo(
    () => Math.max(slideIndex - 1, 0),
    [slideIndex],
  );
  const nextSlideIndex = useMemo(
    () => Math.min(slideIndex + 1, slideCount - 1),
    [slideIndex, slideCount],
  );

  const updateSlideIndex = useCallback((index?: number) => {
    if (index !== undefined) {
      setSlideIndex(index);
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
    console.log('nav prev', previousSlideIndex);
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
    prevSlideIndex: previousSlideIndex,
    nextSlideIndex,
    slideCount,
    setSlideCount,
    navNext,
    navPrevious,
  };
}
