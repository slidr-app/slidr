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

test('synchronizes slide from presentation', async ({coverage}, testInfo) => {
  const presentationPage = await coverage.newPage();
  const speakerPage = await coverage.newPage();
  const audienceView = await coverage.newPage();

  await presentationPage.goto(
    `/p/${presentationId}?session=${testInfo.testId}`,
  );
  await speakerPage.goto(`/s/${presentationId}?session=${testInfo.testId}`);
  await audienceView.goto(`/i/${presentationId}?session=${testInfo.testId}`);

  await expect(
    presentationPage.getByRole('img', {name: 'Slide page 1'}),
  ).toBeVisible();
  await expect(
    speakerPage.getByRole('img', {name: 'Slide page 1'}),
  ).toBeVisible();
  await expect(
    audienceView.getByRole('img', {name: 'Slide page 1'}),
  ).toBeVisible();

  const nextButton = presentationPage.getByRole('button', {name: 'next'});
  await nextButton.click();

  await expect(
    presentationPage.getByRole('img', {name: 'Slide page 2'}),
  ).toBeVisible();
  await expect(
    speakerPage.getByRole('img', {name: 'Slide page 2'}),
  ).toBeVisible();
  await expect(
    audienceView.getByRole('img', {name: 'Slide page 2'}),
  ).toBeVisible();
});

test('can add reactions', async ({coverage}, testInfo) => {
  test.setTimeout(10_000);
  const presentationPage = await coverage.newPage();
  const speakerPage = await coverage.newPage();
  const audienceView = await coverage.newPage();

  await presentationPage.goto(
    `/p/${presentationId}?session=${testInfo.testId}`,
  );
  await speakerPage.goto(`/s/${presentationId}?session=${testInfo.testId}`);
  await audienceView.goto(`/i/${presentationId}?session=${testInfo.testId}`);

  await expect(
    presentationPage.getByRole('img', {name: 'Slide page 1'}),
  ).toBeVisible();
  await expect(
    speakerPage.getByRole('img', {name: 'Slide page 1'}),
  ).toBeVisible();
  await expect(
    audienceView.getByRole('img', {name: 'Slide page 1'}),
  ).toBeVisible();

  const loveButton = audienceView.getByRole('button', {name: 'love'});
  await loveButton.click();

  await expect(
    presentationPage.getByRole('figure', {name: 'love'}),
  ).toBeVisible();
  await expect(audienceView.getByRole('figure', {name: 'love'})).toBeVisible();
});

// TODO test confetti, but how?
