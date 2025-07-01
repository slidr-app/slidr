import {useContext, useEffect, useState} from 'react';
import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import {useDebouncedCallback} from 'use-debounce';
import DefaultLayout from '../layouts/DefaultLayout';
import {UserContext} from '../components/UserProvider';
import {firestore} from '../firebase';
import SaveIndicator from '../components/SaveIndicator';
import {type PresentationUpdate} from '../../functions/src/presentation';
import {type UserDocument, userDocumentConverter} from '../user-schema';

export default function UserPreferences() {
  const {user} = useContext(UserContext);
  const [userData, setUserData] = useState<UserDocument>({});

  useEffect(() => {
    if (!user) {
      return;
    }

    return onSnapshot(
      doc(firestore, `users/${user.uid}`).withConverter(userDocumentConverter),
      (snapshot) => {
        if (!snapshot.exists()) {
          setUserData({});
          return;
        }

        const snapshotData = snapshot.data();
        setUserData(snapshotData);
      },
    );
  }, [user]);

  const [saveState, setSaveState] = useState<'saved' | 'saving' | 'dirty'>(
    'saved',
  );

  const save = useDebouncedCallback(async () => {
    setSaveState('saving');
    await setDoc(doc(firestore, `users/${user!.uid}`), userData, {merge: true});
    const userPresentationsSnapshot = await getDocs(
      query(
        collection(firestore, 'presentations'),
        where('uid', '==', user!.uid),
      ),
    );
    await Promise.all(
      userPresentationsSnapshot.docs.map(async (presentation) =>
        updateDoc(doc(firestore, 'presentations', presentation.id), {
          username: userData.username!,
          twitterHandle: userData.twitterHandle!,
        } satisfies PresentationUpdate),
      ),
    );
    setSaveState((currentState) =>
      currentState === 'saving' ? 'saved' : currentState,
    );
  }, 4000);

  return (
    <DefaultLayout title="User Preferences">
      <div className="max-w-screen-sm mx-auto grid grid-cols-[auto_1fr] gap-4 w-full">
        <div className="grid-col-span-2 flex flex-row gap-2 justify-center items-center">
          {/*
            If data is not yet set (still loading), render nothing.
            This facilitates UI test by allowing waiting for something to be rendered.
          */}
          {user?.data === undefined ? null : user.data.isPro ? (
            <>
              <div className="i-tabler-user-star w-8 h-8" />
              <div>
                <span className="font-semibold">Slidr Pro</span> - Thank you for
                your support!
              </div>
              <div className="i-tabler-confetti w-8 h-8" />
            </>
          ) : (
            <div>Go Pro to support Slidr!</div>
          )}
        </div>
        <div className="flex items-center justify-end">Email:</div>
        <div className="">{user?.email ?? ''}</div>
        <label
          id="username-label"
          className="flex flex-col items-end justify-center"
        >
          <div>Username:</div>
          <div className="text-xs">(optional)</div>
        </label>
        <input
          aria-labelledby="username-label"
          className="input flex-grow"
          value={userData.username ?? ''}
          placeholder="your name"
          onChange={(event) => {
            setSaveState('dirty');
            setUserData((currentUser) => ({
              ...currentUser,
              username: event.target.value,
            }));
            void save();
          }}
        />
        <label
          id="twitter-label"
          className="flex flex-col items-end justify-center"
        >
          <div>Twitter handle:</div>
          <div className="text-xs">(optional)</div>
        </label>
        <input
          aria-labelledby="twitter-label"
          className="input flex-grow"
          value={userData.twitterHandle ?? ''}
          placeholder="@yourhandle"
          onChange={(event) => {
            setSaveState('dirty');
            setUserData((currentUser) => ({
              ...currentUser,
              twitterHandle: event.target.value,
            }));
            void save();
          }}
        />
        <SaveIndicator saveState={saveState} />
      </div>
    </DefaultLayout>
  );
}
