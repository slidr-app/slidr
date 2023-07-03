import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import {VitePWA as vitePWA} from 'vite-plugin-pwa';
import unoCSS from 'unocss/vite';
import {imagetools} from 'vite-imagetools';

// https://vitejs.dev/config/
export default defineConfig(({command, mode}) => {
  return {
    plugins: [
      imagetools(),
      unoCSS(),
      react(),
      vitePWA({registerType: 'autoUpdate'}),
    ],
  };
});
