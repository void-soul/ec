module.exports = {
  root: true,
  env: {
    node: true
  },
  extends: [
    'plugin:vue/essential',
    '@vue/standard',
    '@vue/typescript/recommended'
  ],
  parserOptions: {
    ecmaVersion: 2020
  },
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    semi: ['error', 'always'],
    'template-curly-spacing': ['error', 'always'],
    'space-before-function-paren': ['error', 'never'],
    'object-curly-spacing': ['error', 'never'],
    '@typescript-eslint/no-unused-vars': 'off',
    '@typescript-eslint/no-var-requires': 'off',
    'space-before-function-paren': ['off', 'always'],
    'object-curly-spacing': ['off', 'always']
  }
};
