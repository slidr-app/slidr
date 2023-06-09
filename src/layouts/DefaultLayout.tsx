import {type User, onAuthStateChanged, signOut} from 'firebase/auth';
import {
  type ReactNode,
  type PropsWithChildren,
  useEffect,
  useState,
} from 'react';
import {Link, NavLink} from 'react-router-dom';
import clsx from 'clsx';
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
      <div className="header flex flex-row mx-4 px-4 mb-6 lt-sm:(grid grid-cols-2 gap-y-2 px-2)">
        <div className="row-start-1 col-start-1 flex flex-row justify-start items-center relative gap-4">
          <div className="overflow-hidden flex flex-col justify-center pb-1">
            <NavLink
              end
              className={({isActive}) =>
                clsx('hover:nav-active bg-black', isActive && 'nav-active')
              }
              to="/"
            >
              Slidr
            </NavLink>
          </div>
          <div className="overflow-hidden flex flex-col justify-center pb-1">
            <NavLink
              className={({isActive}) =>
                clsx('hover:nav-active bg-black', isActive && 'nav-active')
              }
              to="/upload"
            >
              upload
            </NavLink>
          </div>
        </div>
        <div className="row-start-1 flex flex-grow flex-shrink" />
        <div className="row-start-2 col-span-full text-3xl flex flex-row items-center justify-center">
          <div>{title}</div>
        </div>
        <div className="row-start-1 flex flex-grow flex-shrink" />
        <div className="row-start-1 col-start-2 flex flex-col items-end">
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
