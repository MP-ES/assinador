import { defineConfig } from 'electron-vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// Remove atributos incompatíveis com file:// no HTML de produção
function electronRendererHtml() {
  return {
    name: 'electron-renderer-html',
    transformIndexHtml(html) {
      return html
        .replace(/ crossorigin/g, '')
        .replace(/ type="module"/g, '');
    }
  };
}

export default defineConfig({
  main: {
    build: {
      outDir: 'dist/main',
      lib: {
        entry: 'src/main/index.js'
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
    plugins: [react(), electronRendererHtml()]
  }
});
