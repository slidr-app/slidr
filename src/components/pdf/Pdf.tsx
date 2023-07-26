import {useRef} from 'react';
import {Document, Page} from 'react-pdf';

function Pdf({
  file,
  onSetPageCount,
  onPageRendered,
  pageIndex,
}: {
  file: File | string;
  onSetPageCount: (count: number) => void;
  onPageRendered: (canvas: HTMLCanvasElement) => void;
  pageIndex: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

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
        canvasRef={canvasRef}
        width={1920}
        // We want the exported images to be 1920, irrespective of the pixel ratio
        // Fix the ratio to 1
        devicePixelRatio={1}
        onRenderSuccess={() => {
          onPageRendered(canvasRef.current!);
        }}
      />
    </Document>
  );
}

export default Pdf;
