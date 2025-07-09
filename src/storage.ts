import {connectStorageEmulator, getStorage} from 'firebase/storage';
import {app} from './firebase';

export const storage = getStorage(app);

if (import.meta.env.MODE === 'emulator') {
  connectStorageEmulator(storage, '127.0.0.1', 9199);
}
