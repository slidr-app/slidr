import {readFile} from 'node:fs/promises';
import {vi} from 'vitest';
import {useCallback, useMemo} from 'react';
import OriginalPdf from '../Pdf';
import {type MagicFile} from '../../../test/magic-file';

const pages = await Promise.all([
  readFile('./src/test/pdf/page1.webp'),
  readFile('./src/test/pdf/page2.webp'),
  readFile('./src/test/pdf/page3.webp'),
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
  const dataUri = useMemo(() => (file as MagicFile).getDataUri(), [file]);
  const onPageRenderedMockedToBlob = useCallback(
    (canvas: HTMLCanvasElement) => {
      // The mocked canvas toBlob doesn't do anything by default
      // In our tests, we will call the callback with pre-rendered page image
      vi.mocked(canvas.toBlob).mockImplementation((callback: BlobCallback) => {
        callback(pages[pageIndex] as unknown as Blob);
      });
      onPageRendered(canvas);
    },
    [onPageRendered, pageIndex],
  );

  return (
    <OriginalPdf
      // Rendering with jsdom seems to only work when using a data URI
      // Convert the uploaded file to a data URI for the test
      file={dataUri}
      pageIndex={pageIndex}
      onSetPageCount={onSetPageCount}
      onPageRendered={onPageRenderedMockedToBlob}
    />
  );
}
