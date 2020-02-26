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
    'no-console': 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    semi: ['error', 'always'],
    'no-return-await': 'off',
    'template-curly-spacing': ['error', 'always'],
    'space-before-function-paren': 'off',
    'object-curly-spacing': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    'no-prototype-builtins': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-var-requires': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    'no-fallthrough': 'off'
  }
};
