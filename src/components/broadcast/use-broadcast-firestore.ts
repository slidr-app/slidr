import {useCallback, useEffect, useState} from 'react';
import {
  onSnapshot,
  collection,
  addDoc,
  setDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore';
import {firestore as db} from '../../firebase';
import {
  type IncomingReactionData,
  type ReactionData,
} from '../reactions/reaction';
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
        // Ignore the id when posting, it will get generated
        const [, reaction] = payload.reaction;
        return addDoc(collection(db, 'sessions', sessionId, 'reactions'), {
          reaction,
          ttl,
          created: serverTimestamp(),
        } satisfies ReactionData);
      }

      if (payload.id === 'slide index') {
        return setDoc(doc(db, 'sessions', sessionId), {
          slideIndex: payload.index,
          ttl,
        } satisfies SessionData);
      }
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

    const unsubscribeReactions = onSnapshot(
      collection(db, 'sessions', sessionId, 'reactions'),
      (next) => {
        if (!mounted) {
          console.log('no longer mounted, skipping incoming message');
          return;
        }

        setConnected(true);

        if (!onIncoming) {
          return;
        }

        const now = Date.now();

        for (const change of next.docChanges()) {
          if (change.type !== 'added') {
            continue;
          }

          const reactionData = change.doc.data({
            serverTimestamps: 'estimate',
          }) as IncomingReactionData;

          console.log('data', reactionData);
          // Ignore reactions older than 30 seconds
          if (now - reactionData.created.toMillis() > 30_000) {
            continue;
          }

          onIncoming({
            id: 'reaction',
            reaction: [change.doc.id, reactionData.reaction],
          });
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
