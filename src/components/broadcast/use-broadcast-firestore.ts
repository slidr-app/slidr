import {useCallback, useEffect, useState} from 'react';
import {onSnapshot, collection, addDoc, setDoc, doc} from 'firebase/firestore';
import {firestore as db} from '../../firebase';
import {type ReactionData} from '../reactions/reaction';
import {type SessionData} from '../slides/sessions';
import {type Payload, type Handler} from './use-channel-handlers';

export default function useBroadcastFirebase({
  sessionId,
  onIncoming,
}: {
  sessionId: string;
  onIncoming?: Handler;
}): {
  postMessage: Handler;
  connected: boolean;
} {
  const [connected, setConnected] = useState(false);

  const postMessage = useCallback(
    async (payload: Payload) => {
      if (!sessionId) {
        console.log('channel not configured, skipping post message');
        return;
      }

      // TTL 1 hour
      const ttl = new Date(Date.now() + 60 * 60 * 1000);

      if (payload.id === 'reaction') {
        return addDoc(collection(db, 'sessions', sessionId, 'reactions'), {
          reaction: payload.icon,
          ttl,
        } satisfies ReactionData);
      }

      if (payload.id === 'confetti') {
        return addDoc(collection(db, 'sessions', sessionId, 'reactions'), {
          reaction: 'confetti',
          ttl,
        } satisfies ReactionData);
      }

      if (payload.id === 'slide index') {
        return setDoc(doc(db, 'sessions', sessionId), {
          slideIndex: payload.index,
          ttl,
        } satisfies SessionData);
      }

      // Note: we don't handle the 'confetti reset' action as it always happens on the broadcast channel

      console.error(new Error(`bad post payload: ${payload.id}`));
    },
    [sessionId],
  );

  useEffect(() => {
    console.log({sessionId, onIncoming});
    if (sessionId.length === 0) {
      // Don't connect unless we have a session id
      return;
    }

    let mounted = true;

    console.log('(re)creating channel');

    let firstSnapshot = true;

    const unsubscribeReactions = onSnapshot(
      collection(db, 'sessions', sessionId, 'reactions'),
      (next) => {
        if (!mounted) {
          console.log('no longer mounted, skipping incoming message');
          return;
        }

        setConnected(true);

        if (firstSnapshot) {
          // Ignore first snapshot
          console.log('first snapshot, skipping');
          firstSnapshot = false;
          return;
        }

        if (!onIncoming) {
          return;
        }

        for (const change of next.docChanges()) {
          console.log('change', change);
          if (change.type === 'added') {
            const data = change.doc.data();

            // Special case for confetti
            // Note: we don't handle the 'confetti reset' action as it always happens on the broadcast channel

            if (data.reaction === 'confetti') {
              onIncoming({id: 'confetti'});
              continue;
            }

            onIncoming({id: 'reaction', icon: data.reaction as string});
            continue;
          }

          console.log('unexpected change', change);
        }
      },
      (error) => {
        setConnected(false);
        console.error(error);
      },
    );

    const unsubscribeIndex = onSnapshot(
      doc(db, 'sessions', sessionId),
      (next) => {
        if (!mounted) {
          console.log('no longer mounted, skipping incoming message');
          return;
        }

        setConnected(true);

        if (!onIncoming) {
          return;
        }

        if (!next.exists()) {
          console.log('session does not exist');
          return;
        }

        onIncoming({
          id: 'slide index',
          index: next.data().slideIndex as number,
        });
      },
      (error) => {
        setConnected(false);
        console.error(error);
      },
    );

    return () => {
      console.log('unmounting');
      mounted = false;
      console.log('removing channel');
      unsubscribeReactions();
      unsubscribeIndex();
    };
  }, [onIncoming, sessionId]);

  return {
    postMessage,
    connected,
  };
}
