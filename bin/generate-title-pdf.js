import {join} from 'node:path';
import {readFile, writeFile, readdir} from 'node:fs/promises';
import {PDFDocument} from 'pdf-lib';

const presentationsPath = './src/presentations';
const directoryContents = await readdir(presentationsPath);

await Promise.all(
  directoryContents
    .filter((fileName) => fileName.endsWith('.pdf'))
    .map(async (fileName) => {
      const dataSrc = await readFile(join(presentationsPath, fileName));
      const pdfSrc = await PDFDocument.load(dataSrc);
      const pdfDest = await PDFDocument.create();
      const [page] = await pdfDest.copyPages(pdfSrc, [0]);
      await pdfDest.addPage(page);
      const dataDest = await pdfDest.save();
      await writeFile(
        join(presentationsPath, 'thumbs', `${fileName.slice(0, -3)}thumb.pdf`),
        dataDest,
      );
    }),
);
