import {useEffect, useState} from 'react';
import supabase from './supabase';
import {type Payload, type Handler} from './use-channel-handlers';

export default function useBroadcastSupabase({
  channelId,
  sessionId,
  onIncoming,
}: {
  channelId: string;
  sessionId: string;
  onIncoming?: Handler;
}): Handler {
  const [postMessage, setPostMessage] = useState<Handler>(
    () => () => undefined,
  );

  useEffect(() => {
    if (sessionId.length === 0) {
      // Don't connect unless we have a session id
      return;
    }

    const channel = supabase.channel(channelId);

    // Broadcast channel doesn't have an eventId.
    // Just use the channelId.
    const eventId = channelId;

    let channelOpen = false;

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
          channelOpen = true;
          setPostMessage(() => async (payload: Payload) => {
            console.log('posting supabase data', channelId, payload);
            console.log('channel state', channel.state);
            console.log('channel timeout', channel.timeout);
            console.log('channel', channel);
            void channel.send({
              type: 'broadcast',
              event: eventId,
              payload,
            });
          });
        }
      });

    return () => {
      if (channelOpen) {
        void channel.unsubscribe();
      }
    };
  }, [onIncoming, channelId, sessionId]);

  return postMessage;
}
