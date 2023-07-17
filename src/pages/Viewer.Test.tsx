import {signInAnonymously} from 'firebase/auth';
import {doc, setDoc} from 'firebase/firestore';
import {auth, firestore} from '../firebase';
import {screen, userEvent, renderRoute} from '../test/test-utils';
import {type PresentationCreate} from '../../functions/src/presentation';

beforeAll(async () => {
  // Use anonymous auth because email link is complicated to emulate
  const cred = await signInAnonymously(auth);

  await fetch(
    'http://127.0.0.1:8080/emulator/v1/projects/demo-test/databases/(default)/documents/presentations/viewer-1',
    {method: 'DELETE'},
  );

  // Add a single presentation to firestore
  await setDoc(doc(firestore, 'presentations', 'viewer-1'), {
    uid: cred.user.uid,
    created: new Date(),
    username: 'test user',
    pages: ['img1.jpg', 'img2.jpg', 'img3.jpg'],
    notes: [],
    title: 'test presentation',
    twitterHandle: '@doesnotexist',
  } satisfies PresentationCreate);
});

describe('Viewer view', () => {
  it('renders the first slide', async () => {
    renderRoute('/v/viewer-1');
    const slide = await screen.findByRole('img', {name: 'Slide page 1'});
    expect(slide).toHaveAttribute('src', 'img1.jpg');
  });

  it('can navigate to the next slide with toolbar', async () => {
    renderRoute('/v/viewer-1');
    await screen.findByRole('img', {name: 'Slide page 1'});
    const next = screen.getByRole('button', {name: 'next'});
    await userEvent.click(next);
    const slide2 = await screen.findByRole('img', {name: 'Slide page 2'});
    expect(slide2).toHaveAttribute('src', 'img2.jpg');
  });

  it('can navigate to the last slide with toolbar', async () => {
    renderRoute('/v/viewer-1');
    await screen.findByRole('img', {name: 'Slide page 1'});
    const end = screen.getByRole('button', {name: 'end'});
    await userEvent.click(end);
    const slide2 = await screen.findByRole('img', {name: 'Slide page 3'});
    expect(slide2).toHaveAttribute('src', 'img3.jpg');
  });

  it('can navigate to the next slide by clicking on the image', async () => {
    renderRoute('/v/viewer-1');
    const slide1 = await screen.findByRole('img', {name: 'Slide page 1'});
    await userEvent.click(slide1);
    const slide2 = await screen.findByRole('img', {name: 'Slide page 2'});
    expect(slide2).toHaveAttribute('src', 'img2.jpg');
  });

  it('can navigate to the last slide with toolbar', async () => {
    renderRoute('/v/viewer-1');
    await screen.findByRole('img', {name: 'Slide page 1'});
    const end = screen.getByRole('button', {name: 'end'});
    await userEvent.click(end);
    const slide2 = await screen.findByRole('img', {name: 'Slide page 3'});
    expect(slide2).toHaveAttribute('src', 'img3.jpg');
  });

  it('can read the slide index from the search params', async () => {
    renderRoute('/v/viewer-1?slide=2');
    const slide2 = await screen.findByRole('img', {name: 'Slide page 2'});
    expect(slide2).toHaveAttribute('src', 'img2.jpg');
  });

  it('can navigate to the previous slide with toolbar', async () => {
    renderRoute('/v/viewer-1?slide=2');
    await screen.findByRole('img', {name: 'Slide page 2'});
    const previous = await screen.findByRole('button', {name: 'previous'});
    await userEvent.click(previous);
    const slide1 = await screen.findByRole('img', {name: 'Slide page 1'});
    expect(slide1).toHaveAttribute('src', 'img1.jpg');
  });

  it('can navigate to the first slide with toolbar', async () => {
    renderRoute('/v/viewer-1?slide=3');
    await screen.findByRole('img', {name: 'Slide page 3'});
    const start = await screen.findByRole('button', {name: 'start'});
    await userEvent.click(start);
    const slide1 = await screen.findByRole('img', {name: 'Slide page 1'});
    expect(slide1).toHaveAttribute('src', 'img1.jpg');
  });

  it('has a twitter share link button', async () => {
    renderRoute('/v/viewer-1?slide=2');
    await screen.findByRole('img', {name: 'Slide page 2'});
    const shareButton = await screen.findByRole('link', {name: 'tweet'});
    expect(shareButton).toHaveAttribute('href');
    const shareUrl = shareButton.getAttribute('href');
    const parsedShare = new URL(shareUrl!);
    expect(parsedShare.origin).toBe('https://twitter.com');
    expect(parsedShare.pathname).toBe('/intent/tweet');
    const tweetText = parsedShare.searchParams.get('text');
    expect(tweetText).not.toBeNull();
    expect(decodeURIComponent(tweetText!)).toBe(
      'test presentation by test user @doesnotexist https://slidr.app/v/viewer-1?slide=2',
    );
    expect(shareButton).toHaveAttribute('target', '_blank');
    expect(shareButton).toHaveAttribute('rel', 'noreferrer');
  });

  it('has a linkedin share link button', async () => {
    renderRoute('/v/viewer-1?slide=2');
    await screen.findByRole('img', {name: 'Slide page 2'});
    const shareButton = await screen.findByRole('link', {name: 'post'});
    expect(shareButton).toHaveAttribute('href');
    const shareUrl = shareButton.getAttribute('href');
    const parsedShare = new URL(shareUrl!);
    expect(parsedShare.origin).toBe('https://www.linkedin.com');
    expect(parsedShare.pathname).toBe('/sharing/share-offsite/');
    const shareText = parsedShare.searchParams.get('url');
    expect(shareText).not.toBeNull();
    expect(decodeURIComponent(shareText!)).toBe(
      'https://slidr.app/v/viewer-1?slide=2',
    );
    expect(shareButton).toHaveAttribute('target', '_blank');
    expect(shareButton).toHaveAttribute('rel', 'noreferrer');
  });

  it('has a copy share button', async () => {
    const user = userEvent.setup();
    renderRoute('/v/viewer-1?slide=2');
    await screen.findByRole('img', {name: 'Slide page 2'});
    const shareButton = await screen.findByRole('link', {name: 'copy'});
    await user.click(shareButton);
    await expect(window.navigator.clipboard.readText()).resolves.toBe(
      'https://slidr.app/v/viewer-1?slide=2',
    );
  });
});
