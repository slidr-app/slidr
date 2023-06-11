import {useContext, useEffect, useState} from 'react';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore/lite';
import {useDebouncedCallback} from 'use-debounce';
import DefaultLayout from '../layouts/DefaultLayout';
import {UserContext, type UserDoc} from '../components/UserProvider';
import {firestore} from '../firebase';
import SaveIndicator from '../components/SaveIndicator';

export default function UserPreferences() {
  const {user} = useContext(UserContext);
  const [userData, setUserData] = useState<UserDoc>({});

  useEffect(() => {
    async function getUserDoc() {
      if (!user) {
        return;
      }

      const userSnapshot = await getDoc(doc(firestore, `users/${user.uid}`));
      if (!userSnapshot.exists()) {
        setUserData({});
        return;
      }

      const nextUser = userSnapshot.data() as UserDoc;

      setUserData({username: nextUser.username});
    }

    void getUserDoc();
  }, [user]);

  const [saveState, setSaveState] = useState<'saved' | 'saving' | 'dirty'>(
    'saved',
  );

  const save = useDebouncedCallback(async () => {
    setSaveState('saving');
    await setDoc(doc(firestore, `users/${user!.uid}`), userData, {merge: true});
    const userPersentationsSnapshot = await getDocs(
      query(
        collection(firestore, 'presentations'),
        where('uid', '==', user!.uid),
      ),
    );
    await Promise.all(
      userPersentationsSnapshot.docs.map(async (presentation) =>
        updateDoc(doc(firestore, 'presentations', presentation.id), {
          username: userData.username,
        }),
      ),
    );
    setSaveState((currentState) =>
      currentState === 'saving' ? 'saved' : currentState,
    );
  }, 4000);

  return (
    <DefaultLayout title="User Preferences">
      <div className="max-w-screen-sm mx-auto grid grid-cols-[auto_1fr] gap-4 w-full">
        <label className="flex items-center justify-end">Email:</label>
        <div className="">{user?.email ?? ''}</div>
        <label className="flex items-center justify-end">Username:</label>
        <input
          className="input flex-grow"
          value={userData.username ?? ''}
          onChange={(event) => {
            setSaveState('dirty');
            setUserData((currentUser) => ({
              ...currentUser,
              username: event.target.value,
            }));
            void save();
          }}
        />
        <SaveIndicator saveState={saveState} />
      </div>
    </DefaultLayout>
  );
}
