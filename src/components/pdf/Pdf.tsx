import {useRef} from 'react';
import {Document, Page} from 'react-pdf';

function Pdf({
  file,
  onSetPageCount,
  onPageRendered,
  pageIndex,
}: {
  readonly file: File | string;
  readonly onSetPageCount: (count: number) => void;
  readonly onPageRendered: (canvas: HTMLCanvasElement) => void;
  readonly pageIndex: number;
}) {
  const canvasReference = useRef<HTMLCanvasElement>(null);

  return (
    <Document
      file={file}
      className="w-full aspect-video rounded-t-md"
      onLoadSuccess={(pdf) => {
        onSetPageCount(pdf.numPages);
      }}
    >
      <Page
        pageIndex={pageIndex}
        className="w-full aspect-video children:pointer-events-none"
        canvasRef={canvasReference}
        width={1920}
        // We want the exported images to be 1920, irrespective of the pixel ratio
        // Fix the ratio to 1
        devicePixelRatio={1}
        onRenderSuccess={() => {
          onPageRendered(canvasReference.current!);
        }}
      />
    </Document>
  );
}

export default Pdf;
