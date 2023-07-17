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
    username: 'test user',
    pages: [],
    notes: [],
    title: 'home1',
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
    username: 'test user',
    pages: ['img1.jpg', 'img2.jpg', 'img3.jpg'],
    notes: [],
    title: 'home2',
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
    username: 'test user',
    pages: ['img1.jpg', 'img2.jpg', 'img3.jpg'],
    notes: [],
    title: 'home3',
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
    const presentations = await within(presentationList).findAllByRole(
      'listitem',
    );
    expect(presentations).toHaveLength(3);

    await within(presentations[0]).findByRole('link', {name: /view.*home1/});
    await within(presentations[1]).findByRole('link', {name: /view.*home2/});
    await within(presentations[2]).findByRole('link', {name: /view.*home3/});
  });

  it('shows the edit button only on owned slideshows', async () => {
    renderRoute('/');

    const presentationList = await screen.findByRole('list', {
      name: /presentations/i,
    });
    const presentations = await within(presentationList).findAllByRole(
      'listitem',
    );

    await within(presentations[0]).findByRole('button', {name: /edit/});
    await within(presentations[1]).findByRole('button', {name: /edit/});
    expect(
      within(presentations[2]).queryByRole('button', {name: /edit/}),
    ).toBeNull();
  });

  it('shows the view button and present buttons on each', async () => {
    renderRoute('/');

    const presentationList = await screen.findByRole('list', {
      name: /presentations/i,
    });
    const presentations = await within(presentationList).findAllByRole(
      'listitem',
    );

    await within(presentations[0]).findByRole('button', {name: /view/});
    await within(presentations[0]).findByRole('button', {name: /present/});
    await within(presentations[1]).findByRole('button', {name: /view/});
    await within(presentations[1]).findByRole('button', {name: /present/});
    await within(presentations[2]).findByRole('button', {name: /view/});
    await within(presentations[2]).findByRole('button', {name: /present/});
  });
});
