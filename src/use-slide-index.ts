import {useCallback, useEffect, useState, useMemo} from 'react';
import {useSearchParams} from 'react-router-dom';

export function useSlideIndex(): {
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
  const [searchParameters, setSearchParameters] = useSearchParams();
  const [firstRender, setFirstRender] = useState(true);
  const [postSlideIndex, setPostSlideIndex] =
    useState<(index: number) => void>();
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
      setSearchParameters({slide: String(index)}, {replace: true});
    },
    [slideIndex],
  );

  useEffect(() => {
    const currentSlideChannel = new BroadcastChannel('current_slide');
    const currentSlideHandler = (event: MessageEvent) => {
      console.log(event);
      updateSlideIndex(event.data as number);
    };

    currentSlideChannel.addEventListener('message', currentSlideHandler);
    setPostSlideIndex(() => (index: number) => {
      console.log('posting', index);
      currentSlideChannel.postMessage(index);
    });

    return () => {
      currentSlideChannel.removeEventListener('message', currentSlideHandler);
      currentSlideChannel.close();
    };
  }, [updateSlideIndex]);

  const updateSlideIndexAndPost = useCallback(
    (index: number) => {
      updateSlideIndex(index);
      postSlideIndex!(index);
    },
    [updateSlideIndex, postSlideIndex],
  );

  useEffect(() => {
    if (!postSlideIndex) {
      return;
    }

    const slideString = searchParameters.get('slide');

    if (slideString === null) {
      setSearchParameters({slide: '0'}, {replace: true});
      updateSlideIndexAndPost(0);
      return;
    }

    if (firstRender) {
      console.log('first render');
      updateSlideIndexAndPost(Number.parseInt(slideString, 10));
      setFirstRender(false);
    }
  }, [updateSlideIndexAndPost, searchParameters.get('slide'), firstRender]);

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
