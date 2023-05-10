import {useEffect, useState} from 'react';
import {useSearchParams} from 'react-router-dom';

export default function useSearchParametersSlideIndex(
  setSlideIndex: (index: number) => void,
  slideIndex: number,
) {
  const [searchParameters, setSearchParameters] = useSearchParams();
  const [firstRender, setFirstRender] = useState(true);

  const searchParameterSlideIndex = searchParameters.get('slide');

  useEffect(() => {
    if (!setSlideIndex) {
      return;
    }

    if (searchParameterSlideIndex === null) {
      setSearchParameters({slide: '0'}, {replace: true});
      setSlideIndex(0);
      return;
    }

    if (firstRender) {
      setSlideIndex(Number.parseInt(searchParameterSlideIndex, 10));
      setFirstRender(false);
    }
  }, [
    setSlideIndex,
    firstRender,
    searchParameters,
    setSearchParameters,
    searchParameterSlideIndex,
  ]);

  useEffect(() => {
    if (firstRender) {
      return;
    }

    setSearchParameters({slide: String(slideIndex)}, {replace: true});
  }, [slideIndex, firstRender, setSearchParameters]);
}
