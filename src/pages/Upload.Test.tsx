import {readFile} from 'node:fs/promises';
import {type UserCredential, signInAnonymously} from 'firebase/auth';
import {type PropsWithChildren} from 'react';
import {vi} from 'vitest';
import {collection, deleteDoc, getDocs, query, where} from 'firebase/firestore';
import {
  type FirebaseStorage,
  deleteObject,
  getStorage,
  ref,
} from 'firebase/storage';
import {app, auth, firestore} from '../firebase';
import {screen, userEvent, renderRoute, waitFor} from '../test/test-utils';
import {UserContext} from '../components/UserProvider';
import {MagicFile} from '../test/magic-file';
// eslint-disable-next-line import/no-unassigned-import
import '../test/pdf.worker.entry';

vi.mock('../components/Pdf/Pdf');
vi.mock('firebase/storage');

let cred: UserCredential;
let storage: FirebaseStorage;

beforeAll(async () => {
  cred = await signInAnonymously(auth);
  storage = getStorage(app);
  // Const admin = initializeApp({projectId: 'demo-test'});
  // const dbAdmin = getFirestore(admin);

  // const existing = await dbAdmin
  //   .collection('presentations')
  //   .where('uid', '==', cred.user.uid)
  //   .get();

  const existing = await getDocs(
    query(
      collection(firestore, 'presentations'),
      where('uid', '==', cred.user.uid),
    ),
  );

  // Remove any existing presentations
  await Promise.all(
    existing.docs.map(async (snapshot) => {
      await deleteObject(ref(storage, `presentations/${snapshot.id}`));
      await deleteDoc(snapshot.ref);
    }),
  );
});

describe('Presentation view', () => {
  it('renders and uploads the test presentation', async () => {
    const userContext = {
      user: {email: cred.user.email ?? undefined, uid: cred.user.uid},
      setUser: () => undefined,
    };

    renderRoute('/upload', {
      wrapper: ({children}: PropsWithChildren) => (
        <UserContext.Provider value={userContext}>
          {children}
        </UserContext.Provider>
      ),
    });

    const uploaderButton = await screen.findByRole(
      'button',
      {
        name: /drag 'n' drop/i,
      },
      {timeout: 4000},
    );

    const uploaderInput = uploaderButton.querySelector('input');

    expect(uploaderInput).not.toBeNull();

    // The magic file can be transformed to dataURI for react-pdf.Document
    // and a buffer for firebase/storage.uploadBytes (which does not support File objects when running in node)
    const pdfFile = new MagicFile(
      await readFile('./src/test/pdf/test.pdf'),
      'test.pdf',
      {
        type: 'application/pdf',
      },
    );

    // Jsdom mocks getComputedStyle, we need to return something so that the watermarking works
    vi.spyOn(window, 'getComputedStyle').mockImplementation(() => {
      const styles = new CSSStyleDeclaration();
      return styles;
    });

    await userEvent.upload(uploaderInput!, pdfFile);
    await waitFor(() => screen.getByText(/done/i));
  });
});
