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
  it.only('renders and uploads the test presentation', async () => {
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
    const pdfFile = new MagicFile(await readFile('./test.pdf'), 'test.pdf', {
      type: 'application/pdf',
    });

    await userEvent.upload(uploaderInput!, pdfFile);
    await waitFor(() => screen.getByText(/done/i));
  });

  it('can navigate to the next slide with toolbar', async () => {
    renderRoute('/p/presentation-1');
    await screen.findByRole('img', {name: 'Slide page 1'});
    const next = screen.getByRole('button', {name: 'next'});
    await userEvent.click(next);
    const slide2 = await screen.findByRole('img', {name: 'Slide page 2'});
    expect(slide2).toHaveAttribute('src', 'img2.jpg');
  });

  it('can navigate to the last slide with toolbar', async () => {
    renderRoute('/p/presentation-1');
    await screen.findByRole('img', {name: 'Slide page 1'});
    const end = screen.getByRole('button', {name: 'end'});
    await userEvent.click(end);
    const slide2 = await screen.findByRole('img', {name: 'Slide page 3'});
    expect(slide2).toHaveAttribute('src', 'img3.jpg');
  });

  it('can navigate to the next slide by clicking on the image', async () => {
    renderRoute('/p/presentation-1');
    const slide1 = await screen.findByRole('img', {name: 'Slide page 1'});
    await userEvent.click(slide1);
    const slide2 = await screen.findByRole('img', {name: 'Slide page 2'});
    expect(slide2).toHaveAttribute('src', 'img2.jpg');
  });

  it('can navigate to the last slide with toolbar', async () => {
    renderRoute('/p/presentation-1');
    await screen.findByRole('img', {name: 'Slide page 1'});
    const end = screen.getByRole('button', {name: 'end'});
    await userEvent.click(end);
    const slide2 = await screen.findByRole('img', {name: 'Slide page 3'});
    expect(slide2).toHaveAttribute('src', 'img3.jpg');
  });

  it('can read the slide index from the search params', async () => {
    renderRoute('/p/presentation-1?slide=2');
    const slide2 = await screen.findByRole('img', {name: 'Slide page 2'});
    expect(slide2).toHaveAttribute('src', 'img2.jpg');
  });

  it('can navigate to the previous slide with toolbar', async () => {
    renderRoute('/p/presentation-1?slide=2');
    await screen.findByRole('img', {name: 'Slide page 2'});
    const previous = await screen.findByRole('button', {name: 'previous'});
    await userEvent.click(previous);
    const slide1 = await screen.findByRole('img', {name: 'Slide page 1'});
    expect(slide1).toHaveAttribute('src', 'img1.jpg');
  });

  it('can navigate to the first slide with toolbar', async () => {
    renderRoute('/p/presentation-1?slide=3');
    await screen.findByRole('img', {name: 'Slide page 3'});
    const start = await screen.findByRole('button', {name: 'start'});
    await userEvent.click(start);
    const slide1 = await screen.findByRole('img', {name: 'Slide page 1'});
    expect(slide1).toHaveAttribute('src', 'img1.jpg');
  });
});
