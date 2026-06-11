import { defineConfig } from 'electron-vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  main: {
    build: {
      outDir: 'dist/main',
      lib: {
        entry: 'src/main/main.js'
      },
      rollupOptions: {
        external: ['graphene-pk11', 'pkcs11js']
      }
    },
    resolve: {
      alias: {
        '@static': path.resolve(__dirname, 'static')
      }
    }
  },
  preload: {
    build: {
      outDir: 'dist/preload',
      lib: {
        entry: 'src/preload/index.js'
      }
    }
  },
  renderer: {
    root: 'src/renderer',
    build: {
      outDir: 'dist/renderer'
    },
    plugins: [react()]
  }
});
