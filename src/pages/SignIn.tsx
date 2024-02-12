import {lazy, useCallback, useEffect, useState} from 'react';
import {
  type User,
  isSignInWithEmailLink,
  onAuthStateChanged,
  sendSignInLinkToEmail,
  signInWithEmailLink,
} from 'firebase/auth';
import {Link, useLocation, useNavigate} from 'react-router-dom';
import clsx from 'clsx';
import {auth} from '../firebase';
import Loading from '../components/Loading';
import Button from '../components/toolbar/Button';
import DefaultLayout from '../layouts/DefaultLayout';

const DeveloperSignIn = lazy(async () => import('../components/DevSignIn'));

export default function SignIn() {
  useEffect(() => {
    document.title = `Slidr - Sign In`;
  }, []);

  const actionCodeSettings = {
    // URL you want to redirect back to. The domain (www.example.com) for this
    // URL must be in the authorized domains list in the Firebase Console.
    // url: 'https://www.example.com/finishSignUp?cartId=1234',
    url: `${window.location.origin}/signin`,
    // This must be true.
    handleCodeInApp: true,
    // IOS: {
    //   bundleId: 'com.example.ios'
    // },
    // android: {
    //   packageName: 'com.example.android',
    //   installApp: true,
    //   minimumVersion: '12'
    // },
    // dynamicLinkDomain: 'example.page.link',
  };

  // Build the current url with react router location, allowing this to be tested
  const location = useLocation();
  const currentUrl = `${window.location.origin}${location.pathname}${location.search}`;

  const isLink = isSignInWithEmailLink(auth, currentUrl);

  const navigate = useNavigate();
  const [signInError, setSignInError] = useState<Error>();

  if (signInError) {
    throw signInError;
  }

  const [signingIn, setSigningIn] = useState(false);

  const signInAndRemoveEmail = useCallback(
    async (signInEmail: string) => {
      setSigningIn(true);
      try {
        await signInWithEmailLink(auth, signInEmail, currentUrl);
        navigate('/');
      } catch (error) {
        setSignInError(error as Error);
      } finally {
        window.localStorage.removeItem('emailForSignIn');
      }
    },
    [navigate, currentUrl],
  );

  useEffect(() => {
    const storedEmail = window.localStorage.getItem('emailForSignIn');
    if (isSignInWithEmailLink(auth, currentUrl) && storedEmail) {
      console.log('signing in');
      void signInAndRemoveEmail(storedEmail);
    }
  }, [signInAndRemoveEmail, currentUrl]);

  const [email, setEmail] = useState(
    window.localStorage.getItem('emailForSignIn') ?? '',
  );

  const [user, setUser] = useState<User | undefined>();

  useEffect(
    () =>
      onAuthStateChanged(auth, (nextAuth) => {
        setUser(nextAuth ?? undefined);
      }),
    [],
  );

  const [emailSending, setEmailSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  return (
    <DefaultLayout title="Sign In to Slidr">
      {signingIn ? (
        <div className="w-screen h-screen">
          <Loading message="Signing In..." />
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 p-4">
          {user && (
            <div className="prose">
              You are already signed as {user.email}. You should probably head{' '}
              <Link to="/">home</Link>.
            </div>
          )}
          <form
            className="flex flex-row justify-center items-stretch gap-2 flex-wrap w-full"
            onSubmit={async (event) => {
              event.preventDefault();
              if (isLink) {
                void signInAndRemoveEmail(email);
                return;
              }

              setEmailSending(true);
              await sendSignInLinkToEmail(auth, email, actionCodeSettings);
              window.localStorage.setItem('emailForSignIn', email);
              setEmailSent(true);
            }}
          >
            <label className="flex flex-row gap-2 items-stretch">
              <div className="flex flex-row items-center">Email:</div>
              <input
                className="input w-auto invalid:(border-red-700 shadow-red-700) invalid-focus:(border-red-700 shadow-red-700)"
                id="email"
                type="email"
                placeholder="email address..."
                value={email}
                disabled={emailSent}
                size={30}
                onChange={(event) => {
                  setEmail(event.target.value);
                }}
              />
            </label>
            {isLink ? (
              <Button
                border
                submit
                icon="i-tabler-user-check"
                label="Verify & Sign In"
                title="Verify & Sign In"
              />
            ) : (
              <Button
                border
                submit
                icon={clsx(
                  emailSent ? 'i-tabler-mail-fast' : 'i-tabler-send',
                  !emailSent && emailSending && 'animate-spin',
                )}
                label={emailSent ? 'Email Sent' : 'Send Email'}
                title={emailSent ? 'Email Sent' : 'Send Email'}
                disabled={emailSent}
              />
            )}
          </form>
          {emailSent && (
            <div>
              Please click on the link sent in the email. You can close this
              page.
            </div>
          )}
          {import.meta.env.MODE === 'emulator' && <DeveloperSignIn />}
        </div>
      )}
    </DefaultLayout>
  );
}
