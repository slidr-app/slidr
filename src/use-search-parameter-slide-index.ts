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
      setSearchParameters(
        (currentSearchParameters) => {
          const nextSearchParameters = new URLSearchParams(
            currentSearchParameters,
          );
          nextSearchParameters.set('slide', '1');
          return nextSearchParameters;
        },
        {
          replace: true,
        },
      );
      setSlideIndex(0);
      return;
    }

    if (firstRender) {
      setSlideIndex(Number.parseInt(searchParameterSlideIndex, 10) - 1);
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

    setSearchParameters(
      (currentSearchParameters) => {
        const nextSearchParameters = new URLSearchParams(
          currentSearchParameters,
        );
        nextSearchParameters.set('slide', String(slideIndex + 1));
        return nextSearchParameters;
      },
      {replace: true},
    );
  }, [slideIndex, firstRender, setSearchParameters]);
}
