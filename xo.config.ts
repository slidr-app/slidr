import {type FlatXoConfig} from 'xo';

const xoConfig: FlatXoConfig = [
  {
    space: true,
    prettier: true,
    react: true,
    rules: {
      'react/react-in-jsx-scope': 0,
    },
  },
  {
    files: ['**/*.tsx'],
    rules: {
      'unicorn/filename-case': [
        'error',
        {
          case: 'pascalCase',
        },
      ],
    },
  },
  {
    files: ['src/**/*.ts', 'src/**/*.tsx'],
    rules: {
      'import-x/extensions': 'off',
    },
  },
];

export default xoConfig;

//   Extends: ["xo-react", "plugin:react/jsx-runtime"],
//   prettier: true,
//   space: true,
//   overrides: [
//     {
//       files: "**/*.tsx",
//       // envs: ['es2021', 'browser'],
//       rules: {
//         // "react/react-in-jsx-scope": "off",
//         "unicorn/filename-case": [
//           "error",
//           {
//             case: "pascalCase",
//           },
//         ],
//         "n/file-extension-in-import": "off",
//         "import/extensions": "off",
//       },
//     },
//     {
//       files: "**/*.ts",
//       rules: {
//         "import/extensions": "off",
//         "n/file-extension-in-import": "off",
//       },
//     },
//   ],
// };
