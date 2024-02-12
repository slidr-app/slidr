import {test as setup} from '@playwright/test';
import {exportFirebaseDatabase} from './indexeddb';

setup('do login', async ({page}) => {
  // Await page.getByRole('button', {name: /sign in with test account/i}).click();
  // await expect(page.getByRole('button', {name: /^account$/i})).toBeVisible();

  // await login({page});

  await exportFirebaseDatabase(page);

  console.log('signed in!');
});
