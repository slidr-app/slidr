import {useEffect, useState} from 'react';
import {type UseChannel} from './use-channel';

const useBroadcastChannel: UseChannel = function (
  channelId,
  eventId,
  onIncoming,
) {
  const [postMessage, setPostMessage] = useState<() => void>(
    () => () => undefined,
  );

  useEffect(() => {
    const channel = new BroadcastChannel(channelId);
    const channelMessageHandler = (event: MessageEvent) => {
      console.log('incoming bc', channelId, event);
      if (onIncoming) {
        onIncoming(event.data);
      }
    };

    channel.addEventListener('message', channelMessageHandler);
    setPostMessage(() => (payload: any) => {
      console.log('posting bc data', channelId, payload);
      channel.postMessage(payload);
    });

    return () => {
      channel.removeEventListener('message', channelMessageHandler);
      channel.close();
    };
  }, [onIncoming]);

  return postMessage;
};

export default useBroadcastChannel;
