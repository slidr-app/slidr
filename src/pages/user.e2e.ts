import crypto from 'node:crypto';
import process from 'node:process';
import {test, expect} from '../test/login-fixture';
import {createMockLemonServer} from '../test/lemon-squeezy-api';

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
  await expect(page.getByText('Go Pro to support Slidr!')).toBeVisible();

  await page.goto('/');

  const goProButton = page.getByRole('button', {name: 'Upgrade to Slidr Pro'});
  await goProButton.click();
  await page.waitForURL('/user');

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
        user_email: loginPage.emailAddress,
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

  await expect(
    page.getByText('Slidr Pro - Thank you for your support!'),
  ).toBeVisible();

  const subscriptionCancelledPayload = {
    meta: {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      event_name: 'subscription_cancelled',
    },
    data: {
      attributes: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        user_email: loginPage.emailAddress,
      },
    },
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

  await expect(page.getByText('Go Pro to support Slidr!')).toBeVisible();
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
    await expect(page.getByText('Go Pro to support Slidr!')).toBeVisible();

    // Make user pro and sync
    mockLemonServer.setSubscriptions([
      {
        id: '1',
        type: 'subscriptions',
        attributes: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          user_email: loginPage.emailAddress,
          status: 'active',
        },
      },
    ]);
    await fetch(lemonSqueezySyncFunctionUrl, {
      method: 'GET',
    });
    await expect(
      page.getByText('Slidr Pro - Thank you for your support!'),
    ).toBeVisible();

    // Remove pro status and sync
    mockLemonServer.setSubscriptions([
      {
        id: '1',
        type: 'subscriptions',
        attributes: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          user_email: loginPage.emailAddress,
          status: 'cancelled',
        },
      },
    ]);
    await fetch(lemonSqueezySyncFunctionUrl, {
      method: 'GET',
    });
    await expect(page.getByText('Go Pro to support Slidr!')).toBeVisible();
  } finally {
    await mockLemonServer.stop();
  }
});
