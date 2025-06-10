import {test} from '../test/login-fixture';

test('can sign in', async ({loginPage}) => {
  await loginPage.goto();
  await loginPage.signIn();
  await loginPage.signInComplete();
});
