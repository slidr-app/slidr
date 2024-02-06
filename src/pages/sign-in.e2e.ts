import {test as base} from '@playwright/test';
import {type LoginPage, loginPageFactory} from '../test/login-page';

// Const test = base.extend({
//   async page({page}, use) {
//     await importFirebaseData(page);
//     void use(page);
//   },
// });

const test = base.extend<{loginPage: LoginPage}>({
  async loginPage({page}, use) {
    const loginPage = loginPageFactory(page);
    await loginPage.goto();
    await use(loginPage);
  },
});

test('can sign in', async ({loginPage}) => {
  await loginPage.signIn();
  await loginPage.signInComplete();
});
