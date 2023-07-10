import {connectStorageEmulator, getStorage} from 'firebase/storage';
import {connectAuthEmulator, signInAnonymously} from 'firebase/auth';
import {connectFirestoreEmulator, doc, setDoc} from 'firebase/firestore';
import {app, auth, firestore} from '../firebase';
import {screen, userEvent, renderRoute} from '../test/test-utils';

beforeAll(async () => {
  const storage = getStorage(app);
  connectAuthEmulator(auth, 'http://127.0.0.1:9099');
  connectFirestoreEmulator(firestore, '127.0.0.1', 8080);
  connectStorageEmulator(storage, '127.0.0.1', 9199);

  // Use anonymous auth because email link is complicated to emulate
  const cred = await signInAnonymously(auth);

  // Clear firestore before we start
  await fetch(
    'http://127.0.0.1:8080/emulator/v1/projects/demo-test/databases/(default)/documents',
    {method: 'DELETE'},
  );

  // Add a single presentation to firestore
  await setDoc(doc(firestore, 'presentations', 'presentation-1'), {
    uid: cred.user.uid,
    created: Date.now(),
    username: 'test user',
    pages: ['img1.jpg', 'img2.jpg', 'img3.jpg'],
    notes: [],
    title: 'test presentation',
  });
});

describe('Presentation view', () => {
  it('renders the first slide', async () => {
    renderRoute('/p/presentation-1');
    const slide = await screen.findByRole('img', {name: 'Slide page 1'});
    expect(slide).toHaveAttribute('src', 'img1.jpg');
  });

  it('can navigate to the next slide with toolbar', async () => {
    renderRoute('/p/presentation-1');
    await screen.findByRole('img', {name: 'Slide page 1'});
    const next = screen.getByRole('button', {name: 'next'});
    await userEvent.click(next);
    const slide2 = await screen.findByRole('img', {name: 'Slide page 2'});
    expect(slide2).toHaveAttribute('src', 'img2.jpg');
  });

  it('can navigate to the next slide by clicking on the image', async () => {
    renderRoute('/p/presentation-1');
    const slide1 = await screen.findByRole('img', {name: 'Slide page 1'});
    await userEvent.click(slide1);
    const slide2 = await screen.findByRole('img', {name: 'Slide page 2'});
    expect(slide2).toHaveAttribute('src', 'img2.jpg');
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

  // It.skip('should increment count on click', async () => {
  //   render(<Presentation />);
  //   void userEvent.click(screen.getByRole('button'));
  //   expect(await screen.findByText(/count is: 1/i)).toBeInTheDocument();
  // });

  // it.skip('uses flexbox in app header', async () => {
  //   render(<Presentation />);
  //   const element = screen.getByRole('banner');
  //   expect(element.className).toEqual('App-header');
  //   expect(getComputedStyle(element).display).toEqual('flex');
  // });
});
