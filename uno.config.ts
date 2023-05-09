// Uno.config.ts
import {defineConfig} from 'unocss';
import presetUno from '@unocss/preset-uno';
import presetIcons from '@unocss/preset-icons';
import presetTypography from '@unocss/preset-typography';
import transformerVariantGroup from '@unocss/transformer-variant-group';
import transformerDirectives from '@unocss/transformer-directives';

export default defineConfig({
  presets: [presetUno(), presetIcons(), presetTypography()],
  transformers: [transformerDirectives(), transformerVariantGroup()],
  shortcuts: {
    btn: 'py-2 px-4 font-semibold rounded-lg shadow-md shadow-green-700 bg-white text-black',
  },
});
