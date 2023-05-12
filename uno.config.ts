// Uno.config.ts
import {defineConfig} from 'unocss';
import presetUno from '@unocss/preset-uno';
import presetIcons from '@unocss/preset-icons';
import presetTypography from '@unocss/preset-typography';
import transformerVariantGroup from '@unocss/transformer-variant-group';
import transformerDirectives from '@unocss/transformer-directives';

export default defineConfig({
  presets: [
    presetUno(),
    presetIcons(),
    presetTypography({
      // By default h2 and others have huge top margin, make them more reasonable
      cssExtend: {
        h1: {
          'margin-top': '1rem',
        },
        h2: {
          'margin-top': '1rem',
        },
        h3: {
          'margin-top': '1rem',
        },
        h4: {
          'margin-top': '1rem',
        },
        h5: {
          'margin-top': '1rem',
        },
      },
    }),
  ],
  transformers: [transformerDirectives(), transformerVariantGroup()],
  shortcuts: {
    btn: 'py-2 px-2 font-semibold rounded-md shadow-md shadow-gray-500 bg-white text-black',
  },
  // https://github.com/unocss/unocss/discussions/2012
  theme: {
    animation: {
      keyframes: {
        longbounce: `{
            0%, 100% { transform: translateY(+100%) }
            50% { transform: translateY(0) }
          }`,
      },
      durations: {
        longbounce: '120s',
      },
      timingFns: {
        longbounce: 'ease-in-out',
      },
      counts: {
        longbounce: 'infinite',
      },
      // Wiggle: 'wiggle 1s ease-in-out infinite',
    },
  },
});
