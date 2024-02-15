import {test, expect} from '../test/coverage-fixture';

test('can navigate to the help page from the nav bar', async ({page}) => {
  await page.goto('/');

  const presentationList = page.getByRole('list', {
    name: /presentations/i,
  });

  await expect(
    presentationList.getByText('A Presentation for Testing'),
  ).toBeVisible();

  await page.getByRole('button', {name: 'Help'}).click();

  await expect(page.getByText('What is Slidr?')).toBeVisible();
});

test('can navigate to the help page the getting started button', async ({
  page,
}) => {
  await page.goto('/');

  const presentationList = page.getByRole('list', {
    name: /presentations/i,
  });

  await expect(
    presentationList.getByText('A Presentation for Testing'),
  ).toBeVisible();

  await page.getByRole('button', {name: 'Getting Started'}).click();

  await expect(page.getByText('What is Slidr?')).toBeVisible();
});
