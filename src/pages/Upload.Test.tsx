import {readFile} from 'node:fs/promises';
import {type UserCredential, signInAnonymously} from 'firebase/auth';
import {Suspense, type PropsWithChildren} from 'react';
import {type SpyInstance, vi} from 'vitest';
import {collection, getDocs, query, where} from 'firebase/firestore';
import {getFirestore} from 'firebase-admin/firestore';
import {initializeApp} from 'firebase-admin/app';
import {auth, firestore} from '../firebase';
import {screen, userEvent, renderRoute, cleanup} from '../test/test-utils';
import {UserContext} from '../components/UserProvider';
import {MagicFile} from '../test/magic-file';
// eslint-disable-next-line import/no-unassigned-import
import '../test/pdf.worker.entry';

/* 
  This is a complicated test due to how presentation pages are rendered using react-pdf
  in the browser and then the canvas is converted to image files.

  In order for the test to work, we add a mock wrapper over react-pdf to render the pdfs
  as a data uri. A separate mock of firebase storage ensures that their API will upload
  the accepted file (firebase/storage only accepts buffers, not File objects, when running in node, i.e.
  tests with jsdom). Finally, this also relies on having a mocked canvas since the rendering
  relies heavily on the canvas. vitest-mock-canvas is added in the global test setup.
*/

vi.mock('../components/pdf/Pdf');
vi.mock('firebase/storage');

const adminApp = initializeApp({projectId: 'demo-test'});
const adminDb = getFirestore(adminApp);

let getComputedStyleMock: SpyInstance;
let cred: UserCredential;

beforeAll(() => {
  getComputedStyleMock = vi
    .spyOn(window, 'getComputedStyle')
    .mockImplementation(() => {
      const styles = new CSSStyleDeclaration();
      return styles;
    });
});

afterAll(() => {
  getComputedStyleMock.mockRestore();
});

describe('Upload page when uploading only', () => {
  beforeAll(async () => {
    cred = await signInAnonymously(auth);
  });

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

    const uploaderButton = await screen.findByRole('button', {
      name: /drag 'n' drop/i,
    });

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
    await userEvent.upload(uploaderInput!, pdfFile);
    await screen.findByText(/done/i, undefined, {timeout: 30_000});
  }, 35_000);

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

describe('Upload page when uploading and editing preferences', () => {
  beforeAll(async () => {
    // Delete any pre-existing instances of the presentation we will upload
    const querySnapshot = await adminDb
      .collection('presentations')
      .where('title', '==', 'Upload Test Presentation')
      .get();
    await Promise.all(
      querySnapshot.docs.map(async (snapshot) => snapshot.ref.delete()),
    );
    cred = await signInAnonymously(auth);
  });

  it('Modifies the presentation preferences', async () => {
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

    const uploaderButton = await screen.findByRole('button', {
      name: /drag 'n' drop/i,
    });

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
    await userEvent.upload(uploaderInput!, pdfFile);

    const presentationNameElement = await screen.findByRole('textbox', {
      name: /title/i,
    });
    await userEvent.type(presentationNameElement, 'Upload Test Presentation');
    await screen.findByText(/saved/i, undefined, {timeout: 30_000});
  }, 35_000);

  it('renders the uploaded presentation', async () => {
    renderRoute('/', {
      wrapper: ({children}: PropsWithChildren) => (
        // Not sure why, but need suspense here after the previous test
        <Suspense>{children}</Suspense>
      ),
    });

    await screen.findByRole('link', {name: /upload test presentation/i});
  });
});
