import fs from 'node:fs';
import v8toIstanbul from 'v8-to-istanbul';
import {type Page, test as base} from '@playwright/test';

// Declare the types of your fixtures.
type MyFixtures = {
  coverage: {newPage: () => Promise<Page>};
};

export const test = base.extend<MyFixtures>({
  async coverage({page, context}, use, testInfo) {
    // eslint-disable-next-line n/prefer-global/process
    if (process.env.COVERAGE) {
      await page.coverage.startJSCoverage();
    }

    const pages: Page[] = [page];

    async function newPage() {
      const newPage = await context.newPage();

      // eslint-disable-next-line n/prefer-global/process
      if (process.env.COVERAGE) {
        await newPage.coverage.startJSCoverage();
      }

      pages.push(newPage);
      return newPage;
    }

    // eslint-disable-next-line react-hooks/rules-of-hooks
    await use({newPage});

    // eslint-disable-next-line n/prefer-global/process
    if (!process.env.COVERAGE) {
      return;
    }

    await Promise.all(
      pages.map(async (pageToCover, index) =>
        saveCoverage(pageToCover, `${testInfo.testId}_${index}`),
      ),
    );
  },
});

async function saveCoverage(page: Page, testId: string) {
  const coverage = await page.coverage.stopJSCoverage();

  // Absolute path to src folder "/Users/.../slidr/src"
  const sourcePath = new URL('..', import.meta.url);

  const coverageEntries = await Promise.all(
    coverage
      .filter((entry) => {
        const coveragePath = new URL(
          `../..${new URL(entry.url).pathname}`,
          import.meta.url,
        );

        // Determine if the file is in the src folder
        const isInSourceFolder = coveragePath.pathname.startsWith(
          sourcePath.pathname,
        );
        // Determine of the file is a CSS file
        const isCssFile = coveragePath.pathname.endsWith('.css');

        return isInSourceFolder && !isCssFile;
      })
      .map(async (entry) => {
        const coveragePath = new URL(
          `../..${new URL(entry.url).pathname}`,
          import.meta.url,
        );

        const converter = v8toIstanbul(coveragePath.pathname, 0, {
          source: entry.source!,
        });

        await converter.load();
        converter.applyCoverage(entry.functions);

        return converter.toIstanbul();
      }),
  );

  let report: Record<string, unknown> = {};
  for (const entry of coverageEntries) {
    report = {...report, ...entry};
  }

  fs.mkdirSync('coverage/tmp', {recursive: true});
  fs.writeFileSync(
    `coverage/tmp/${testId}.json`,
    JSON.stringify(report, null, 2),
  );
}

export {expect} from '@playwright/test';
