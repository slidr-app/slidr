import {useCallback, useMemo} from 'react';
import {type Handler, type Payload} from '../broadcast/use-channel-handlers';
import {type IconReaction, type IconReactionEntry} from './reaction';
import reactionsIconMap from './reaction-icons-map';

const reactionTypes = new Set(Array.from(reactionsIconMap.keys()));

export default function useRemoteReactions({
  postMessage,
  onReactions,
}: {
  postMessage?: Handler;
  onReactions?: (reaction: IconReactionEntry[]) => void;
}): {
  postReaction: (reaction: IconReaction) => void;
  handlers: Handler[];
} {
  const postReaction = useCallback(
    (reaction: IconReaction) => {
      postMessage?.({id: 'reactions', reactions: [['', reaction]]});
    },
    [postMessage],
  );

  const handlers = useMemo<Handler[]>(
    () => [
      (payload: Payload) => {
        if (payload.id === 'reactions') {
          // This is some hacky typescript magic.
          // Need to know if the reaction is an icon
          const iconReactions = payload.reactions
            .filter(([, reaction]) =>
              reactionTypes.has(reaction as IconReaction),
            )
            .map(([id, reaction]) => [
              id,
              // Map the reaction to a RenderedReaction
              {reaction: reaction as IconReaction},
            ]) satisfies IconReactionEntry[];

          onReactions?.(iconReactions);
        }
      },
    ],
    [onReactions],
  );

  return {postReaction, handlers};
}
