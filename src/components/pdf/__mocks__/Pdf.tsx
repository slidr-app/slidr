import {readFile} from 'node:fs/promises';
import {vi} from 'vitest';
import OriginalPdf from '../Pdf';
import {type MagicFile} from '../../../test/magic-file';

const pages = await Promise.all([
  readFile('./test1.webp'),
  readFile('./test2.webp'),
  readFile('./test3.webp'),
]);

export default function Pdf({
  file,
  onSetPageCount,
  onPageRendered,
  pageIndex,
}: {
  file: File | MagicFile;
  onSetPageCount: (count: number) => void;
  onPageRendered: (canvas: HTMLCanvasElement) => void;
  pageIndex: number;
}) {
  console.log('overriding PDF');
  return (
    <OriginalPdf
      file={(file as MagicFile).getDataUri()}
      pageIndex={pageIndex}
      onSetPageCount={onSetPageCount}
      onPageRendered={(canvas) => {
        vi.mocked(canvas.toBlob).mockImplementation(
          (callback: BlobCallback) => {
            callback(pages[pageIndex] as unknown as Blob);
          },
        );
        onPageRendered(canvas);
      }}
    />
  );
}
