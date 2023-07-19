import {useCallback, useMemo, useState} from 'react';
import {type Handler, type Payload} from '../broadcast/use-channel-handlers';
import {type ConfettiReactionEntry} from '../reactions/reaction';

export default function useConfetti({postMessage}: {postMessage?: Handler}): {
  postConfetti: () => void;
  handlers: Handler[];
  confettiReactions: ConfettiReactionEntry[];
} {
  const postConfetti = useCallback(() => {
    postMessage?.({id: 'reactions', reactions: [['', 'confetti']]});
  }, [postMessage]);

  const [confettiReactions, setConfettiReactions] = useState<
    ConfettiReactionEntry[]
  >([]);

  const handlers = useMemo<Handler[]>(
    () => [
      (payload: Payload) => {
        if (payload.id === 'reactions') {
          const confettiReactions = payload.reactions.filter(
            ([, reaction]) => reaction === 'confetti',
          ) as ConfettiReactionEntry[];
          setConfettiReactions(confettiReactions);
        }
      },
    ],
    [],
  );

  return {postConfetti, handlers, confettiReactions};
}
