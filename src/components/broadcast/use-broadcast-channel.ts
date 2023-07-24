import {useEffect, useState} from 'react';
import {nanoid} from 'nanoid';
import {type Handler, type Payload} from './use-channel-handlers';

export default function useBroadcastChannel({
  sessionId,
  onIncoming,
}: {
  sessionId: string;
  onIncoming?: Handler;
}): Handler {
  const [postMessage, setPostMessage] = useState<() => void>(
    () => () => undefined,
  );

  useEffect(() => {
    if (!sessionId) {
      return;
    }

    const channel = new BroadcastChannel(sessionId);
    let channelOpen = true;
    const channelMessageHandler = (event: MessageEvent) => {
      if (!channelOpen) {
        return;
      }

      console.log('incoming bc', sessionId, event);
      if (onIncoming) {
        const incomingPayload = event.data as Payload;

        if (incomingPayload.id === 'reactions') {
          onIncoming({
            id: 'reactions',
            reactions: incomingPayload.reactions.map(([, reaction]) => [
              nanoid(),
              reaction,
            ]),
          });
          return;
        }

        onIncoming(event.data as Payload);
      }
    };

    channel.addEventListener('message', channelMessageHandler);
    setPostMessage(() => (payload: any) => {
      console.log('posting bc data', sessionId, payload);
      if (channelOpen) {
        channel.postMessage(payload);
      }
    });

    return () => {
      channelOpen = false;
      channel.removeEventListener('message', channelMessageHandler);
      channel.close();
    };
  }, [onIncoming, sessionId]);

  return postMessage;
}
