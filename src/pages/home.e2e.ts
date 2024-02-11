import {type PresentationUpdate} from '../../functions/src/presentation';
import {dbAdmin} from '../test/firestore';
import {test, expect} from '../test/login-fixture';

let presentationId: string;

test.beforeAll(async () => {
  const presentationsQuerySnapshot = await dbAdmin
    .collection('presentations')
    .where('title', '==', 'A Presentation for Testing')
    .get();

  const presentationSnapshot = presentationsQuerySnapshot.docs[0];
  presentationId = presentationSnapshot.id;

  await dbAdmin.doc('presentations/home-test').set({
    uid: 'someone-else',
    username: 'e2e test user',
    notes: [],
    pages: [],
    title: 'home3',
    rendered: new Date(2040, 8),
  } as PresentationUpdate);
});

test('lists all presentations', async ({page}) => {
  await page.goto('/');

  const presentationList = page.getByRole('list', {
    name: /presentations/i,
  });

  await expect(presentationList.getByText('home3')).toBeVisible();
  await expect(
    presentationList.getByText('A Presentation for Testing'),
  ).toBeVisible();

  const filteredPresentations = presentationList
    .getByRole('listitem')
    // Filter by links
    .filter({
      has: page.getByRole('link'),
    })
    // Filter the presentations we know about (in case another test adds a presentation)
    .filter({
      has: page
        .getByText('A Presentation for Testing')
        .or(page.getByText('home3')),
    });

  // Verify the order
  await expect(filteredPresentations).toHaveText([
    /home3/,
    /A Presentation for Testing/,
  ]);

  // No edit button because we are not the owner, but always view and present buttons
  await expect(
    filteredPresentations.first().getByRole('button', {name: 'edit'}),
  ).not.toBeVisible();
  await expect(
    filteredPresentations.first().getByRole('button', {name: 'view'}),
  ).toBeVisible();
  await expect(
    filteredPresentations.first().getByRole('button', {name: 'present'}),
  ).toBeVisible();

  await expect(
    filteredPresentations.nth(1).getByRole('button', {name: 'edit'}),
  ).not.toBeVisible();
  await expect(
    filteredPresentations.nth(1).getByRole('button', {name: 'view'}),
  ).toBeVisible();
  await expect(
    filteredPresentations.nth(1).getByRole('button', {name: 'present'}),
  ).toBeVisible();
});
