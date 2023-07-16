import {useCallback, useState} from 'react';
import {type Reaction} from './reaction';

export default function useReactions(): {
  removeReaction: (reaction: Reaction) => void;
  addReaction: (icon: string) => void;
  reactions: Reaction[];
  clearReactions: () => void;
} {
  const [reactions, setReactions] = useState<{
    nextIndex: number;
    currentReactions: Reaction[];
  }>({
    nextIndex: 0,
    currentReactions: [],
  });

  const removeReaction = useCallback(
    (reaction: Reaction) => {
      setReactions((currentReactions) => ({
        ...currentReactions,
        currentReactions: currentReactions.currentReactions.filter(
          (existingReaction) => existingReaction.id !== reaction.id,
        ),
      }));
    },
    [setReactions],
  );

  const addReaction = useCallback(
    (icon: string) => {
      setReactions((currentReactions) => ({
        nextIndex: currentReactions.nextIndex + 1,
        currentReactions: [
          ...currentReactions.currentReactions,
          {
            id: currentReactions.nextIndex,
            icon,
          },
        ],
      }));
    },
    [setReactions],
  );

  const clearReactions = useCallback(() => {
    setReactions((currentReactions) => ({
      ...currentReactions,
      currentReactions: [],
    }));
  }, [setReactions]);

  return {
    removeReaction,
    addReaction,
    reactions: reactions.currentReactions,
    clearReactions,
  };
}
