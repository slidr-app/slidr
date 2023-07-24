import {readFile} from 'node:fs/promises';
import {type UserCredential, signInAnonymously} from 'firebase/auth';
import {Suspense, type PropsWithChildren} from 'react';
import {vi} from 'vitest';
import {collection, getDocs, query, where} from 'firebase/firestore';
import {type FirebaseStorage, getStorage} from 'firebase/storage';
import {app, auth, firestore} from '../firebase';
import {screen, userEvent, renderRoute, act, cleanup} from '../test/test-utils';
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
});

describe('Upload page', () => {
  let pdfFile: MagicFile;
  it('renders and uploads the test presentation', async () => {
    const userContext = {
      user: {email: cred.user.email ?? undefined, uid: cred.user.uid},
      setUser: () => undefined,
    };

    vi.spyOn(window, 'getComputedStyle').mockImplementation(() => {
      const styles = new CSSStyleDeclaration();
      return styles;
    });

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
    pdfFile = new MagicFile(
      await readFile('./src/test/pdf/test.pdf'),
      'test.pdf',
      {
        type: 'application/pdf',
      },
    );

    // Jsdom mocks getComputedStyle, we need to return something so that the watermarking works
    await userEvent.upload(uploaderInput!, pdfFile);
    await screen.findByText(/done/i);
  });

  it('renders the uploaded presentation', async () => {
    const existing = await getDocs(
      query(
        collection(firestore, 'presentations'),
        where('uid', '==', cred.user.uid),
      ),
    );
    expect(existing.docs).toHaveLength(1);
    const presentationId = existing.docs[0].id;

    renderRoute(`/p/${presentationId}`, {
      wrapper: ({children}: PropsWithChildren) => (
        // Not sure why, but need suspense here after the previous test
        <Suspense>{children}</Suspense>
      ),
    });

    const slide1ImageElement = await screen.findByRole('img', {
      name: 'Slide page 1',
    });
    expect(slide1ImageElement).toBeInTheDocument();

    const slide1ImageUrl = slide1ImageElement.getAttribute('src');
    expect(slide1ImageUrl).not.toBeNull();

    // Cleanup now, before reading image data to avoid components changing state while fetching/reading
    cleanup();

    // Things can shift around (the toolbar becomes hidden specifically) while loading the image data
    // Run them inside act to avoid errors
    const slide1ImageResponse = await fetch(slide1ImageUrl!);
    const slide1ImageBuffer = await slide1ImageResponse.arrayBuffer();
    const slide1ImageFile = await readFile('./src/test/pdf/page1.webp');
    const slide1ImageActual = new Uint8Array(slide1ImageBuffer);
    const slide1ImageExpected = new Uint8Array(slide1ImageFile);

    expect(slide1ImageActual).toEqual(slide1ImageExpected);
  });
});
