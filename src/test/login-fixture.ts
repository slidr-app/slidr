import {test as base} from './coverage-fixture';
import {loginPageFactory, type LoginPage} from './login-page';

export const test = base.extend<{loginPage: LoginPage}>({
  // @ts-expect-error the fixture has to be declared for it to be used by playwright
  async loginPage({page, coverage}, use) {
    const loginPage = loginPageFactory(page);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    await use(loginPage);
  },
});

export {expect} from './coverage-fixture';
