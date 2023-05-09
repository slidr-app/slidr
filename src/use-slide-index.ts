import {useCallback, useState, useMemo} from 'react';
import {type UseChannel} from './use-channel';

export function useSlideIndex(
  useChannel: UseChannel,
  presentationName: string,
  ignorePost?: boolean,
): {
  slideIndex: number;
  setSlideIndex: (index: number) => void;
  forward: boolean;
  prevSlideIndex: number;
  nextSlideIndex: number;
  slideCount: number;
  setSlideCount: (count: number) => void;
  navNext: () => void;
  navPrevious: () => void;
} {
  const [slideIndex, setSlideIndex] = useState(0);
  const [slideCount, setSlideCount] = useState(0);
  // Const [postSlideIndex, setPostSlideIndex] =
  //   useState<(index: number) => void>();
  const [forward, setForward] = useState(true);

  const previousSlideIndex = useMemo(
    () => Math.max(slideIndex - 1, 0),
    [slideIndex],
  );
  const nextSlideIndex = useMemo(
    () => Math.min(slideIndex + 1, slideCount - 1),
    [slideIndex, slideCount],
  );

  const updateSlideIndex = useCallback(
    (index: number) => {
      setForward(index >= slideIndex);
      setSlideIndex(index);
      // SetSearchParameters({slide: String(index)}, {replace: true});
    },
    [slideIndex],
  );

  const postSlideIndex = useChannel(
    `${presentationName}_slide_index`,
    'slide_index',
    updateSlideIndex,
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

  return {
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
