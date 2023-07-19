import {useCallback, useState} from 'react';
import {
  type IconReactionEntry,
  type IconReactionMap,
  type RenderedReaction,
} from './reaction';

export default function useReactions(): {
  removeReaction: (id: string) => void;
  addReactions: (reactions: IconReactionEntry[]) => void;
  reactions: IconReactionMap;
  clearReactions: () => void;
} {
  const [reactions, setReactions] = useState<IconReactionMap>(
    new Map<string, RenderedReaction>(),
  );

  const removeReaction = useCallback(
    (id: string) => {
      setReactions((currentReactions) => {
        const nextReactions = new Map(currentReactions);
        nextReactions.set(id, {...nextReactions.get(id)!, done: true});
        return nextReactions;
      });
    },
    [setReactions],
  );

  const addReactions = useCallback(
    (reactions: IconReactionEntry[]) => {
      setReactions(
        (currentReactions) => new Map([...reactions, ...currentReactions]),
      );
    },
    [setReactions],
  );

  const clearReactions = useCallback(() => {
    setReactions(
      (currentReactions) =>
        // Set all reactions to done
        new Map(
          Array.from(currentReactions).map(([id, reaction]) => [
            id,
            {
              ...reaction,
              done: true,
            },
          ]),
        ),
    );
  }, [setReactions]);

  return {
    removeReaction,
    addReactions,
    reactions,
    clearReactions,
  };
}
