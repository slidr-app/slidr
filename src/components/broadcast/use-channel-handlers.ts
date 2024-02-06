import {useCallback, useEffect, useState} from 'react';
import {type ReactionEntry} from '../reactions/reaction';

export type Payload =
  | {
      id: 'slide index';
      index: number;
      icon?: never;
    }
  | {
      id: 'reactions';
      reactions: ReactionEntry[];
    };
export type Handler = (payload: Payload) => void;

export function useChannelHandlers() {
  const [handlers, setHandlers] = useState<Handler[]>([]);

  const handleIncomingBroadcast = useCallback(
    (payload: Payload) => {
      for (const handler of handlers) {
        handler(payload);
      }
    },
    [handlers],
  );

  return {handleIncomingBroadcast, setHandlers};
}

export function useCombinedHandlers(
  setHandlers: React.Dispatch<React.SetStateAction<Handler[]>>,
  ...handlers: Handler[][]
) {
  useEffect(
    () => {
      setHandlers(handlers.flat());
    },

    // TODO: since we call flat, could we stop using memo when we define the handlers? I think yes.
    // We explicitly spread the handlers entries
    // Ignore the linter error
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [...handlers.flat(), setHandlers],
  );
}
