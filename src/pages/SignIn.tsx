import {useCallback, useEffect, useState} from 'react';
import {
  type User,
  isSignInWithEmailLink,
  onAuthStateChanged,
  sendSignInLinkToEmail,
  signInWithEmailLink,
} from 'firebase/auth';
import {Link, useNavigate} from 'react-router-dom';
import clsx from 'clsx';
import {auth} from '../firebase';
import Loading from '../components/Loading';

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

  const isLink = isSignInWithEmailLink(auth, window.location.href);

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
        await signInWithEmailLink(auth, signInEmail, window.location.href);
        navigate('/');
      } catch (error) {
        setSignInError(error as Error);
      } finally {
        window.localStorage.removeItem('emailForSignIn');
      }
    },
    [navigate],
  );

  useEffect(() => {
    const storedEmail = window.localStorage.getItem('emailForSignIn');
    if (isSignInWithEmailLink(auth, window.location.href) && storedEmail) {
      console.log('signing in');
      void signInAndRemoveEmail(storedEmail);
    }
  }, [signInAndRemoveEmail]);

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

  if (signingIn) {
    return (
      <div className="w-screen h-screen">
        <Loading message="Signing In..." />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 p-4 w-screen">
      {user && (
        <div className="prose">
          You are already signed as {user.email}. You should probably head{' '}
          <Link to="/">home</Link>.
        </div>
      )}
      {/* {user && (
        <button
          className="btn"
          type="button"
          onClick={() => {
            void signOut(auth);
          }}
        >
          Sign Out
        </button>
      )} */}
      <form className="flex flex-row justify-center items-center gap-2 flex-wrap w-full">
        <input
          className="input w-auto"
          type="email"
          placeholder="email address..."
          value={email}
          disabled={emailSent}
          size={30}
          onChange={(event) => {
            setEmail(event.target.value);
          }}
        />
        {isLink ? (
          <button
            className="btn"
            type="button"
            onClick={() => {
              void signInAndRemoveEmail(email);
            }}
          >
            Verify & Sign In
          </button>
        ) : (
          <button
            className="btn flex flex-row items-center gap-2"
            type="button"
            disabled={emailSent}
            onClick={async () => {
              setEmailSending(true);
              await sendSignInLinkToEmail(auth, email, actionCodeSettings);
              window.localStorage.setItem('emailForSignIn', email);
              setEmailSent(true);
            }}
          >
            <div
              className={clsx(
                emailSent ? 'i-tabler-mail-fast' : 'i-tabler-send',
                !emailSent && emailSending && 'animate-spin',
              )}
            />
            <div>{emailSent ? 'Email Sent' : 'Send Email'}</div>
          </button>
        )}
      </form>
      {emailSent && (
        <div>
          Please click on the link sent in the email. You can close this page.
        </div>
      )}
    </div>
  );
}
