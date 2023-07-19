import {useCallback, useMemo, useState} from 'react';
import {type Handler, type Payload} from '../broadcast/use-channel-handlers';

export default function useClearReactions({
  postMessage,
  setClearConfetti,
  setClearIcons,
}: {
  postMessage?: Handler;
  setClearConfetti?: () => void;
  setClearIcons?: () => void;
}): {
  clearReactions: () => void;
  handlers: Handler[];
} {
  const [clears, setClears] = useState<string[]>([]);

  const clearLocal = useCallback(() => {
    setClearConfetti?.();
    setClearIcons?.();
  }, [setClearConfetti, setClearIcons]);

  const clearReactions = useCallback(() => {
    clearLocal?.();
    postMessage?.({id: 'reactions', reactions: [['', 'clear']]});
  }, [clearLocal, postMessage]);

  const handlers = useMemo<Handler[]>(
    () => [
      (payload: Payload) => {
        if (payload.id === 'reactions') {
          const clearIds = payload.reactions
            .filter(
              ([id, reaction]) =>
                reaction === 'clear' &&
                (id.length === 0 || !clears.includes(id)),
            )
            .map(([id]) => id);

          if (clearIds.length > 0) {
            clearLocal();
            setClears((currentClears) => [
              ...currentClears,
              ...clearIds.filter(Boolean),
            ]);
          }
        }
      },
    ],
    [clearLocal, clears],
  );

  return {
    clearReactions,
    handlers,
  };
}
