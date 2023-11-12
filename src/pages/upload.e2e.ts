import {test as base, expect} from '@playwright/test';
import {type LoginPage, loginPageFactory} from '../test/login-page';
import {generateId} from '../test/id';

const test = base.extend<{loginPage: LoginPage}>({
  async loginPage({page}, use) {
    const loginPage = loginPageFactory(page);
    await use(loginPage);
  },

  // Async page({page}, use) {
  //   await importFirebaseData(page);
  //   void use(page);
  // },
});

test('upload button appears after signing in', async ({page, loginPage}) => {
  await page.goto('/');
  await expect(page.getByRole('button', {name: /upload/i})).not.toBeVisible();

  await loginPage.goto();
  await loginPage.signIn();
  await loginPage.signInComplete();
  await page.goto('/');
  await expect(page.getByRole('button', {name: /upload/i})).toBeVisible();
});

test('can upload and view presentation', async ({page, loginPage}) => {
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
  await expect(page.getByText(/done/i)).toBeVisible();
  await page.getByLabel(/title/i).fill(presentationName);
  await expect(page.getByText(/saving/i)).toBeVisible();
  await expect(page.getByText(/saving/i)).not.toBeVisible();
  await page.getByRole('button', {name: /slidr/i}).click();

  const presentation = page.getByText(presentationName);
  await expect(presentation).toBeVisible();

  await presentation.click();
  const page1 = page.getByAltText(/slide page 1/i);
  await expect(page1).toBeVisible();
  await expect(page1).toHaveScreenshot();

  await page.getByRole('button', {name: /next/i}).click();
  const page2 = page.getByAltText(/slide page 2/i);
  await expect(page2).toBeVisible();
  await expect(page2).toHaveScreenshot();

  await page.getByRole('button', {name: /next/i}).click();
  const page3 = page.getByAltText(/slide page 3/i);
  await expect(page3).toBeVisible();
  await expect(page3).toHaveScreenshot();
});
