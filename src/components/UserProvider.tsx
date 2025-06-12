import {
  useState,
  type PropsWithChildren,
  useMemo,
  createContext,
  useCallback,
} from 'react';

export type User = {
  email?: string;
  uid: string;
  isPro?: boolean;
};

export type UserDocument = {
  username?: string;
  twitterHandle?: string;
  isPro?: boolean;
};

export const UserContext = createContext<{
  user: User | undefined;
  setUser: (nextUser: User | undefined) => void;
  setIsPro: (isPro: boolean) => void;
}>({user: undefined, setUser: () => undefined, setIsPro: () => undefined});

export function UserProvider({children}: PropsWithChildren) {
  const [user, setUser] = useState<User>();

  const updateUser = useCallback(
    (newUser: User | undefined) => {
      setUser((currentUser) => {
        if (currentUser === undefined && newUser === undefined) {
          return currentUser;
        }

        if (
          currentUser?.uid === newUser?.uid &&
          currentUser?.uid === newUser?.uid &&
          currentUser?.isPro === newUser?.isPro
        ) {
          return currentUser;
        }

        // Only update if something changed
        return newUser;
      });
    },
    [setUser],
  );

  const setIsPro = useCallback(
    (isPro: boolean) => {
      setUser((user) => {
        if (!user) {
          return user;
        }

        if (user.isPro === isPro) {
          return user;
        }

        // Only update if pro status changed
        return {...user, isPro};
      });
    },
    [setUser],
  );

  const userContext = useMemo(
    () => ({user, setUser: updateUser, setIsPro}),
    [user, updateUser, setIsPro],
  );
  return (
    <UserContext.Provider value={userContext}>{children}</UserContext.Provider>
  );
}
