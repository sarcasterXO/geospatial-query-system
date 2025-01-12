import common from 'eslint-config-mahir/common';
import module from 'eslint-config-mahir/module';
import node from 'eslint-config-mahir/node';
import typescript from 'eslint-config-mahir/typescript';

/**
 * @type {import('@typescript-eslint/utils').TSESLint.FlatConfig.ConfigArray}
 */
export default [
  ...common,
  ...node,
  ...module,
  ...typescript,
  {
    name: 'root-config',
    rules: {
      'no-console': [
        'error',
        {
          allow: ['error', 'info', 'warn'],
        },
      ],
    },
    languageOptions: {
      parserOptions: {
        projectService: false,
        tsconfigRootDir: import.meta.dirname,
        project: ['./tsconfig.eslint.json'],
      },
    },
  },
  {
    ignores: ['**/dist/', 'README.md'],
  },
];
