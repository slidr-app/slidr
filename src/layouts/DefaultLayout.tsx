import {type User, onAuthStateChanged, signOut} from 'firebase/auth';
import {
  type ReactNode,
  type PropsWithChildren,
  useEffect,
  useState,
} from 'react';
import {Link} from 'react-router-dom';
import {auth} from '../firebase';

export default function DefaultLayout({
  title,
  children,
}: PropsWithChildren<{title: ReactNode}>) {
  const [user, setUser] = useState<User>();
  useEffect(() =>
    onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser ?? undefined);
    }),
  );
  return (
    <div className="flex flex-col">
      <div className="header grid grid-cols-[1fr_2fr_1fr] mx-4 px-4 mb-6">
        <div className="col-start-2 text-3xl flex flex-row items-center justify-center">
          <div>{title}</div>
        </div>
        <div className="col-start-3 flex flex-col items-end">
          {user ? (
            <button
              className="btn shadow-none text-base"
              type="button"
              onClick={async () => signOut(auth)}
            >
              Sign Out
            </button>
          ) : (
            <Link to="/signin">
              <button className="btn shadow-none text-base" type="button">
                Sign In
              </button>
            </Link>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}
