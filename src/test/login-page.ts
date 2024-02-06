import {type Page, expect} from '@playwright/test';
import {generateId} from './id';

type OobCode = {
  oobLink: string;
  email: string;
};

type OobCodesResponse = {
  oobCodes: OobCode[];
};

export function loginPageFactory(page: Page) {
  const emailAddress = `${generateId()}@test.com`;
  return {
    emailAddress,
    async goto() {
      await page.goto('/signin');
    },
    async signIn() {
      await page.getByLabel(/email:/i).fill(emailAddress);
      await page.getByRole('button', {name: /send email/i}).click();

      // Get the list of Out Of Bound codes waiting to sign in
      // https://firebase.google.com/docs/reference/rest/auth#section-auth-emulator-oob
      const result = await fetch(
        'http://127.0.0.1:9099/emulator/v1/projects/demo-test/oobCodes',
      );
      const {oobCodes} = (await result.json()) as OobCodesResponse;
      const oobCode = oobCodes.find((code) => code.email === emailAddress);

      expect(oobCode).toBeDefined();

      // Follow the link in the code, but don't redirect so we can capture the search params
      const loginResult = await fetch(oobCode!.oobLink, {redirect: 'manual'});

      // Parse the search params in the redirect
      const redirectLocationHeader = loginResult.headers.get('location');
      expect(redirectLocationHeader).not.toBeNull();
      const redirectUrl = new URL(redirectLocationHeader!);
      const loginLinkSearchParameters = redirectUrl.searchParams.toString();
      expect(loginLinkSearchParameters.length).toBeGreaterThan(0);

      await page.goto(`/signin?${loginLinkSearchParameters}`);
    },
    async signInComplete() {
      await expect(page.getByRole('button', {name: /account/i})).toBeVisible();
    },
  };
}

export type LoginPage = ReturnType<typeof loginPageFactory>;
