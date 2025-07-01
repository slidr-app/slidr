import {env} from 'node:process';
import {getStorage} from 'firebase-admin/storage';

// Hack together the bucket name when running in the emulator
// Note that the built-in .env file support does not seem to
// be present when loading functions (only inside the context of
// a function)
// See: https://github.com/firebase/firebase-tools/issues/4014#issuecomment-1021609657
export const bucketName =
  env.FUNCTIONS_EMULATOR === 'true'
    ? 'demo-test.firebasestorage.app'
    : undefined;

export function getBucket() {
  return bucketName ? getStorage().bucket(bucketName) : getStorage().bucket();
}
