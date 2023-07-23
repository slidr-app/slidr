import {signInAnonymously} from 'firebase/auth';
import {doc, setDoc, updateDoc} from 'firebase/firestore';
import {initializeApp} from 'firebase-admin/app';
import {getFirestore} from 'firebase-admin/firestore';
import {auth, firestore} from '../firebase';
import {screen, renderRoute, within} from '../test/test-utils';
import {
  type PresentationCreate,
  type PresentationUpdate,
} from '../../functions/src/presentation';

beforeAll(async () => {
  const admin = initializeApp({projectId: 'demo-test'});
  const dbAdmin = getFirestore(admin);
  const cred = await signInAnonymously(auth);

  await fetch(
    'http://127.0.0.1:8080/emulator/v1/projects/demo-test/databases/(default)/documents/presentations/home-p1',
    {method: 'DELETE'},
  );

  await fetch(
    'http://127.0.0.1:8080/emulator/v1/projects/demo-test/databases/(default)/documents/presentations/home-p2',
    {method: 'DELETE'},
  );

  await fetch(
    'http://127.0.0.1:8080/emulator/v1/projects/demo-test/databases/(default)/documents/presentations/home-p3',
    {method: 'DELETE'},
  );

  const now = new Date();

  // Add 3 presentations in the future to firestore
  await setDoc(doc(firestore, 'presentations', 'home-p1'), {
    uid: cred.user.uid,
    created: now,
    username: 'home user',
    pages: [],
    notes: [],
    title: 'home1',
    twitterHandle: '@doesnotexist',
  } satisfies PresentationCreate);
  await updateDoc(doc(firestore, 'presentations', 'home-p1'), {
    notes: [],
    pages: [],
    title: 'home1',
    rendered: new Date(2040, 10),
  } as PresentationUpdate);

  await setDoc(doc(firestore, 'presentations', 'home-p2'), {
    uid: cred.user.uid,
    created: now,
    username: 'home user',
    pages: ['img1.jpg', 'img2.jpg', 'img3.jpg'],
    notes: [],
    title: 'home2',
    twitterHandle: '@doesnotexist',
  } satisfies PresentationCreate);
  await updateDoc(doc(firestore, 'presentations', 'home-p2'), {
    notes: [],
    pages: [],
    title: 'home2',
    rendered: new Date(2040, 9),
  } as PresentationUpdate);

  await setDoc(doc(firestore, 'presentations', 'home-p3'), {
    uid: cred.user.uid,
    created: now,
    username: 'home user',
    pages: ['img1.jpg', 'img2.jpg', 'img3.jpg'],
    notes: [],
    title: 'home3',
    twitterHandle: '@doesnotexist',
  } satisfies PresentationCreate);
  await updateDoc(doc(firestore, 'presentations', 'home-p3'), {
    notes: [],
    pages: [],
    title: 'home3',
    rendered: new Date(2040, 8),
  } as PresentationUpdate);

  // Change the owner of one of the presentations using the admin interface
  await dbAdmin.doc('presentations/home-p3').update({uid: 'someone else'});
});

describe('Home view', () => {
  it('lists ordered slideshows with view links', async () => {
    renderRoute('/');

    const presentationList = await screen.findByRole('list', {
      name: /presentations/i,
    });
    const allPresentations = await within(presentationList).findAllByRole(
      'listitem',
    );

    // Other tests may add presentations, so expect the length to be at least 3
    expect(allPresentations).toHaveProperty('length');
    expect(allPresentations.length).toBeGreaterThanOrEqual(3);

    const presentations = allPresentations
      .map((presentation) =>
        within(presentation).queryByRole('link', {name: /home user/}),
      )
      .filter(Boolean) as HTMLElement[];

    expect(presentations).toHaveLength(3);

    await within(presentations[0]).findByText(/home1/);
    await within(presentations[1]).findByText(/home2/);
    await within(presentations[2]).findByText(/home3/);
  });

  it('shows the edit button only on owned slideshows', async () => {
    renderRoute('/');

    const presentationList = await screen.findByRole('list', {
      name: /presentations/i,
    });
    const allPresentations = await within(presentationList).findAllByRole(
      'listitem',
    );

    const ownedPresentations = allPresentations.filter((presentation) =>
      within(presentation).queryByText('home user'),
    );

    const notOwnedPresentations = allPresentations.filter((presentation) =>
      within(presentation).queryByText('home user'),
    );

    for (const presentation of ownedPresentations) {
      expect(
        within(presentation).queryByRole('button', {name: /edit/}),
      ).not.toBeNull();
    }

    for (const presentation of notOwnedPresentations) {
      expect(
        within(presentation).queryAllByRole('button', {name: /edit/}),
      ).toBeNull();
    }
  });

  it('shows the view button and present buttons on each', async () => {
    renderRoute('/');

    const presentationList = await screen.findByRole('list', {
      name: /presentations/i,
    });
    const presentations = await within(presentationList).findAllByRole(
      'listitem',
    );

    expect(presentations.length).toBeGreaterThanOrEqual(3);

    for (const presentation of presentations) {
      expect(within(presentation).queryByRole('button', {name: /view/}));
      expect(within(presentation).queryByRole('button', {name: /present/}));
    }
  });
});
