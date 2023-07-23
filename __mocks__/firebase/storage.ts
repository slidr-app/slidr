import {
  type StorageReference,
  type UploadMetadata,
  uploadBytes as uploadBytesOriginal,
} from 'firebase/storage';
import {MagicFile} from '../../src/test/magic-file';

export * from 'firebase/storage';

export async function uploadBytes(
  ref: StorageReference,
  data: Blob | Uint8Array | ArrayBuffer,
  metadata?: UploadMetadata | undefined,
) {
  return uploadBytesOriginal(
    ref,
    // Firebase/storage expects a Buffer when running in node (i.e. tests)
    // It does not seem to work with any other type when running in node
    // If we pass a "MagicFile" automatically convert it to a Buffer
    data instanceof MagicFile ? data.getBuffer() : data,
    metadata,
  );
}
