import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import unoCSS from 'unocss/vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [unoCSS(), react()],
});
