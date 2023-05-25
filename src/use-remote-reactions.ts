import {useCallback, useMemo} from 'react';
import {
  type HandlerEntries,
  type Handler,
  type Payload,
} from './use-channel-handlers';

export default function useRemoteReactions({
  postMessage,
  onReaction,
}: {
  postMessage?: Handler;
  onReaction?: (icon: string) => void;
}): {
  postReaction: (icon: string) => void;
  handlers: HandlerEntries;
} {
  const postReaction = useCallback(
    (icon: string) => {
      postMessage?.({id: 'reaction', icon});
    },
    [postMessage],
  );

  const handlers = useMemo<HandlerEntries>(
    () => [
      [
        'reaction',
        (payload: Payload) => {
          onReaction?.(payload.icon as string);
        },
      ],
    ],
    [onReaction],
  );

  return {postReaction, handlers};
}
