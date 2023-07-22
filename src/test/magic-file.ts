// Tests will use this instead of a regular File
// This allows the mocks to manipulate the data in a way that is compatible with the test environment
export class MagicFile extends File {
  buffer;
  // eslint-disable-next-line n/prefer-global/buffer
  constructor(buffer: Buffer, filename: string, options?: FilePropertyBag) {
    super([new Blob([buffer])], filename, options);
    this.buffer = buffer;
  }

  // Firebase/storage expects a buffer to upload files in node (i.e. tests)
  getBuffer() {
    return this.buffer;
  }

  // React-pdf only works with a data uri in the tests
  getDataUri() {
    return `data:application/pdf;base64,${this.buffer.toString('base64')}`;
  }
}
