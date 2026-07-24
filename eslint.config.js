import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],

      // Convention: components are function declarations with a typed props alias.
      // Never React.FC / FC — it adds implicit children and weakens generics.
      'no-restricted-syntax': [
        'error',
        {
          selector:
            "TSTypeReference > TSQualifiedName[left.name='React'][right.name='FC']",
          message:
            'Do not use React.FC. Declare components as `function Name(props: NameProps)` with a `type` props alias.',
        },
        {
          selector: "TSTypeReference > Identifier[name='FC']",
          message:
            'Do not use FC. Declare components as `function Name(props: NameProps)` with a `type` props alias.',
        },
      ],
    },
  },
);
