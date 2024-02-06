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
  type ReactionEntry,
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

      if (payload.id === 'reactions') {
        return Promise.all(
          // Ignore the id when posting, it will get generated
          payload.reactions.map(async ([, reaction]) => {
            return addDoc(collection(db, 'sessions', sessionId, 'reactions'), {
              reaction,
              ttl,
              created: serverTimestamp(),
            } satisfies ReactionData);
          }),
        );
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

        const reactions = next.docs
          .map((snapshot) => {
            const reactionData = snapshot.data({
              serverTimestamps: 'estimate',
            }) as IncomingReactionData;
            return {
              id: snapshot.id,
              reaction: reactionData.reaction,
              created: reactionData.created.toMillis(),
            };
          })
          // Ignore reactions older than 30 seconds
          .filter((reactionDoc) => now - reactionDoc.created < 30_000)
          .sort((a, b) => a.created - b.created)
          .map(
            (reactionDoc) =>
              [reactionDoc.id, reactionDoc.reaction] satisfies ReactionEntry,
          );

        onIncoming({id: 'reactions', reactions});
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
