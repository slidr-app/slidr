import fs from 'node:fs';
import {type Page} from '@playwright/test';

const databaseFileName = 'playwright/.auth/indexeddb.json';

export async function exportFirebaseDatabase(page: Page) {
  const databaseData = await page.evaluate(async () => {
    const databaseRequest = globalThis.indexedDB.open('firebaseLocalStorageDb');

    return new Promise((resolve) => {
      databaseRequest.addEventListener('success', () => {
        const database = databaseRequest.result;
        const store = 'firebaseLocalStorage';

        const tx = database.transaction(store);

        const object = tx.objectStore(store).getAll();
        object.addEventListener('success', () => {
          resolve({[store]: object.result});
        });
      });
    });
  });

  fs.writeFileSync(databaseFileName, JSON.stringify(databaseData), 'utf8');
}

export async function importFirebaseData(page: Page) {
  const importData = JSON.parse(fs.readFileSync(databaseFileName, 'utf8')) as {
    firebaseLocalStorage: any[];
  };

  await page.addInitScript(async (databaseData) => {
    if (globalThis.location.hostname === 'localhost') {
      const databaseRequest = globalThis.indexedDB.open(
        'firebaseLocalStorageDb',
      );
      const store = 'firebaseLocalStorage';

      await new Promise<void>((resolve) => {
        databaseRequest.addEventListener('upgradeneeded', () => {
          const database = databaseRequest.result;
          database.createObjectStore(store, {keyPath: 'fbase_key'});
          resolve();
        });
      });

      await new Promise<void>((resolve) => {
        databaseRequest.addEventListener('success', () => {
          resolve();
        });
      });

      const database = databaseRequest.result;
      const tx = database.transaction(store, 'readwrite');

      for (const value of databaseData[store]) {
        const request = tx.objectStore(store).add(value);
        // eslint-disable-next-line promise/param-names, no-await-in-loop
        await new Promise<void>((resolve2) => {
          request.addEventListener('success', () => {
            resolve2();
          });
        });
      }
    }
  }, importData);
}
