import {useCallback, useState, useMemo, useEffect, useRef} from 'react';
import {
  type HandlerEntries,
  type Handler,
  type Payload,
} from './use-channel-handlers';

export function useSlideIndex({
  ignorePost,
  postMessage,
}: {
  ignorePost?: boolean;
  postMessage: Handler;
}): {
  slideIndex: number;
  setSlideIndex: (index: number) => void;
  forward: boolean;
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
  const [forward, setForward] = useState(true);

  const previousSlideIndex = useMemo(
    () => Math.max(slideIndex - 1, 0),
    [slideIndex],
  );
  const nextSlideIndex = useMemo(
    () => Math.min(slideIndex + 1, slideCount - 1),
    [slideIndex, slideCount],
  );

  const updateSlideIndex = useCallback((index?: number) => {
    if (index) {
      setSlideIndex(index);
    }
  }, []);

  // Use and determine direction (forward or not) in a dedicated useEffect
  // This decouples the changing of the index and the direction flag
  const previousIndexRef = useRef(1);
  useEffect(() => {
    setForward(slideIndex >= previousIndexRef.current);
    previousIndexRef.current = slideIndex;
  }, [slideIndex]);

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
    forward,
    prevSlideIndex: previousSlideIndex,
    nextSlideIndex,
    slideCount,
    setSlideCount,
    navNext,
    navPrevious,
  };
}
