import {test, expect} from '../test/login-fixture';
import {generateId} from '../test/id';

test('upload button appears after signing in', async ({page, loginPage}) => {
  test.setTimeout(30_000);
  await page.goto('/');
  await expect(page.getByRole('button', {name: /upload/i})).not.toBeVisible();

  await loginPage.goto();
  await loginPage.signIn();
  await loginPage.signInComplete();
  await page.goto('/');
  await expect(page.getByRole('button', {name: /upload/i})).toBeVisible({
    timeout: 20_000,
  });
});

test('can upload and view presentation', async ({page, loginPage}) => {
  test.setTimeout(60_000);

  await loginPage.goto();
  await loginPage.signIn();
  await loginPage.signInComplete();

  const presentationName = `e2e test - ${generateId()}`;
  await page.goto('/');
  await page.getByRole('button', {name: /upload/i}).click();
  await page
    .getByRole('button', {
      name: /drag 'n' drop/i,
    })
    .locator('input')
    .setInputFiles('./src/test/pdf/test.pdf');
  await expect(page.getByText(/done/i)).toBeVisible({timeout: 20_000});
  await page.getByLabel(/title/i).fill(presentationName);
  await expect(page.getByText(/saving/i)).toBeVisible();
  await expect(page.getByText(/saving/i)).not.toBeVisible();
  await page.getByRole('button', {name: /slidr/i}).click();

  // Find the presentation in the list
  const presentation = page
    .getByRole('list', {
      name: /presentations/i,
    })
    .getByRole('listitem')
    .filter({
      has: page.getByText(presentationName),
    })
    .first();
  await expect(presentation).toBeVisible();

  // Can edit my presentation
  await expect(presentation.getByRole('button', {name: 'edit'})).toBeVisible();

  // View the presentation
  await presentation.getByRole('button', {name: 'view'}).click();
  const page1 = page.getByAltText(/slide page 1/i);
  await expect(page1).toBeVisible();
  // TODO: instead match just the slide image
  await expect(page1).toHaveScreenshot('page-1.png');

  await page.getByRole('button', {name: /next/i}).click();
  const page2 = page.getByAltText(/slide page 2/i);
  await expect(page2).toBeVisible();
  // TODO: instead match just the slide image
  await expect(page2).toHaveScreenshot('page-2.png');

  await page.getByRole('button', {name: /next/i}).click();
  const page3 = page.getByAltText(/slide page 3/i);
  await expect(page3).toBeVisible();
  // TODO: instead match just the slide image
  await expect(page3).toHaveScreenshot('page-3.png');
});
