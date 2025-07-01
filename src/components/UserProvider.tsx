import {
  useState,
  type PropsWithChildren,
  useMemo,
  createContext,
  useCallback,
} from 'react';
import type {UserDocument} from '../user-schema';

export type User = {
  email?: string;
  uid: string;
  data?: UserDocument;
};

export const UserContext = createContext<{
  user: User | undefined;
  setUser: (nextUser: User | undefined) => void;
  setUserData: (data: UserDocument) => void;
}>({user: undefined, setUser: () => undefined, setUserData: () => undefined});

export function UserProvider({children}: PropsWithChildren) {
  const [user, setUser] = useState<User>();

  const updateUser = useCallback(
    (newUser: User | undefined) => {
      setUser((currentUser) => {
        if (
          currentUser?.uid === newUser?.uid &&
          currentUser?.email === newUser?.email &&
          currentUser?.data?.isPro === newUser?.data?.isPro &&
          currentUser?.data?.twitterHandle === newUser?.data?.twitterHandle &&
          currentUser?.data?.username === newUser?.data?.username
        ) {
          return currentUser;
        }

        // Only update if something changed
        return newUser;
      });
    },
    [setUser],
  );

  const setUserData = useCallback(
    (data: UserDocument) => {
      setUser((user) => {
        if (!user) {
          return user;
        }

        // TODO: is there a fancier way to check? Maybe compare Object.entries?
        if (
          user.data !== undefined &&
          user.data?.isPro === data?.isPro &&
          user.data?.twitterHandle === data?.twitterHandle &&
          user.data?.username === data?.username
        ) {
          return user;
        }

        // Only update if details changed
        return {...user, data};
      });
    },
    [setUser],
  );

  const userContext = useMemo(
    () => ({user, setUser: updateUser, setUserData}),
    [user, updateUser, setUserData],
  );

  return (
    <UserContext.Provider value={userContext}>{children}</UserContext.Provider>
  );
}
