import {signInWithEmailAndPassword} from 'firebase/auth';
import {auth} from '../firebase';
import Button from './toolbar/Button';

export default function DeveloperSignIn() {
  return (
    <div className="flex flex-col items-center gap-2 mt-8">
      <div className="text-red-600">
        This button only exists on emulator mode builds.
      </div>
      <Button
        border
        label="Sign In with Test Account"
        title="Sign In with Test Account"
        icon="i-tabler-bug"
        onClick={() => {
          void signInWithEmailAndPassword(
            auth,
            'test@doesnotexist.com',
            '123456',
          );
        }}
      />
    </div>
  );
}
