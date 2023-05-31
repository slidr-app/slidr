import {useCallback, useEffect, useRef, useState} from 'react';
import {type REALTIME_SUBSCRIBE_STATES} from '@supabase/supabase-js';
import {useDebouncedCallback} from 'use-debounce';
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

  // Send a heartbeat message with this interval.
  // The shorter the interval, the quicker users will be reconnected (less time disconnected)
  // The shorter the interval, the more messages are sent through supabase
  const heartbeatInterval = 5000;

  // How long to wait for no incoming messages before trying to reconnect
  // We wait for two heartbeats, plus some margin
  const watchdogTimeout = heartbeatInterval * 2 + 500;

  // Reset the connection if the watchdog function (incoming message) is not called after the delay
  const watchdog = useDebouncedCallback(() => {
    console.log('Watchdog timeout ocurred, reconnecting');
    setTriggerReconnect({});
  }, watchdogTimeout);

  // Send (or attempt to send) a heartbeat at regular intervals
  // This will trigger resetting of the watchdog timer on other clients
  useEffect(() => {
    const handle = setInterval(() => {
      console.log('sending heartbeat');
      postMessage({id: 'heartbeat'});
    }, heartbeatInterval);

    return () => {
      clearInterval(handle);
    };
  }, [postMessage]);

  // Const [debouncedStatus] = useDebounce(channelStatus, heartbeatInterval);

  // useEffect(() => {
  //   console.log('debounce status changed', debouncedStatus);
  //   if (debouncedStatus === 'SUBSCRIBED' || debouncedStatus === undefined) {
  //     console.log('skipping reconnect');
  //     return;
  //   }

  //   console.log('disconnect timer fired, reconnecting');
  //   setTriggerReconnect({});
  // }, [debouncedStatus]);

  useEffect(() => {
    console.log({channelId, sessionId, onIncoming});
    if (sessionId.length === 0) {
      // Don't connect unless we have a session id
      return;
    }

    let mounted = true;

    // Reset the watchdog on every connection attempt
    watchdog();

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
          // Reset the watchdog timer on all incoming messages (indicating that we are connected)
          watchdog();
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
  }, [
    onIncoming,
    channelId,
    sessionId,
    defaultPostMessage,
    triggerReconnect,
    watchdog,
  ]);

  return {postMessage, connected: channelStatus === 'SUBSCRIBED'};
}
