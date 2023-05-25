import {useCallback, useEffect, useState} from 'react';

export type Payload = {id: string; index?: number; icon?: string};
export type Handler = (payload: Payload) => void;
export type HandlerEntry = [string, Handler];
export type HandlerEntries = HandlerEntry[];

export type UseChannel = ({
  channelId,
  onIncoming,
}: {
  channelId: string;
  onIncoming?: Handler | undefined;
}) => (payload: any) => void;

export function useChannelHandlers() {
  const [handlers, setHandlers] = useState<Map<string, Handler>>(new Map());

  const handleIncomingBroadcast = useCallback(
    (payload: Payload) => {
      const handler = handlers.get(payload.id);
      if (handler) {
        handler(payload);
      }
    },
    [handlers],
  );

  return {handleIncomingBroadcast, setHandlers};
}

export function useCombinedHandlers(
  setHandlers: (handlers: Map<string, Handler>) => void,
  ...handlerEntries: HandlerEntries[]
) {
  useEffect(
    () => {
      setHandlers(new Map(handlerEntries.flat()));
    },
    // We explicitly spread the handlers entries
    // Ignore the linter error
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [...handlerEntries, setHandlers],
  );
}
