module.exports = {
  extends: ['eslint:recommended', 'plugin:react/recommended'],
  plugins: ['prettier', 'react'],
  rules: {
    'no-useless-catch': ['warn'],
    'no-async-promise-executor': ['warn'],
    'prettier/prettier': ['error'],
    'newline-per-chained-call': ['error', { ignoreChainWithDepth: 2 }],
    'no-var': ['error']
  },
  parser: 'babel-eslint',
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module'
  },
  env: {
    es6: true,
    browser: true,
    node: true
  },
  globals: {
    __static: true
  },
  settings: {
    react: {
      version: 'detect'
    }
  }
};
