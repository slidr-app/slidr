import {getFirestore} from 'firebase-admin/firestore';
import {initializeApp} from 'firebase-admin/app';

export const admin = initializeApp({projectId: 'demo-test'});
export const dbAdmin = getFirestore(admin);
