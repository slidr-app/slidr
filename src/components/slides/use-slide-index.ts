import {useCallback, useState, useMemo} from 'react';
import {type Handler, type Payload} from '../broadcast/use-channel-handlers';

export function useSlideIndex({
  postMessage,
  slideCount,
}: {
  postMessage?: Handler;
  slideCount: number;
}): {
  slideIndex: number;
  setSlideIndex: (index: number) => void;
  navNext: () => void;
  navPrevious: () => void;
  handlers: Handler[];
  forward: boolean;
} {
  const [slideIndex, setSlideIndex] = useState(0);
  const previousSlideIndex = slideCount > 0 ? Math.max(slideIndex - 1, 0) : 0;
  const nextSlideIndex =
    slideCount > 0 ? Math.min(slideIndex + 1, slideCount - 1) : 0;

  const [forward, setForward] = useState<boolean>(true);

  const updateSlideIndex = useCallback((index?: number) => {
    // Heartbeat messages can include an index (if sent from the presentation view)
    // Sometimes this gets called and there is no index (heartbeats from other views)
    // Update the index if one is included.
    // Use isInteger because the 0 index is a falsy value (can't just check for a truthy value)
    if (Number.isInteger(index)) {
      setSlideIndex(index!);
    }
  }, []);

  const updateSlideIndexAndPost = useCallback(
    (index: number) => {
      updateSlideIndex(index);
      postMessage?.({id: 'slide index', index});
    },
    [updateSlideIndex, postMessage],
  );

  const navNext = useCallback(() => {
    setForward(true);
    updateSlideIndexAndPost(nextSlideIndex);
  }, [updateSlideIndexAndPost, nextSlideIndex]);

  const navPrevious = useCallback(() => {
    setForward(false);
    updateSlideIndexAndPost(previousSlideIndex);
  }, [updateSlideIndexAndPost, previousSlideIndex]);

  const handlers = useMemo<Handler[]>(
    () => [
      (payload: Payload) => {
        if (payload.id === 'slide index') {
          setForward(payload.index >= slideIndex);
          updateSlideIndex(payload.index);
        }
      },
    ],
    [updateSlideIndex, slideIndex],
  );

  return {
    handlers,
    slideIndex,
    setSlideIndex: updateSlideIndexAndPost,
    navNext,
    navPrevious,
    forward,
  };
}
