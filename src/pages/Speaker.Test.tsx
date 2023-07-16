import {signInAnonymously} from 'firebase/auth';
import {doc, setDoc} from 'firebase/firestore';
import {RouterProvider, createMemoryRouter} from 'react-router-dom';
import {auth, firestore} from '../firebase';
import {
  screen,
  userEvent,
  render,
  findByRole,
  queryByRole,
} from '../test/test-utils';
import Routes from '../Routes';
import {type PresentationCreate} from '../../functions/src/presentation';

beforeAll(async () => {
  // Use anonymous auth because email link is complicated to emulate
  const cred = await signInAnonymously(auth);

  await fetch(
    'http://127.0.0.1:8080/emulator/v1/projects/demo-test/databases/(default)/documents/presentations/speakertest',
    {method: 'DELETE'},
  );

  await fetch(
    'http://127.0.0.1:8080/emulator/v1/projects/demo-test/databases/(default)/documents/sessions/speakertest',
    {method: 'DELETE'},
  );

  await fetch(
    'http://127.0.0.1:8080/emulator/v1/projects/demo-test/databases/(default)/documents/sessions/speakertest/reactions',
    {method: 'DELETE'},
  );

  // Add a single presentation to firestore
  await setDoc(doc(firestore, 'presentations', 'speakertest'), {
    uid: cred.user.uid,
    created: new Date(),
    username: 'test user',
    pages: ['img1.jpg', 'img2.jpg', 'img3.jpg'],
    notes: [],
    title: 'test presentation',
  } satisfies PresentationCreate);
});

describe('Speaker view', () => {
  it('synchronizes the current slide', async () => {
    const presentationRouter = createMemoryRouter(Routes, {
      initialEntries: ['/p/speakertest?slide=1&session=speakertest'],
    });
    const speakerRouter = createMemoryRouter(Routes, {
      initialEntries: ['/s/speakertest?slide=1&session=speakertest'],
    });
    const audienceRouter = createMemoryRouter(Routes, {
      initialEntries: ['/i/speakertest?slide=1&session=speakertest'],
    });

    render(
      <>
        <div data-testid="presentation">
          <RouterProvider router={presentationRouter} />
        </div>
        <div data-testid="speaker">
          <RouterProvider router={speakerRouter} />
        </div>
        <div data-testid="audience">
          <RouterProvider router={audienceRouter} />
        </div>
      </>,
    );

    const presentation = await screen.findByTestId('presentation');
    const speaker = await screen.findByTestId('speaker');
    const audience = await screen.findByTestId('audience');

    await findByRole(presentation, 'img', {name: 'Slide page 1'});
    await findByRole(speaker, 'img', {name: 'Slide page 1'});
    await findByRole(audience, 'img', {name: 'Slide page 1'});

    const next = await findByRole(speaker, 'button', {name: 'next'});
    await userEvent.click(next);
    await findByRole(presentation, 'img', {
      name: 'Slide page 2',
    });
    await findByRole(speaker, 'img', {
      name: 'Slide page 2',
    });
    await findByRole(audience, 'img', {
      name: 'Slide page 2',
    });
  });

  it('renders reactions on audience and presentation views', async () => {
    const presentationRouter = createMemoryRouter(Routes, {
      initialEntries: ['/p/speakertest?slide=1&session=speakertest'],
    });
    const speakerRouter = createMemoryRouter(Routes, {
      initialEntries: ['/s/speakertest?slide=1&session=speakertest'],
    });
    const audienceRouter = createMemoryRouter(Routes, {
      initialEntries: ['/i/speakertest?slide=1&session=speakertest'],
    });

    render(
      <>
        <div data-testid="presentation">
          <RouterProvider router={presentationRouter} />
        </div>
        <div data-testid="speaker">
          <RouterProvider router={speakerRouter} />
        </div>
        <div data-testid="audience">
          <RouterProvider router={audienceRouter} />
        </div>
      </>,
    );

    const presentation = await screen.findByTestId('presentation');
    const speaker = await screen.findByTestId('speaker');
    const audience = await screen.findByTestId('audience');

    await findByRole(presentation, 'img', {name: 'Slide page 1'});
    await findByRole(speaker, 'img', {name: 'Slide page 1'});
    await findByRole(audience, 'img', {name: 'Slide page 1'});

    const love = await findByRole(speaker, 'button', {name: 'love'});
    await userEvent.click(love);

    await findByRole(presentation, 'figure', {
      name: 'love',
    });
    await findByRole(audience, 'figure', {
      name: 'love',
    });
  });

  it('clears reactions on presentation', async () => {
    const presentationRouter = createMemoryRouter(Routes, {
      initialEntries: ['/p/speakertest?slide=1&session=speakertest'],
    });
    const speakerRouter = createMemoryRouter(Routes, {
      initialEntries: ['/s/speakertest?slide=1&session=speakertest'],
    });
    const audienceRouter = createMemoryRouter(Routes, {
      initialEntries: ['/i/speakertest?slide=1&session=speakertest'],
    });

    render(
      <>
        <div data-testid="presentation">
          <RouterProvider router={presentationRouter} />
        </div>
        <div data-testid="speaker">
          <RouterProvider router={speakerRouter} />
        </div>
        <div data-testid="audience">
          <RouterProvider router={audienceRouter} />
        </div>
      </>,
    );

    const presentation = await screen.findByTestId('presentation');
    const speaker = await screen.findByTestId('speaker');
    const audience = await screen.findByTestId('audience');

    await findByRole(presentation, 'img', {name: 'Slide page 1'});
    await findByRole(speaker, 'img', {name: 'Slide page 1'});
    await findByRole(audience, 'img', {name: 'Slide page 1'});

    const love = await findByRole(speaker, 'button', {name: 'love'});
    await userEvent.click(love);

    await findByRole(presentation, 'figure', {
      name: 'love',
    });

    const clear = await findByRole(speaker, 'button', {name: 'clear'});
    await userEvent.click(clear);

    expect(queryByRole(presentation, 'figure', {name: 'love'})).toBeNull();
  });
});
