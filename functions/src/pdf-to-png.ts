/* eslint-disable no-await-in-loop */
import {fileURLToPath} from 'node:url';
import {type PDFDocumentLoadingTask} from 'pdfjs-dist';
import {type DocumentInitParameters} from 'pdfjs-dist/types/src/display/api.js';
import {type NodeCanvasFactory} from 'pdfjs-dist/types/src/display/node_utils.js';
import sharp from 'sharp';
import * as logger from 'firebase-functions/logger';

const cMapUrl = fileURLToPath(import.meta.resolve('pdfjs-dist/cmaps/'));
const standardFontDataUrl = fileURLToPath(
  import.meta.resolve('pdfjs-dist/standard_fonts/'),
);

let getDocument: (source: DocumentInitParameters) => PDFDocumentLoadingTask;

export async function pdfDataToPngData(data: Uint8Array) {
  // Lazy load the PDF.js library, this needs to occur in the context of
  // function execution, not when loading the module (happens during deployment).
  if (getDocument === undefined) {
    const pdfjsModule = await import('pdfjs-dist/legacy/build/pdf.mjs');
    getDocument = pdfjsModule.getDocument;
  }

  console.log('# Converting PDF to PNG image buffer...');
  const loadingTask = getDocument({
    data: Uint8Array.from(data),
    cMapUrl,
    cMapPacked: true,
    standardFontDataUrl,
  });
  console.log('# PDF.js initialized.');

  try {
    const pdfDocument = await loadingTask.promise;
    console.log('# PDF document loaded.');

    const {canvasFactory} = pdfDocument;
    const pageImages: Uint8Array[] = [];

    // Get the first page.
    for (let pageIndex = 0; pageIndex < pdfDocument.numPages; pageIndex++) {
      const page = await pdfDocument.getPage(pageIndex + 1);

      const originalViewport = page.getViewport({scale: 1});

      // Render the page on a Node canvas with 100% scale.
      // Const viewport = page.getViewport({scale: 2});

      // Determine the scale to get height === 1080px
      const scale = 1080 / originalViewport.height;
      const viewport = page.getViewport({scale});

      const canvasAndContext = (canvasFactory as NodeCanvasFactory).create(
        viewport.width,
        viewport.height,
      );
      const renderContext = {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        canvasContext: canvasAndContext.context,
        viewport,
      };

      const renderTask = page.render(renderContext);
      await renderTask.promise;
      console.log('# PDF page rendered.');
      // Convert the canvas to an image buffer.
      // @ts-expect-error this works
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      const imageBuffer = canvasAndContext.canvas.toBuffer(
        'image/png',
      ) as Buffer; // eslint-disable-line @typescript-eslint/no-restricted-types, n/prefer-global/buffer
      console.log('# PNG image buffer created.');
      // TODO: do we need to wrap with Uint8Array?
      const {info, data: webpData} = await sharp(imageBuffer)
        .webp()
        .toBuffer({resolveWithObject: true});

      pageImages.push(Uint8Array.from(webpData));

      logger.info('webp indexed', info);
      console.log('# PNG image data created.');

      page.cleanup();
    }

    await pdfDocument.cleanup();

    return pageImages;
  } catch (error) {
    throw new Error(`Error converting PDF to PNG: ${(error as Error).stack}`);
  }
}
