// eslint-disable-next-line import/no-unassigned-import
import '@testing-library/jest-dom';
// PDF rendering and the upload page rely heavily on the canvas, it needs to be mocked
// eslint-disable-next-line import/no-unassigned-import
import 'vitest-canvas-mock';
// Import '@testing-library/jest-dom/extend-expect';

export async function setup() {
  // Console.log('clearing database');
  // Clear firestore before we start
  // await fetch(
  //   'http://127.0.0.1:8081/emulator/v1/projects/demo-test/databases/(default)/documents',
  //   {method: 'DELETE'},
  // );
}
