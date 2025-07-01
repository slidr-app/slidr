import crypto from 'node:crypto';
import process from 'node:process';
import {type Page, expect} from '@playwright/test';
import {generateId} from './id';

type OobCode = {
  oobLink: string;
  email: string;
};

type OobCodesResponse = {
  oobCodes: OobCode[];
};

const lemonSqueezyWebhookFunctionUrl =
  'http://127.0.0.1:5001/demo-test/us-central1/lemonSqueezyWebhook';

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

      const oobCode = await getCodeWithRetries(emailAddress);
      expect(oobCode).toBeDefined();

      // Follow the link in the code, but don't redirect so we can capture the search params
      const loginResult = await fetch(oobCode.oobLink, {redirect: 'manual'});

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
    async goPro() {
      await page.goto('/');

      const goProButton = page.getByRole('button', {
        name: 'Upgrade to Slidr Pro',
      });
      await goProButton.click();
      await page.waitForURL('/user');
      await simulateLemonSqueezyWebhook(emailAddress);
    },
    async goProComplete() {
      await page.goto('/user');
      await expect(
        page.getByText('Slidr Pro - Thank you for your support!'),
      ).toBeVisible();
    },
  };
}

export type LoginPage = ReturnType<typeof loginPageFactory>;

// Sometimes getting the oob code doesn't work locally in the prepush githook.
// Attempt to do some retries to see if it stabilizes this test.
// Wondering if it is due to a race condition.
async function getCodeWithRetries(email: string) {
  async function getCode() {
    // Get the list of Out Of Bound codes waiting to sign in
    // https://firebase.google.com/docs/reference/rest/auth#section-auth-emulator-oob
    const result = await fetch(
      'http://127.0.0.1:9099/emulator/v1/projects/demo-test/oobCodes',
    );
    const {oobCodes} = (await result.json()) as OobCodesResponse;
    const oobCode = oobCodes.find((code) => code.email === email);
    return oobCode;
  }

  for (let attempt = 0; attempt < 3; attempt++) {
    console.log(`oob code login ${email} attempt ${attempt + 1} of 3`);

    // eslint-disable-next-line no-await-in-loop
    const oobCode = await getCode();
    if (oobCode) {
      return oobCode;
    }

    // eslint-disable-next-line no-await-in-loop
    await new Promise<undefined>((resolve) => {
      setTimeout(() => {
        resolve(undefined);
      }, 500);
    });
  }

  throw new Error('Unable to get oob code for firebase login');
}

async function simulateLemonSqueezyWebhook(email: string) {
  const secret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error(
      'LEMON_SQUEEZY_WEBHOOK_SECRET environment variable is not set',
    );
  }

  const subscriptionCreatedPayload = {
    meta: {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      event_name: 'subscription_created',
    },
    data: {
      attributes: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        user_email: email,
      },
    },
  };

  const subscriptionCreatedBody = JSON.stringify(subscriptionCreatedPayload);
  const subscriptionCreatedSignature = crypto
    .createHmac('sha256', secret)
    .update(subscriptionCreatedBody)
    .digest('hex');

  await fetch(lemonSqueezyWebhookFunctionUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Signature': subscriptionCreatedSignature,
    },
    body: subscriptionCreatedBody,
  });
}
