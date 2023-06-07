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
    'border-focus': 'rounded-md border-2 border-violet-700',
    'shadow-focus': 'shadow-xl shadow-violet-700',
    'outline-focus': 'outline outline-2 outline-gray-200',
    btn: 'py-2 px-4 font-semibold shadow-primary  border-primary bg-black',
    input:
      'p-2 shadow-primary border-primary bg-gray-200 text-black focus-visible:(border-focus outline-focus shadow-focus)',
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
        emoji: `{
          from,to {
            transform: translate3d(0,0,0);
          }
          0% {
            bottom: -100px;
            opacity: 1;
          }
          10%,30%,50%,70%,90% {
            transform: translate3d(calc(var(--reaction-bounce-distance) * -1),0,0);
          }
          20%,40%,60%,80% {
            transform: translate3d(var(--reaction-bounce-distance),0,0);
          }
          60% {
            opacity: 1;
          }
          100% {
            bottom: 90vh;
            opacity: 0;
          }
        }`,
      },
      durations: {
        longbounce: '120s',
        emoji: 'var(--reaction-duration)',
      },
      timingFns: {
        longbounce: 'ease-in-out',
        emoji: 'ease-out',
      },
      counts: {
        longbounce: 'infinite',
      },
      // Wiggle: 'wiggle 1s ease-in-out infinite',
    },
  },
});
