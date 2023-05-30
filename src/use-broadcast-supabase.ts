import {useCallback, useEffect, useRef, useState} from 'react';
import {type REALTIME_SUBSCRIBE_STATES} from '@supabase/supabase-js';
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
}): {postMessage: Handler; connected: boolean} {
  const defaultPostMessage = useCallback(() => {
    console.log('channel not configured, skipping post message');
  }, []);

  const [postMessage, setPostMessage] = useState<Handler>(
    () => defaultPostMessage,
  );

  const [channelStatus, setChannelStatus] =
    useState<`${REALTIME_SUBSCRIBE_STATES}`>();

  const [triggerReconnect, setTriggerReconnect] = useState({});

  const isVisiblePrevious = useRef(true);
  useEffect(() => {
    function visibilityChanged() {
      console.log('visibility state', document.visibilityState);
      const isVisible = document.visibilityState === 'visible';

      if (isVisible && !isVisiblePrevious.current) {
        console.log('now visible, reconnect');
        setTriggerReconnect({});
      } else {
        console.log('not visible or first render');
      }

      isVisiblePrevious.current = isVisible;
    }

    document.addEventListener('visibilitychange', visibilityChanged);

    return () => {
      document.removeEventListener('visibilitychange', visibilityChanged);
    };
  }, []);

  useEffect(() => {
    console.log({channelId, sessionId, onIncoming});
    if (sessionId.length === 0) {
      // Don't connect unless we have a session id
      return;
    }

    let mounted = true;

    console.log('(re)creating channel');
    const uniqueChannelId = `${channelId}_${sessionId}`;
    const channel = supabase.channel(uniqueChannelId);
    const eventId = uniqueChannelId;

    channel
      .on('broadcast', {event: eventId}, (message) => {
        console.log('incoming supabase', channelId, eventId, message);
        if (!mounted) {
          console.log('no longer mounted, skipping incoming message');
          return;
        }

        if (onIncoming) {
          onIncoming(message.payload as Payload);
        }
      })
      .subscribe((status, error) => {
        console.log('supabase subscription', status, error);

        if (error) {
          console.error(error);
          return;
        }

        if (!mounted) {
          console.log('no longer mounted, skipping subscribe callback');
          return;
        }

        setChannelStatus(status);

        if (status === 'SUBSCRIBED') {
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
          return;
        }

        // Clear the post message handler
        setPostMessage(() => defaultPostMessage);
      });

    return () => {
      console.log('unmounting');
      mounted = false;
      console.log('removing channel');
      void supabase.removeChannel(channel);
    };
  }, [onIncoming, channelId, sessionId, defaultPostMessage, triggerReconnect]);

  return {postMessage, connected: channelStatus === 'SUBSCRIBED'};
}
