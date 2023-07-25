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

        workbox: {
          globIgnores: [
            '**/node_modules/**/*',
            // For now, don't cache the upload page assets, it has a huge ~2MB worker
            'assets/pdf.worker*.js',
            'assets/Upload*.js',
          ],

          // Don't cache the upload route (will generate offline error)
          // TODO: consider adding a wrapper for this page, or a special error handler
          // in order to have a message instructing the user they mush be online to upload.
          navigateFallbackDenylist: [/^\/upload/],

          // Make fonts work offline: https://vite-pwa-org.netlify.app/workbox/generate-sw.html
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'gstatic-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365, // <== 365 days
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
          ],
        },
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
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/test/setup.ts',
      include: ['src/**/*.[Tt]est.ts?(x)'],
      coverage: {
        // Src: [`${process.cwd()}/src`],
        all: true,
        exclude: [
          '.xo-config.cjs',
          'pwa-assets.config.ts',
          'uno.config.ts',
          'functions/**',
          'tests',
          '**/*.Test.tsx',
          'src/test/**',
        ],
        reporter: ['text', 'html', 'clover', 'json', 'text-summary'],
      },
      testTimeout: 10_000,
      // You might want to disable it, if you don't have tests that rely on CSS
      // since parsing CSS is slow
      // css: true,
    },
  };
});
