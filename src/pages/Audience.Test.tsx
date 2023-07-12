import {signInAnonymously} from 'firebase/auth';
import {doc, setDoc} from 'firebase/firestore';
import {RouterProvider, createMemoryRouter} from 'react-router-dom';
import {auth, firestore} from '../firebase';
import {screen, userEvent, render, findByRole} from '../test/test-utils';
import Routes from '../Routes';

beforeAll(async () => {
  // Use anonymous auth because email link is complicated to emulate
  const cred = await signInAnonymously(auth);

  await fetch(
    'http://127.0.0.1:8080/emulator/v1/projects/demo-test/databases/(default)/documents/presentations/presentation-2',
    {method: 'DELETE'},
  );

  await fetch(
    'http://127.0.0.1:8080/emulator/v1/projects/demo-test/databases/(default)/documents/sessions/test',
    {method: 'DELETE'},
  );

  await fetch(
    'http://127.0.0.1:8080/emulator/v1/projects/demo-test/databases/(default)/documents/sessions/test/reactions',
    {method: 'DELETE'},
  );

  // Add a single presentation to firestore
  await setDoc(doc(firestore, 'presentations', 'presentation-2'), {
    uid: cred.user.uid,
    created: Date.now(),
    username: 'test user',
    pages: ['img1.jpg', 'img2.jpg', 'img3.jpg'],
    notes: [],
    title: 'test presentation',
  });
});

describe('Audience view', () => {
  it('synchronizes the current slide', async () => {
    const presentationRouter = createMemoryRouter(Routes, {
      initialEntries: ['/p/presentation-2?slide=1&session=test'],
    });
    const audienceRouter = createMemoryRouter(Routes, {
      initialEntries: ['/i/presentation-2?slide=1&session=test'],
    });

    render(
      <>
        <div data-testid="presentation">
          <RouterProvider router={presentationRouter} />
        </div>
        <div data-testid="audience">
          <RouterProvider router={audienceRouter} />
        </div>
      </>,
    );

    const presentation = await screen.findByTestId('presentation');
    const audience = await screen.findByTestId('audience');

    await findByRole(audience, 'img', {name: 'Slide page 1'});
    const next = await findByRole(presentation, 'button', {name: 'next'});
    await userEvent.click(next);
    const slide2 = await findByRole(audience, 'img', {name: 'Slide page 2'});
    expect(slide2).toHaveAttribute('src', 'img2.jpg');
  });

  it('renders reactions on audience view', async () => {
    const presentationRouter = createMemoryRouter(Routes, {
      initialEntries: ['/p/presentation-2?slide=1&session=test'],
    });
    const audienceRouter = createMemoryRouter(Routes, {
      initialEntries: ['/i/presentation-2?slide=1&session=test'],
    });

    render(
      <>
        <div data-testid="presentation">
          <RouterProvider router={presentationRouter} />
        </div>
        <div data-testid="audience">
          <RouterProvider router={audienceRouter} />
        </div>
      </>,
    );

    const presentation = await screen.findByTestId('presentation');
    const audience = await screen.findByTestId('audience');

    await findByRole(presentation, 'img', {name: 'Slide page 1'});

    const love = await findByRole(audience, 'button', {name: 'love'});
    await userEvent.click(love);

    await findByRole(audience, 'figure', {
      name: 'love',
    });
  });

  it('renders reactions on presentation view', async () => {
    const presentationRouter = createMemoryRouter(Routes, {
      initialEntries: ['/p/presentation-2?slide=1&session=test'],
    });
    const audienceRouter = createMemoryRouter(Routes, {
      initialEntries: ['/i/presentation-2?slide=1&session=test'],
    });

    render(
      <>
        <div data-testid="presentation">
          <RouterProvider router={presentationRouter} />
        </div>
        <div data-testid="audience">
          <RouterProvider router={audienceRouter} />
        </div>
      </>,
    );

    const presentation = await screen.findByTestId('presentation');
    const audience = await screen.findByTestId('audience');

    await findByRole(audience, 'img', {name: 'Slide page 1'});

    const love = await findByRole(audience, 'button', {name: 'love'});
    await userEvent.click(love);

    await findByRole(presentation, 'figure', {
      name: 'love',
    });
  });
});
