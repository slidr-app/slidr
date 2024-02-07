import fs from 'node:fs';
import {test as base, expect} from '@playwright/test';
import v8toIstanbul from 'v8-to-istanbul';
import {type LoginPage, loginPageFactory} from '../test/login-page';
import {generateId} from '../test/id';

const test = base.extend<{loginPage: LoginPage}>({
  async loginPage({page}, use) {
    const loginPage = loginPageFactory(page);
    await use(loginPage);
  },

  // Async page({page}, use) {
  //   await importFirebaseData(page);
  //   void use(page);
  // },
});

test.only('upload button appears after signing in', async ({
  page,
  loginPage,
}, testInfo) => {
  test.setTimeout(30_000);
  await page.coverage.startJSCoverage();
  await page.goto('/');
  await expect(page.getByRole('button', {name: /upload/i})).not.toBeVisible();

  await loginPage.goto();
  await loginPage.signIn();
  await loginPage.signInComplete();
  await page.goto('/');
  await expect(page.getByRole('button', {name: /upload/i})).toBeVisible();
  const coverage = await page.coverage.stopJSCoverage();
  // Absolute path to src folder "/Users/.../slidr/src"
  const srcPath = new URL('..', import.meta.url);

  let report: unknown = {};
  for (const entry of coverage) {
    // Absolute path to the coverage entry file "/Users/.../slidr/..."
    const coveragePath = new URL(
      `../..${new URL(entry.url).pathname}`,
      import.meta.url,
    );

    // Determine if the file is in the src folder
    const isInSrcFolder = coveragePath.pathname.startsWith(srcPath.pathname);

    if (!isInSrcFolder) {
      continue;
    }

    if (coveragePath.pathname.endsWith('.css')) {
      continue;
    }

    // Console.log(coveragePath.pathname);
    // console.log('entry', entry);
    const converter = v8toIstanbul(coveragePath.pathname, 0, {
      source: entry.source,
    });
    await converter.load();
    converter.applyCoverage(entry.functions);
    // Report[entry.source!] = converter.toIstanbul();

    report = {...report, ...converter.toIstanbul()};
    // Console.log(JSON.stringify(converter.toIstanbul()));
  }

  fs.mkdirSync('coverage/tmp', {recursive: true});
  // Fs.writeFileSync(
  //   'coverage/tmp/coverage.json',
  //   JSON.stringify(report, null, 2),
  // );
  fs.writeFileSync(
    `coverage/tmp/${testInfo.testId}.json`,
    JSON.stringify(report, null, 2),
  );
});

test.only('can upload and view presentation', async ({
  page,
  loginPage,
}, testInfo) => {
  test.setTimeout(60_000);
  await page.coverage.startJSCoverage();

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
  await expect(page.getByText(/done/i)).toBeVisible({timeout: 20_000});
  await page.getByLabel(/title/i).fill(presentationName);
  await expect(page.getByText(/saving/i)).toBeVisible();
  await expect(page.getByText(/saving/i)).not.toBeVisible();
  await page.getByRole('button', {name: /slidr/i}).click();

  const presentation = page.getByText(presentationName);
  await expect(presentation).toBeVisible();

  await presentation.click();
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
  const coverage = await page.coverage.stopJSCoverage();
  // Absolute path to src folder "/Users/.../slidr/src"
  const srcPath = new URL('..', import.meta.url);

  let report: unknown = {};
  for (const entry of coverage) {
    // Absolute path to the coverage entry file "/Users/.../slidr/..."
    const coveragePath = new URL(
      `../..${new URL(entry.url).pathname}`,
      import.meta.url,
    );

    // Determine if the file is in the src folder
    const isInSrcFolder = coveragePath.pathname.startsWith(srcPath.pathname);

    if (!isInSrcFolder) {
      continue;
    }

    if (coveragePath.pathname.endsWith('.css')) {
      continue;
    }

    // Console.log(coveragePath.pathname);
    // console.log('entry', entry);
    const converter = v8toIstanbul(coveragePath.pathname, 0, {
      source: entry.source,
    });
    await converter.load();
    converter.applyCoverage(entry.functions);
    // Report[entry.source!] = converter.toIstanbul();

    report = {...report, ...converter.toIstanbul()};
    // Console.log(JSON.stringify(converter.toIstanbul()));
  }

  fs.mkdirSync('coverage/tmp', {recursive: true});
  fs.writeFileSync(
    `coverage/tmp/${testInfo.testId}.json`,
    JSON.stringify(report, null, 2),
  );
});
