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

test('can navigate the presentation with the toolbar', async ({
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

  const previousButton = presentationPage.getByRole('button', {
    name: 'previous',
  });
  await previousButton.click();
  await expect(
    presentationPage.getByRole('img', {name: 'Slide page 1'}),
  ).toBeVisible();
  await expect(
    speakerPage.getByRole('img', {name: 'Slide page 1'}),
  ).toBeVisible();
  await expect(
    audienceView.getByRole('img', {name: 'Slide page 1'}),
  ).toBeVisible();

  const endButton = presentationPage.getByRole('button', {
    name: 'end',
  });
  await endButton.click();
  await expect(
    presentationPage.getByRole('img', {name: 'Slide page 3'}),
  ).toBeVisible();
  await expect(
    speakerPage.getByRole('img', {name: 'Slide page 3'}),
  ).toBeVisible();
  await expect(
    audienceView.getByRole('img', {name: 'Slide page 3'}),
  ).toBeVisible();

  const startButton = presentationPage.getByRole('button', {
    name: 'start',
  });
  await startButton.click();
  await expect(
    presentationPage.getByRole('img', {name: 'Slide page 1'}),
  ).toBeVisible();
  await expect(
    speakerPage.getByRole('img', {name: 'Slide page 1'}),
  ).toBeVisible();
  await expect(
    audienceView.getByRole('img', {name: 'Slide page 1'}),
  ).toBeVisible();
});

test('can add and clear reactions', async ({context}, testInfo) => {
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
