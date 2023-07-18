import {useCallback, useMemo} from 'react';
import {type Handler, type Payload} from '../broadcast/use-channel-handlers';
import {type IconReaction, type IconReactionEntry} from './reaction';
import reactionsIconMap from './reaction-icons-map';

const reactionTypes = new Set(Array.from(reactionsIconMap.keys()));

export default function useRemoteReactions({
  postMessage,
  onReaction,
}: {
  postMessage?: Handler;
  onReaction?: (reaction: IconReactionEntry) => void;
}): {
  postReaction: (reaction: IconReaction) => void;
  handlers: Handler[];
} {
  const postReaction = useCallback(
    (reaction: IconReaction) => {
      postMessage?.({id: 'reaction', reaction: ['', reaction]});
    },
    [postMessage],
  );

  const handlers = useMemo<Handler[]>(
    () => [
      (payload: Payload) => {
        if (
          payload.id === 'reaction' &&
          // Use the 'as' operator here to force the check, not sure if there is a better way to check the string value using typescript
          reactionTypes.has(payload.reaction[1] as IconReaction)
        ) {
          onReaction?.(payload.reaction as IconReactionEntry);
        }
      },
    ],
    [onReaction],
  );

  return {postReaction, handlers};
}
