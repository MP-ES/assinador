import { defineConfig } from 'electron-vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// Remove atributos incompatíveis com file:// no HTML de produção
function electronRendererHtml() {
  return {
    name: 'electron-renderer-html',
    // Só no build: em dev o renderer é servido via HTTP e precisa do ES module
    // (HMR, transform de JSX). A conversão para script clássico vale apenas para
    // o carregamento file:// do app empacotado.
    apply: 'build',
    transformIndexHtml(html) {
      // Sob file:// (app instalado) ES modules não carregam, então convertemos
      // o script de módulo em script clássico. Trocamos type="module" por defer
      // para preservar a execução pós-parse do DOM — sem defer, o script roda no
      // <head> antes de <div id="app"> existir e o createRoot recebe null.
      return html
        .replace(/ crossorigin/g, '')
        .replace(/ type="module"/g, ' defer');
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
      outDir: 'dist/renderer',
      // Empacota o renderer como IIFE (closure único) em vez de ES module. Sob
      // file:// no app instalado, ES modules são bloqueados; ao virar script
      // clássico, declarações de topo do bundle (ex.: getComputedStyle do
      // framer-motion) vazariam para window e colidiriam com APIs nativas. O
      // IIFE isola tudo num escopo próprio, evitando essa colisão.
      rollupOptions: {
        output: {
          format: 'iife',
          inlineDynamicImports: true
        }
      }
    },
    plugins: [react(), electronRendererHtml()]
  }
});
