import {useContext, useEffect, useState} from 'react';
import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  query,
  setDoc,
  where,
} from 'firebase/firestore';
import {useDebouncedCallback} from 'use-debounce';
import DefaultLayout from '../layouts/DefaultLayout';
import {UserContext} from '../components/UserProvider';
import {firestore} from '../firebase';
import SaveIndicator from '../components/SaveIndicator';
import {type UserDocument, userDocumentConverter} from '../user-schema';
import {presentationConverter} from '../../functions/src/presentation-schema';
import {ProComparison} from '../components/ProComparison';
import GoProAction from '../components/GoProAction';

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
        setDoc(
          doc(firestore, 'presentations', presentation.id).withConverter(
            presentationConverter,
          ),
          {
            username: userData.username!,
            twitterHandle: userData.twitterHandle!,
          },
          {merge: true},
        ),
      ),
    );
    setSaveState((currentState) =>
      currentState === 'saving' ? 'saved' : currentState,
    );
  }, 4000);

  return (
    <DefaultLayout title="User Preferences">
      <div className="flex flex-col items-center gap-12">
        <div className="flex flex-col items-center max-w-screen-lg gap-4">
          {user?.data === undefined ? null : user.data.isPro ? (
            <>
              <div className="flex flex-row gap-8 items-center">
                <div className="flex flex-col items-center">
                  <div className="flex flex-col items-center justify-center w-20 h-20 rounded-full border-solid border-4 border-teal">
                    <div className="i-tabler-user-star w-12 h-12" />
                  </div>
                  <div>Pro User</div>
                </div>
                <div className="flex flex-col items-start justify-center">
                  <p>
                    Thank you for supporting Slidr by being a Slidr Pro user!
                  </p>
                  <p className="text-base">
                    Your support ensures that Slidr can continue to make
                    presentations fun!{' '}
                    <span className="i-tabler-confetti w-6 h-6" />
                  </p>
                </div>
              </div>
              <div className="text-base">
                Manage your payment method or cancel your membership at anytime.
              </div>
              <a className="btn" href="https://shop.slidr.app/account">
                Manage your Slidr Pro account
              </a>
            </>
          ) : (
            <>
              <p className="text-xl">
                Did you know that Slidr is a <strong>free</strong> and{' '}
                <strong>open source</strong> project?
              </p>
              <p className="text-base">
                Go Pro to unlock exclusive features and support Slidr! Why go
                Pro?
              </p>
              <div className="self-center m-y-4">
                <ProComparison />
              </div>
              <GoProAction />
            </>
          )}
        </div>
        <div className="max-w-screen-sm mx-auto grid grid-cols-[auto_1fr] gap-4 w-full rounded-xl p-x-12 p-b-18 p-t-8 bg-gray-800">
          <div className="grid-col-span-2 text-2xl text-center">
            Preferences
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
            <div>X handle:</div>
            <div className="text-xs">(optional, for shares)</div>
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
      </div>
    </DefaultLayout>
  );
}
