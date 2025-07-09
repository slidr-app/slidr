import crypto from 'node:crypto';
import process from 'node:process';
import {test, expect} from '../test/login-fixture';
import {createMockLemonServer} from '../test/lemon-squeezy-api';
import {type Subscription} from '../../functions/src/subscription-schema';

const lemonSqueezyWebhookFunctionUrl =
  'http://127.0.0.1:5001/demo-test/us-central1/lemonSqueezyWebhook';

test('can upgrade and downgrade Slidr Pro', async ({
  page,
  loginPage,
  // @ts-expect-error activate coverage
  coverage,
}) => {
  await loginPage.goto();
  await loginPage.signIn();
  await loginPage.signInComplete();

  await page.goto('/user');
  await expect(page.getByText('Upgrade to Slidr Pro')).toBeVisible();

  const secret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error(
      'LEMON_SQUEEZY_WEBHOOK_SECRET environment variable is not set',
    );
  }

  await loginPage.goPro();
  await loginPage.goProComplete();

  const subscriptionCancelledData: Subscription = {
    attributes: {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      user_email: loginPage.emailAddress,
      status: 'cancelled',
      urls: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        customer_portal: 'https://example.com/customer-portal',
      },
    },
    id: 'sub_1234567890',
  };

  const subscriptionCancelledPayload = {
    meta: {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      event_name: 'subscription_cancelled',
    },
    data: subscriptionCancelledData,
  };

  const subscriptionCancelledBody = JSON.stringify(
    subscriptionCancelledPayload,
  );
  const subscriptionCancelledSignature = crypto
    .createHmac('sha256', secret)
    .update(subscriptionCancelledBody)
    .digest('hex');

  await fetch(lemonSqueezyWebhookFunctionUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Signature': subscriptionCancelledSignature,
    },
    body: subscriptionCancelledBody,
  });

  await expect(page.getByText('Upgrade to Slidr Pro')).toBeVisible();
});

const lemonSqueezySyncFunctionUrl =
  'http://127.0.0.1:5001/demo-test/us-central1/syncProUsers';

test('subscriptions can be synced', async ({page, loginPage}) => {
  const mockLemonServer = createMockLemonServer({port: 3001});
  await mockLemonServer.start();

  try {
    await loginPage.goto();
    await loginPage.signIn();
    await loginPage.signInComplete();
    await page.goto('/user');

    // User is not pro
    await expect(page.getByText('Upgrade to Slidr Pro')).toBeVisible();

    // Make user pro and sync
    mockLemonServer.setSubscriptions([
      {
        id: '1',
        attributes: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          user_email: loginPage.emailAddress,
          status: 'active',
          urls: {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            customer_portal: 'http://localhost:3001/customer-portal',
          },
        },
      },
    ]);
    await fetch(lemonSqueezySyncFunctionUrl, {
      method: 'GET',
    });
    await loginPage.goProComplete();

    await page.goto('/user');
    await page
      .getByRole('button', {name: /manage your slidr pro subscription/i})
      .click();
    await expect(
      page.frameLocator('iframe').getByText('Mock User Portal'),
    ).toBeVisible();

    // Reload the page to remove the iframe
    await page.goto('/user');

    await expect(
      page.frameLocator('iframe').getByText('Mock User Portal'),
    ).not.toBeVisible();

    // Remove pro status and sync
    mockLemonServer.setSubscriptions([
      {
        id: '1',
        attributes: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          user_email: loginPage.emailAddress,
          status: 'cancelled',
          urls: {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            customer_portal: 'https://example.com/customer-portal',
          },
        },
      },
    ]);
    await fetch(lemonSqueezySyncFunctionUrl, {
      method: 'GET',
    });
    await expect(page.getByText('Upgrade to Slidr Pro')).toBeVisible();
  } finally {
    await mockLemonServer.stop();
  }
});
