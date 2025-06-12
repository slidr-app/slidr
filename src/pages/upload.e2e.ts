import {test, expect} from '../test/login-fixture';
import {generateId} from '../test/id';

test.describe.configure({mode: 'parallel'});

test('can upload and view presentation', async ({page, loginPage}) => {
  test.setTimeout(60_000);

  await page.goto('/');
  await expect(page.getByRole('button', {name: /upload/i})).not.toBeVisible();

  await loginPage.goto();
  await loginPage.signIn();
  await loginPage.signInComplete();

  const presentationName = `e2e test - ${generateId()}`;
  await page.goto('/');
  await page.getByRole('button', {name: /upload/i}).click();
  await page
    .getByRole('button', {
      name: /drag 'n' drop/i,
    })
    .locator('input')
    .setInputFiles('./src/test/pdf/test.pdf');
  await expect(page.getByText(/done/i)).toBeVisible({timeout: 30_000});
  await page.getByLabel(/title/i).fill(presentationName);
  await expect(page.getByText(/saving/i)).toBeVisible();
  await expect(page.getByText(/saving/i)).not.toBeVisible();
  await page.getByRole('button', {name: /slidr/i}).click();

  // Find the presentation in the list
  const presentation = page
    .getByRole('list', {
      name: /presentations/i,
    })
    .getByRole('listitem')
    .filter({
      has: page.getByText(presentationName),
    })
    .first();
  await expect(presentation).toBeVisible();

  // Can edit my presentation
  await expect(presentation.getByRole('button', {name: 'edit'})).toBeVisible();

  // View the presentation
  await presentation.getByRole('button', {name: 'view'}).click();
  const page1 = page.getByAltText(/slide page 1/i);
  await expect(page1).toBeVisible();
  await expect(page1).toHaveScreenshot('page-1.png');

  await page.getByRole('button', {name: /next/i}).click();
  const page2 = page.getByAltText(/slide page 2/i);
  await expect(page2).toBeVisible();
  await expect(page2).toHaveScreenshot('page-2.png');

  await page.getByRole('button', {name: /next/i}).click();
  const page3 = page.getByAltText(/slide page 3/i);
  await expect(page3).toBeVisible();
  await expect(page3).toHaveScreenshot('page-3.png');
});

test('can edit presentation settings', async ({page, loginPage}) => {
  test.setTimeout(60_000);

  await loginPage.goto();
  await loginPage.signIn();
  await loginPage.signInComplete();

  const presentationName = `e2e test - ${generateId()}`;
  await page.goto('/');
  await page.getByRole('button', {name: /upload/i}).click();
  await page
    .getByRole('button', {
      name: /drag 'n' drop/i,
    })
    .locator('input')
    .setInputFiles('./src/test/pdf/test.pdf');
  await expect(page.getByText(/done/i)).toBeVisible({timeout: 30_000});
  await page.getByLabel(/title/i).fill(presentationName);
  await expect(page.getByText(/saving/i)).toBeVisible();
  await expect(page.getByText(/saving/i)).not.toBeVisible();
  await page.getByRole('button', {name: /slidr/i}).click();

  // Find the presentation in the list
  const presentation = page
    .getByRole('list', {
      name: /presentations/i,
    })
    .getByRole('listitem')
    .filter({
      has: page.getByText(presentationName),
    })
    .first();
  await expect(presentation).toBeVisible();

  // Can edit my presentation
  const editButton = presentation.getByRole('button', {name: 'edit'});
  await expect(editButton).toBeVisible();
  await editButton.click();

  await expect(page.getByText('Presentation Settings')).toBeVisible();
  await expect(page.getByRole('img', {name: 'Slide 1'})).toBeVisible();
  const titleTextBox = page.getByLabel('Title:');
  await expect(titleTextBox).toBeVisible();
  const editedPresentationName = `rename - ${generateId()}`;
  await titleTextBox.fill(editedPresentationName);

  // Add a list into slide 1 notes
  const page1Notes = page
    .getByRole('list', {name: /speaker notes/i})
    .getByRole('listitem')
    .filter({
      has: page.getByText(/page 1/i),
    })
    .first();
  await page1Notes.getByRole('textbox').fill('* abc\n* def');
  await expect(page1Notes.getByRole('listitem').getByText('abc')).toBeVisible();
  await expect(page1Notes.getByRole('listitem').getByText('def')).toBeVisible();

  // Add a header into slide 2 notes
  const page2Notes = page
    .getByRole('list', {name: /speaker notes/i})
    .getByRole('listitem')
    .filter({
      has: page.getByText(/page 2/i),
    })
    .first();
  await page2Notes.getByRole('textbox').fill('# title');
  await expect(page2Notes.getByRole('heading', {name: 'title'})).toBeVisible();

  // Copy slide 3 into slide 2 notes
  const page3Notes = page
    .getByRole('list', {name: /speaker notes/i})
    .getByRole('listitem')
    .filter({
      has: page.getByText(/page 3/i),
    })
    .first();
  const copyPreviousButton = page3Notes
    .getByRole('button')
    .and(page3Notes.getByTitle('Copy previous'));
  await expect(copyPreviousButton).toBeVisible();
  await copyPreviousButton.click();
  const pages2And3Notes = page
    .getByRole('list', {name: /speaker notes/i})
    .getByRole('listitem')
    .filter({
      has: page.getByText(/pages 2 - 3/i),
    })
    .first();
  await expect(
    pages2And3Notes.getByRole('img', {name: 'Slide 2'}),
  ).toBeVisible();
  await expect(
    pages2And3Notes.getByRole('img', {name: 'Slide 3'}),
  ).toBeVisible();

  // Wait for the saving to be done
  await expect(page.getByText(/saving/i)).toBeVisible();
  await expect(page.getByText(/saving/i)).not.toBeVisible();

  // Find the presentation in the list
  await page.getByRole('button', {name: /slidr/i}).click();
  const editedPresentation = page
    .getByRole('list', {
      name: /presentations/i,
    })
    .getByRole('listitem')
    .filter({
      has: page.getByText(editedPresentationName),
    })
    .first();
  await expect(editedPresentation).toBeVisible();

  // Can edit my presentation
  const presentButton = editedPresentation.getByRole('button', {
    name: 'present',
  });
  await expect(presentButton).toBeVisible();
  await presentButton.click();

  const speakerButton = page.getByRole('button', {name: 'speaker'});
  const popupPromise = page.waitForEvent('popup');
  await speakerButton.click();
  const popup = await popupPromise;
  await popup.waitForLoadState();

  await expect(popup.getByText('Slide: 1')).toBeVisible();
  await expect(popup.getByRole('listitem').getByText('abc')).toBeVisible();

  await popup.getByRole('button', {name: 'next'}).click();
  await expect(popup.getByText('Slide: 2')).toBeVisible();
  await expect(popup.getByRole('heading', {name: 'title'})).toBeVisible();

  await popup.getByRole('button', {name: 'next'}).click();
  await expect(popup.getByText('Slide: 3')).toBeVisible();
  await expect(popup.getByRole('heading', {name: 'title'})).toBeVisible();
});
