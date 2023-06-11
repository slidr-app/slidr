import {useState, type PropsWithChildren, useMemo, createContext} from 'react';

export type User = {
  email?: string;
  uid: string;
};

export type UserDoc = {
  username?: string;
};

export const UserContext = createContext<{
  user: User | undefined;
  setUser: (nextUser: User | undefined) => void;
}>({user: undefined, setUser: () => undefined});

export function UserProvider({children}: PropsWithChildren) {
  const [user, setUser] = useState<User>();
  const userContext = useMemo(() => ({user, setUser}), [user]);
  return (
    <UserContext.Provider value={userContext}>{children}</UserContext.Provider>
  );
}
