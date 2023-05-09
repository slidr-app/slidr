import {defineConfig, loadEnv} from 'vite';
import react from '@vitejs/plugin-react';
import unoCSS from 'unocss/vite';

// https://vitejs.dev/config/
export default defineConfig(({command, mode}) => {
  // eslint-disable-next-line n/prefer-global/process
  const env = loadEnv(mode, process.cwd(), '');

  return {plugins: [unoCSS(), react()], base: env.BASE_URL ?? '/'};
});
