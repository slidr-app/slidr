import {onAuthStateChanged, signOut} from 'firebase/auth';
import {
  type ReactNode,
  type PropsWithChildren,
  useEffect,
  useState,
  useContext,
} from 'react';
import {Link, NavLink} from 'react-router-dom';
import clsx from 'clsx';
import {auth} from '../firebase';
import {UserContext} from '../components/UserProvider';

export default function DefaultLayout({
  title,
  children,
}: PropsWithChildren<{title: ReactNode}>) {
  const {user, setUser} = useContext(UserContext);
  useEffect(
    () =>
      onAuthStateChanged(auth, (nextUser) => {
        if (!nextUser) {
          setUser(undefined);
          return;
        }

        setUser({uid: nextUser.uid, email: nextUser.email ?? undefined});
      }),
    [setUser],
  );
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <div className="flex flex-col min-h-screen">
      <div className="header flex flex-row mx-4 px-4 mb-6 lt-sm:(grid grid-cols-2 gap-y-2 px-2)">
        <div className="row-start-1 col-start-1 flex flex-row justify-start items-center relative gap-4 pt-2 mb--2">
          <NavLink
            to="/"
            className={({isActive}) =>
              clsx('flex', isActive && 'all-[div]:nav-active')
            }
          >
            <button
              className="hover:children:(nav-active) overflow-hidden pb-2"
              type="button"
              title="Speaker view"
            >
              <div className="flex flex-col items-center nav-inactive">
                Slidr
              </div>
            </button>
          </NavLink>
          {user && (
            <NavLink
              end
              to="/upload"
              className={({isActive}) =>
                clsx('flex', isActive && 'all-[div]:nav-active')
              }
            >
              <button
                className="hover:children:(nav-active) overflow-hidden pb-2"
                type="button"
                title="Speaker view"
              >
                <div className="flex flex-col items-center nav-inactive">
                  Upload
                </div>
              </button>
            </NavLink>
          )}
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
                  'btn py-1 shadow-md flex flex-col items-center',
                  showUserMenu && 'bg-teal rounded-b-none',
                )}
                type="button"
                title="User menu"
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
                <div className="leading-none text-sm">account</div>
              </button>
              <div
                className={clsx(
                  'absolute flex-col right-0 p-4 pb-2 bg-gray-900 bg-opacity-85 border-primary shadow-primary z-1 mr-4',
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
                <Link
                  to="/user"
                  className="text-base hover:children:(nav-active mb-0) overflow-hidden pb-2"
                >
                  <div className="mb-2px">Preferences</div>
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
      <div className="my-6 text-sm flex flex-col items-center text-center">
        <div>&copy; 2023 Slidr.app</div>
        <div className="prose">
          <a
            href="https://github.com/slidr-app/slidr/issues/new/choose"
            className="vertical-mid"
          >
            Something not right? Have an idea? Let us know on github.{' '}
            <div className="inline-block w-1.25rem h-1.25rem i-line-md-github-loop" />
          </a>
        </div>
      </div>
    </div>
  );
}
