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
};

export type UserDocument = {
  username?: string;
  twitterHandle?: string;
};

export const UserContext = createContext<{
  user: User | undefined;
  setUser: (nextUser: User | undefined) => void;
}>({user: undefined, setUser: () => undefined});

export function UserProvider({children}: PropsWithChildren) {
  const [user, setUser] = useState<User>();

  const updateUser = useCallback(
    (newUser: User | undefined) => {
      // Don't update if nothing has changed to avoid rerenders
      if (user?.email === newUser?.email && user?.uid === newUser?.uid) {
        return;
      }

      setUser(newUser);
    },
    [user],
  );
  const userContext = useMemo(
    () => ({user, setUser: updateUser}),
    [user, updateUser],
  );
  return (
    <UserContext.Provider value={userContext}>{children}</UserContext.Provider>
  );
}
