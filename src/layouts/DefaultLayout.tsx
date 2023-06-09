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
  const [showUserMenu, setShowUserMenu] = useState(false);

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
            <div>
              <button
                className={clsx(
                  'btn py-1 shadow-md',
                  showUserMenu && 'bg-teal rounded-b-none',
                )}
                type="button"
                onClick={() => {
                  setShowUserMenu((show) => !show);
                }}
              >
                <div
                  className={clsx(
                    'i-tabler-user-circle',
                    showUserMenu ? 'text-black' : 'text-teal',
                  )}
                />
              </button>
              <div
                className={clsx(
                  'absolute flex-col right-0 p-4 bg-gray-900 bg-opacity-85 border-primary shadow-primary z-1 mr-4',
                  showUserMenu ? 'flex' : 'display-none',
                )}
              >
                <button
                  className="text-base hover:children:(nav-active mb-0) overflow-hidden pb-2"
                  type="button"
                  onClick={async () => signOut(auth)}
                >
                  <div className="mb-2px">Sign Out</div>
                </button>
                <Link to="/user">
                  <button
                    className="text-base hover:children:(nav-active mb-0) overflow-hidden pb-2"
                    type="button"
                    onClick={async () => signOut(auth)}
                  >
                    <div className="mb-2px">Preferences</div>
                  </button>
                </Link>
              </div>
            </div>
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
