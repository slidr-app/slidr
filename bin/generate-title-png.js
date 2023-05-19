import {join} from 'node:path';
import {writeFile, readdir} from 'node:fs/promises';
import * as pdf2img from 'pdf-img-convert';

const presentationsPath = './src/presentations';
const directoryContents = await readdir(presentationsPath);

await Promise.all(
  directoryContents
    .filter((fileName) => fileName.endsWith('.pdf'))
    .map(async (fileName) => {
      const images = await pdf2img.convert(join(presentationsPath, fileName), {
        width: 800,
        page_numbers: [1], // eslint-disable-line camelcase
        scale: 1,
      });
      await writeFile(
        join(presentationsPath, 'thumbs', `${fileName.slice(0, -3)}thumb.png`),
        images[0],
      );
    }),
);
