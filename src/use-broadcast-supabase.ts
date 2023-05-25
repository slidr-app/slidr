import {useEffect, useState} from 'react';
import supabase from './supabase';
import {
  type Payload,
  type Handler,
  type UseChannel,
} from './use-channel-handlers';

const useBroadcastSupabase: UseChannel = function ({channelId, onIncoming}) {
  const [postMessage, setPostMessage] = useState<Handler>(
    () => () => undefined,
  );

  useEffect(() => {
    const channel = supabase.channel(channelId);

    // Broadcast channel doesn't have an eventId.
    // Just use the channelId.
    const eventId = channelId;

    channel
      .on('broadcast', {event: eventId}, (message) => {
        console.log('incoming supabase', channelId, eventId, message);
        if (onIncoming) {
          onIncoming(message.payload as Payload);
        }
      })
      .subscribe((status) => {
        console.log('supabase subscription', status);
        if (status === 'SUBSCRIBED') {
          setPostMessage(() => async (payload: Payload) => {
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
  }, [onIncoming, channelId]);

  return postMessage;
};

export default useBroadcastSupabase;
