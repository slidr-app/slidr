import fs from 'node:fs';
import {type Page} from '@playwright/test';

const dbFileName = 'playwright/.auth/indexeddb.json';

export async function exportFirebaseDb(page: Page) {
  const dbData = await page.evaluate(async () => {
    const dbRequest = window.indexedDB.open('firebaseLocalStorageDb');

    return new Promise((resolve) => {
      dbRequest.addEventListener('success', () => {
        const db = dbRequest.result;
        const store = 'firebaseLocalStorage';

        const tx = db.transaction(store);

        const object = tx.objectStore(store).getAll();
        object.addEventListener('success', () => {
          resolve({[store]: object.result});
        });
      });
    });
  });

  fs.writeFileSync(dbFileName, JSON.stringify(dbData), 'utf8');
}

export async function importFirebaseData(page: Page) {
  const importData = JSON.parse(fs.readFileSync(dbFileName, 'utf8')) as {
    firebaseLocalStorage: any[];
  };

  await page.addInitScript(async (dbData) => {
    if (window.location.hostname === 'localhost') {
      const dbRequest = window.indexedDB.open('firebaseLocalStorageDb');
      const store = 'firebaseLocalStorage';

      await new Promise<void>((resolve) => {
        dbRequest.addEventListener('upgradeneeded', () => {
          const db = dbRequest.result;
          db.createObjectStore(store, {keyPath: 'fbase_key'});
          resolve();
        });
      });

      await new Promise<void>((resolve) => {
        dbRequest.addEventListener('success', () => {
          resolve();
        });
      });

      const db = dbRequest.result;
      const tx = db.transaction(store, 'readwrite');

      for await (const value of dbData[store]) {
        const request = tx.objectStore(store).add(value);
        await new Promise<void>((resolve2) => {
          request.addEventListener('success', () => {
            resolve2();
          });
        });
      }
    }
  }, importData);
}
