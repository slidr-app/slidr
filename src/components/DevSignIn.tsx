import {signInWithEmailAndPassword} from 'firebase/auth';
import {auth} from '../firebase';

export default function DevSignIn() {
  return (
    <div className="flex flex-col items-center">
      <div className="text-red-600">
        This button only exists on emulator mode builds.
      </div>
      <button
        type="button"
        className="btn"
        onClick={() => {
          void signInWithEmailAndPassword(
            auth,
            'test@doesnotexist.com',
            '123456',
          );
        }}
      >
        Sign In with Test Account
      </button>
    </div>
  );
}
