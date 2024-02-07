import fs from 'node:fs';
import v8toIstanbul from 'v8-to-istanbul';
import {test as base} from '@playwright/test';

// Declare the types of your fixtures.
type MyFixtures = {
  _coveredPage: undefined;
};

export const test = base.extend<MyFixtures>({
  async _coveredPage({page}, use, testInfo) {
    // eslint-disable-next-line n/prefer-global/process
    if (process.env.COVERAGE) {
      await page.coverage.startJSCoverage();
    }

    await use(undefined);

    // eslint-disable-next-line n/prefer-global/process
    if (!process.env.COVERAGE) {
      return;
    }

    const coverage = await page.coverage.stopJSCoverage();

    // Absolute path to src folder "/Users/.../slidr/src"
    const srcPath = new URL('..', import.meta.url);

    const coverageEntries = await Promise.all(
      coverage
        .filter((entry) => {
          const coveragePath = new URL(
            `../..${new URL(entry.url).pathname}`,
            import.meta.url,
          );

          // Determine if the file is in the src folder
          const isInSrcFolder = coveragePath.pathname.startsWith(
            srcPath.pathname,
          );
          // Determine of the file is a CSS file
          const isCssFile = coveragePath.pathname.endsWith('.css');

          return isInSrcFolder && !isCssFile;
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
      `coverage/tmp/${testInfo.testId}.json`,
      JSON.stringify(report, null, 2),
    );
  },
});

export {expect} from '@playwright/test';
