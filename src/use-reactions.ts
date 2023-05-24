import {useCallback, useState} from 'react';

export type Reaction = {
  id: number;
  icon: string;
};

export default function useReactions(): {
  removeReaction: (reaction: Reaction) => void;
  addReaction: (icon: string) => void;
  reactions: Reaction[];
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

  return {removeReaction, addReaction, reactions: reactions.currentReactions};
}
