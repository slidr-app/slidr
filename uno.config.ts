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
    presetIcons({
      extraProperties: {
        display: 'inline-block',
        'vertical-align': 'middle',
      },
    }),
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
    'border-primary': 'rounded-md border-2 border-teal',
    'shadow-primary': 'shadow-xl shadow-teal-800',
    btn: 'py-2 px-4 font-semibold shadow-primary  border-primary',
    header:
      'text-2xl border-primary border-t-none rounded-t-none shadow-primary text-center py-2 font-semibold',
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
  // Safelist width percentages used for the progress bar
  // eslint-disable-next-line unicorn/no-useless-spread
  safelist: [...Array.from({length: 101}, (_, i) => `w-[${i}%]`)],
});
