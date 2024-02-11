import {dbAdmin} from '../test/firestore';
import {test, expect} from '../test/login-fixture';

let presentationId: string;

test.beforeAll(async () => {
  const presentationsQuerySnapshot = await dbAdmin
    .collection('presentations')
    .where('title', '==', 'A Presentation for Testing')
    .get();

  const presentationSnapshot = presentationsQuerySnapshot.docs[0];
  presentationId = presentationSnapshot.id;
});

test('navigate the presentation', async ({page}) => {
  await page.goto(`/v/${presentationId}`);

  await expect(page.getByRole('img', {name: 'Slide page 1'})).toBeVisible();
  await expect(page).toHaveScreenshot('slide-1.png');

  await page.getByRole('button', {name: 'next'}).click();
  await expect(page.getByRole('img', {name: 'Slide page 2'})).toBeVisible();
  await expect(page).toHaveScreenshot('slide-2.png');

  await page.getByRole('button', {name: 'previous'}).click();
  await expect(page.getByRole('img', {name: 'Slide page 1'})).toBeVisible();
  await expect(page).toHaveScreenshot('slide-1.png');

  await page.getByRole('button', {name: 'end'}).click();
  await expect(page.getByRole('img', {name: 'Slide page 3'})).toBeVisible();
  await expect(page).toHaveScreenshot('slide-3.png');

  await page.getByRole('button', {name: 'start', exact: true}).click();
  await expect(page.getByRole('img', {name: 'Slide page 1'})).toBeVisible();
  await expect(page).toHaveScreenshot('slide-1.png');
});

test('can share with share buttons', async ({page}) => {
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

//
//
// test('upload button appears after signing in', async ({
//   page,
//   loginPage,
// }) => {
//   test.setTimeout(30_000);

//   await page.goto('/v/viewer-1');
//   const slide = await screen.findByRole('img', {name: 'Slide page 1'});
//   expect(slide).toHaveAttribute('src', 'img1.jpg');

//   await expect(page.getByRole('button', {name: /upload/i})).not.toBeVisible();

//   await loginPage.goto();
//   await loginPage.signIn();
//   await loginPage.signInComplete();
//   await page.goto('/');
//   await expect(page.getByRole('button', {name: /upload/i})).toBeVisible({
//     timeout: 15_000,
//   });
// });

// test('can upload and view presentation', async ({page, loginPage}) => {
//   test.setTimeout(60_000);

//   await loginPage.goto();
//   await loginPage.signIn();
//   await loginPage.signInComplete();

//   const presentationName = `e2e test - ${generateId()}`;
//   await page.goto('/');
//   await page.getByRole('button', {name: /upload/i}).click();
//   await page
//     .getByRole('button', {
//       name: /drag 'n' drop/i,
//     })
//     .locator('input')
//     .setInputFiles('./src/test/pdf/test.pdf');
//   await expect(page.getByText(/done/i)).toBeVisible({timeout: 20_000});
//   await page.getByLabel(/title/i).fill(presentationName);
//   await expect(page.getByText(/saving/i)).toBeVisible();
//   await expect(page.getByText(/saving/i)).not.toBeVisible();
//   await page.getByRole('button', {name: /slidr/i}).click();

//   const presentation = page.getByText(presentationName);
//   await expect(presentation).toBeVisible();

//   await presentation.click();
//   const page1 = page.getByAltText(/slide page 1/i);
//   await expect(page1).toBeVisible();
//   await expect(page1).toHaveScreenshot('page-1.png');

//   await page.getByRole('button', {name: /next/i}).click();
//   const page2 = page.getByAltText(/slide page 2/i);
//   await expect(page2).toBeVisible();
//   await expect(page2).toHaveScreenshot('page-2.png');

//   await page.getByRole('button', {name: /next/i}).click();
//   const page3 = page.getByAltText(/slide page 3/i);
//   await expect(page3).toBeVisible();
//   await expect(page3).toHaveScreenshot('page-3.png');
// });
