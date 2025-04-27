import globals from "globals";

export default [
  { ignores: ['dist', 'node_modules', 'eslint.config.js'] },
  {
    files: ['**/*.{js,mjs,cjs}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.node, // בשרת Node, לא browser
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    rules: {
      "semi": ["error", "always"],
      "no-empty-function": ["error"],
      "no-unused-vars": ["warn"],
      "eqeqeq": ["error", "always"],
    },
  },
];
