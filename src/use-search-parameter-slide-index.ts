import {useEffect, useState} from 'react';
import {useSearchParams} from 'react-router-dom';

export default function useSearchParametersSlideIndex(
  setSlideIndex: (index: number) => void,
  slideIndex: number,
) {
  const [searchParameters, setSearchParameters] = useSearchParams();
  const [firstRender, setFirstRender] = useState(true);

  useEffect(() => {
    if (!setSlideIndex) {
      return;
    }

    const slideString = searchParameters.get('slide');

    if (slideString === null) {
      setSearchParameters({slide: '0'}, {replace: true});
      setSlideIndex(0);
      return;
    }

    if (firstRender) {
      console.log('first render');
      setSlideIndex(Number.parseInt(slideString, 10));
      setFirstRender(false);
    }
  }, [setSlideIndex, searchParameters.get('slide'), firstRender]);

  useEffect(() => {
    if (firstRender) {
      return;
    }

    setSearchParameters({slide: String(slideIndex)}, {replace: true});
  }, [slideIndex, firstRender]);
}
