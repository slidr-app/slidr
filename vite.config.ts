import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import unoCSS from 'unocss/vite';
import {imagetools} from 'vite-imagetools';
import {run} from 'vite-plugin-run';

// https://vitejs.dev/config/
export default defineConfig(({command, mode}) => {
  return {
    plugins: [
      {
        ...run({
          silent: false,
          input: [
            {
              // Generate thumbs when pdfs change
              name: 'generate pdf thumbs',
              run: ['pnpm', 'run', 'thumbs'],
              pattern: 'src/presentations/*.pdf',
            },
          ],
        }),
        apply: 'serve',
      },
      imagetools(),
      unoCSS(),
      react(),
    ],
  };
});
