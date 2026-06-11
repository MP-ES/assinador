module.exports = {
  extends: ['eslint:recommended', 'plugin:react/recommended', 'prettier'],
  plugins: ['prettier', 'react'],
  rules: {
    'no-useless-catch': ['warn'],
    'no-async-promise-executor': ['warn'],
    'prettier/prettier': ['error'],
    'newline-per-chained-call': ['error', { ignoreChainWithDepth: 2 }],
    'no-var': ['error'],
    'react/react-in-jsx-runtime': 'off',
    'react/prop-types': 'warn'
  },
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  },
  env: {
    es2022: true,
    browser: true,
    node: true
  },
  settings: {
    react: {
      version: 'detect'
    }
  }
};
