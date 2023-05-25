import {useCallback, useMemo} from 'react';
import {type HandlerEntries, type Handler} from './use-channel-handlers';

export default function useConfetti({
  postMessage,
  onConfetti,
  onReset,
}: {
  postMessage: Handler;
  onConfetti?: (data: any) => void;
  onReset?: (data: any) => void;
}): {
  postConfetti: () => void;
  postConfettiReset: () => void;
  handlers: HandlerEntries;
} {
  const postConfetti = useCallback(() => {
    postMessage({id: 'confetti'});
  }, [postMessage]);

  const postConfettiReset = useCallback(() => {
    postMessage({id: 'confetti reset'});
  }, [postMessage]);

  const handlers = useMemo<HandlerEntries>(
    () => [
      [
        'confetti',
        () => {
          onConfetti?.({});
        },
      ],
      [
        'confetti reset',
        () => {
          onReset?.({});
        },
      ],
    ],
    [onConfetti, onReset],
  );

  return {postConfetti, postConfettiReset, handlers};
}
