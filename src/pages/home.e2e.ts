import {presentationConverter} from '../../functions/src/presentation-schema';
import {databaseAdmin} from '../test/firestore';
import {test, expect} from '../test/login-fixture';

test.beforeAll(async () => {
  await databaseAdmin.doc('presentations/home-test').delete();
  await databaseAdmin
    .doc('presentations/home-test')
    .withConverter(presentationConverter)
    .set({
      uid: 'someone-else',
      username: 'e2e test user',
      notes: [],
      pages: [],
      title: 'home3',
      rendered: new Date(2040, 8),
      created: new Date(2040, 8),
      status: 'rendered',
      original: 'http://does-not-exist.com',
      twitterHandle: '',
    });

  // Create a presentation with the v0 schema (without converter)
  await databaseAdmin.doc('presentations/home-test-v0').delete();
  await databaseAdmin.doc('presentations/home-test-v0').set({
    uid: 'someone-else',
    username: 'e2e test user',
    notes: [
      {
        markdown: '',
        pageIndices: [0],
      },
      {
        markdown: '',
        pageIndices: [1],
      },
      {
        markdown: '',
        pageIndices: [2],
      },
    ],
    pages: ['http://page1', 'http://page1', 'http://page1'],
    title: 'v0 presentation document',
    created: new Date(2040, 8),
    rendered: new Date(2040, 8),
    original: 'http://does-not-exist.com',
  });
});

test('lists all presentations', async ({
  page,
  // @ts-expect-error activate coverage
  coverage,
}) => {
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

test('can view v0 schema presentations', async ({
  page,
  // @ts-expect-error activate coverage
  coverage,
}) => {
  await page.goto('/');

  const presentationList = page.getByRole('list', {
    name: /presentations/i,
  });

  const filteredPresentations = presentationList.getByRole('listitem').filter({
    has: page.getByText('v0 presentation document'),
  });

  console.log('v0Presentation', filteredPresentations);
  await expect(filteredPresentations).toHaveCount(1);

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
});
