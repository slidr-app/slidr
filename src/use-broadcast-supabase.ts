import {useEffect, useState} from 'react';
import supabase from './supabase';
import {type UseChannel} from './use-channel';

const useBroadcastSupaBase: UseChannel = function (
  channelId,
  eventId,
  onIncoming,
) {
  const [postMessage, setPostMessage] = useState<
    (payload: Record<string, any>) => void
  >(() => () => undefined);

  useEffect(() => {
    const channel = supabase.channel(channelId);

    channel
      .on('broadcast', {event: eventId}, (message) => {
        console.log('incomming supabase', channelId, eventId, message);
        if (onIncoming) {
          onIncoming(message.payload);
        }
      })
      .subscribe((status) => {
        console.log('supabase subscription', status);
        if (status === 'SUBSCRIBED') {
          setPostMessage(() => async (payload: Record<string, any>) => {
            console.log('posting supabase data', channelId, payload);
            void channel.send({
              type: 'broadcast',
              event: eventId,
              payload,
            });
          });
        }
      });

    return () => {
      void channel.unsubscribe();
    };
  }, [onIncoming, channelId, eventId]);

  return postMessage;
};

export default useBroadcastSupaBase;
