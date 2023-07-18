import {useCallback, useMemo} from 'react';
import {type Handler, type Payload} from '../broadcast/use-channel-handlers';

export default function useConfetti({
  postMessage,
  onConfetti,
  onReset,
}: {
  postMessage?: Handler;
  onConfetti?: (data: any) => void;
  onReset?: (data: any) => void;
}): {
  postConfetti: () => void;
  postConfettiReset: () => void;
  handlers: Handler[];
} {
  const postConfetti = useCallback(() => {
    postMessage?.({id: 'reaction', reaction: ['', 'confetti']});
  }, [postMessage]);

  const postConfettiReset = useCallback(() => {
    postMessage?.({id: 'reaction', reaction: ['', 'confetti clear']});
  }, [postMessage]);

  const handlers = useMemo<Handler[]>(
    () => [
      (payload: Payload) => {
        if (payload.id === 'reaction' && payload.reaction[1] === 'confetti') {
          onConfetti?.({});
        }
      },
      (payload: Payload) => {
        if (
          payload.id === 'reaction' &&
          payload.reaction[1] === 'confetti clear'
        ) {
          onReset?.({});
        }
      },
    ],
    [onConfetti, onReset],
  );

  return {postConfetti, postConfettiReset, handlers};
}
