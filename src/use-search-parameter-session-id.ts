import {useEffect, useState} from 'react';
import {useSearchParams} from 'react-router-dom';
import {nanoid} from 'nanoid';

export function useSearchParametersSessionId(assignId?: boolean) {
  const [searchParameters, setSearchParameters] = useSearchParams();

  const [sessionId, setSessionId] = useState<string>('');
  useEffect(() => {
    const searchParameterSessionId = searchParameters.get('session');

    if (searchParameterSessionId) {
      setSessionId(searchParameterSessionId);
      return;
    }

    if (assignId) {
      const newSessionId = nanoid(5);
      setSessionId(newSessionId);
      setSearchParameters(
        (currentSearchParameters) => {
          const nextSearchParameters = new URLSearchParams(
            currentSearchParameters,
          );
          nextSearchParameters.set('session', newSessionId);
          return nextSearchParameters;
        },
        {replace: true},
      );
    }
  }, [searchParameters, setSearchParameters, assignId]);

  return sessionId;
}
