import {dbAdmin} from '../test/firestore';
import {test, expect} from '../test/login-fixture';

let presentationId: string;

test.beforeAll(async () => {
  await fetch(
    'http://127.0.0.1:8081/emulator/v1/projects/demo-test/databases/(default)/documents/presentations/viewer-1',
    {method: 'DELETE'},
  );

  const presentationsQuerySnapshot = await dbAdmin
    .collection('presentations')
    .where('title', '==', 'A Presentation for Testing')
    .get();

  const presentationSnapshot = presentationsQuerySnapshot.docs[0];
  presentationId = presentationSnapshot.id;
});

test('can change the slide of the presentation', async ({
  context,
}, testInfo) => {
  const presentationPage = await context.newPage();
  const speakerPage = await context.newPage();
  const audienceView = await context.newPage();

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

  const nextButton = speakerPage.getByRole('button', {name: 'next'});
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

test('can add and clear reactions', async ({context}) => {
  const presentationPage = await context.newPage();
  const speakerPage = await context.newPage();
  const audienceView = await context.newPage();

  await presentationPage.goto(`/p/${presentationId}?session=speakertest`);
  await speakerPage.goto(`/s/${presentationId}?session=speakertest`);
  await audienceView.goto(`/i/${presentationId}?session=speakertest`);

  await expect(
    presentationPage.getByRole('img', {name: 'Slide page 1'}),
  ).toBeVisible();
  await expect(
    speakerPage.getByRole('img', {name: 'Slide page 1'}),
  ).toBeVisible();
  await expect(
    audienceView.getByRole('img', {name: 'Slide page 1'}),
  ).toBeVisible();

  const loveButton = speakerPage.getByRole('button', {name: 'love'});
  await loveButton.click();

  await expect(
    presentationPage.getByRole('figure', {name: 'love'}),
  ).toBeVisible();
  await expect(audienceView.getByRole('figure', {name: 'love'})).toBeVisible();

  const clearButton = speakerPage.getByRole('button', {name: 'clear'});
  await clearButton.click();

  await expect(
    presentationPage.getByRole('figure', {name: 'love'}),
  ).toHaveCount(0, {timeout: 500});
});

// TODO test confetti, but how?