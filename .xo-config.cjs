module.exports = {
  extends: ["xo-react", "plugin:react/jsx-runtime"],
  prettier: true,
  space: true,
  overrides: [
    {
      files: "**/*.tsx",
      // envs: ['es2021', 'browser'],
      rules: {
        // "react/react-in-jsx-scope": "off",
        "unicorn/filename-case": [
          "error",
          {
            case: "pascalCase",
          },
        ],
        "n/file-extension-in-import": "off",
        "import/extensions": "off",
      },
    },
    {
      files: "**/*.ts",
      rules: {
        "import/extensions": "off",
        "n/file-extension-in-import": "off",
      },
    },
  ],
};
