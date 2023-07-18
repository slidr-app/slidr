import {useCallback, useState} from 'react';
import {
  type ReactionEntry,
  type IconReactionEntry,
  type IconReactionMap,
  type IconReaction,
} from './reaction';

export default function useReactions(): {
  removeReaction: (reaction: IconReactionEntry) => void;
  addReaction: (reaction: IconReactionEntry) => void;
  reactions: IconReactionMap;
  clearReactions: () => void;
} {
  const [reactions, setReactions] = useState<IconReactionMap>(
    new Map<string, IconReaction>(),
  );

  const removeReaction = useCallback(
    ([id]: ReactionEntry) => {
      setReactions((currentReactions) => {
        const nextReactions = new Map(currentReactions);
        nextReactions.delete(id);
        return nextReactions;
      });
    },
    [setReactions],
  );

  const addReaction = useCallback(
    ([id, reaction]: IconReactionEntry) => {
      setReactions((currentReactions) => {
        // Don't add existing reactions
        if (currentReactions.has(id)) {
          return currentReactions;
        }

        const nextReactions = new Map(currentReactions);
        nextReactions.set(id, reaction);
        return nextReactions;
      });
    },
    [setReactions],
  );

  const clearReactions = useCallback(() => {
    setReactions(new Map<string, IconReaction>());
  }, [setReactions]);

  return {
    removeReaction,
    addReaction,
    reactions,
    clearReactions,
  };
}
