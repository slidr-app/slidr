import {databaseAdmin} from '../test/firestore';
import {test, expect} from '../test/coverage-fixture';

let presentationId: string;

test.beforeAll(async () => {
  const presentationsQuerySnapshot = await databaseAdmin
    .collection('presentations')
    .where('title', '==', 'A Presentation for Testing')
    .get();

  const presentationSnapshot = presentationsQuerySnapshot.docs[0];
  presentationId = presentationSnapshot.id;
});

test('navigate the presentation', async ({
  page,
  // @ts-expect-error activate coverage
  coverage,
}) => {
  await page.goto(`/v/${presentationId}`);

  const slide1 = page.getByRole('img', {name: 'Slide page 1'});
  const slide2 = page.getByRole('img', {name: 'Slide page 2'});
  const slide3 = page.getByRole('img', {name: 'Slide page 3'});

  await expect(slide1).toBeVisible();
  await expect(slide1).toHaveScreenshot('slide-1.png');

  await page.getByRole('button', {name: 'next'}).click();
  await expect(slide2).toBeVisible();
  await expect(slide2).toHaveScreenshot('slide-2.png');

  await page.getByRole('button', {name: 'previous'}).click();
  await expect(slide1).toBeVisible();
  await expect(slide1).toHaveScreenshot('slide-1.png');

  await page.getByRole('button', {name: 'end'}).click();
  await expect(slide3).toBeVisible();
  await expect(slide3).toHaveScreenshot('slide-3.png');

  await page.getByRole('button', {name: 'start', exact: true}).click();
  await expect(slide1).toBeVisible();
  await expect(slide1).toHaveScreenshot('slide-1.png');
});

test('can share with share buttons', async ({
  page,
  // @ts-expect-error activate coverage
  coverage,
}) => {
  await page.goto(`/v/${presentationId}?slide=2`);

  // Twitter
  const tweetButton = page.getByRole('link', {name: 'tweet'});

  await expect(tweetButton).toHaveAttribute('href');
  const tweetHref = await tweetButton.getAttribute('href');
  const parsedShare = new URL(tweetHref!);
  expect(parsedShare.origin).toBe('https://twitter.com');
  expect(parsedShare.pathname).toBe('/intent/tweet');
  const tweetText = parsedShare.searchParams.get('text');
  expect(tweetText).not.toBeNull();
  expect(decodeURIComponent(tweetText!)).toBe(
    `A Presentation for Testing by test user @testuser https://slidr.app/v/${presentationId}?slide=2`,
  );
  await expect(tweetButton).toHaveAttribute('target', '_blank');
  await expect(tweetButton).toHaveAttribute('rel', 'noreferrer');

  // LinkedIn
  const linkedInButton = page.getByRole('link', {name: 'post'});

  await expect(linkedInButton).toHaveAttribute('href');
  const linkedInShareHref = await linkedInButton.getAttribute('href');
  const linkedInShareUrl = new URL(linkedInShareHref!);
  expect(linkedInShareUrl.origin).toBe('https://www.linkedin.com');
  expect(linkedInShareUrl.pathname).toBe('/sharing/share-offsite/');
  const linkedInShareText = linkedInShareUrl.searchParams.get('url');
  expect(linkedInShareText).not.toBeNull();
  expect(decodeURIComponent(linkedInShareText!)).toBe(
    `https://slidr.app/v/${presentationId}?slide=2`,
  );
  await expect(linkedInButton).toHaveAttribute('target', '_blank');
  await expect(linkedInButton).toHaveAttribute('rel', 'noreferrer');

  // Copy button
  const copyButton = page.getByRole('link', {name: 'copy'});
  await copyButton.click();

  const clipboardText = await page.evaluate('navigator.clipboard.readText()');
  expect(clipboardText).toContain(
    `https://slidr.app/v/${presentationId}?slide=2`,
  );
});
