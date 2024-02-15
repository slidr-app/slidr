import {test, expect} from '../test/coverage-fixture';

test('displays an error when the presentation does not exist', async ({
  page,
  // @ts-expect-error activate coverage
  coverage,
}) => {
  const errorLogs: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') {
      errorLogs.push(message.text());
    }
  });

  await page.goto(`/v/does-not-exist`);

  await expect(
    page.getByText('Something is not right. Try refreshing or going home.'),
  ).toBeVisible();

  await expect(page.getByRole('link', {name: 'refreshing'})).toHaveAttribute(
    'href',
    /\/v\/does-not-exist/,
  );

  await expect(page.getByRole('link', {name: 'home'})).toHaveAttribute(
    'href',
    '/',
  );

  expect(errorLogs.length).toBeGreaterThanOrEqual(1);
  expect(errorLogs[0]).toMatch(
    "Error: Presentation 'does-not-exist' does not exist",
  );
});
