import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import {VitePWA as vitePWA} from 'vite-plugin-pwa';
import unoCSS from 'unocss/vite';

// https://vitejs.dev/config/
export default defineConfig(({command, mode}) => {
  return {
    plugins: [
      unoCSS(),
      react(),
      vitePWA({
        // Chrome says not to precache icons since users will generally only down 1 of the set
        // Refer to: https://developer.chrome.com/docs/workbox/precaching-dos-and-donts/
        // workbox: {
        //   globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        // },
        // includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
        manifest: {
          name: 'Slidr.app',
          // eslint-disable-next-line @typescript-eslint/naming-convention
          short_name: 'Slidr',
          description: 'Interactive presentations, for free.',
          // eslint-disable-next-line @typescript-eslint/naming-convention
          theme_color: '#000000',
          icons: [
            {
              src: 'pwa-64x64.png',
              sizes: '64x64',
              type: 'image/png',
            },
            {
              src: 'pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: 'maskable-icon-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
      }),
    ],
  };
});
