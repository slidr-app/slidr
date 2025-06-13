import {test, expect} from '../test/login-fixture';

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

  await fetch(
    'http://127.0.0.1:5001/demo-test/us-central1/lemonSqueezyWebhook',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
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
      }),
    },
  );

  await expect(
    page.getByText('Slidr Pro - Thank you for your support!'),
  ).toBeVisible();

  await fetch(
    'http://127.0.0.1:5001/demo-test/us-central1/lemonSqueezyWebhook',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
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
      }),
    },
  );

  await expect(page.getByText('Go Pro to support Slidr!')).toBeVisible();
});
