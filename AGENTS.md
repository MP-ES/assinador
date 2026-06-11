# Assinador MPES — Instruções para Agentes

## Visão Geral

Aplicação desktop Electron que atua como um **oráculo criptográfico PKCS#11 local** para o sistema GAMPES. Executa um servidor HTTP em `localhost:19333` que recebe hashes de documentos e retorna assinaturas digitais usando tokens de hardware (certificados A3).

Consulte [docs/analise-tecnica-assinador.md](docs/analise-tecnica-assinador.md) para a análise técnica completa.

## Arquitetura

```
src/main/           → Processo principal do Electron
  server/           → Servidor HTTP (rotas: /health, /api/tokens, /api/sign)
  libManager/       → Interação PKCS#11 (graphene-pk11): carregar libs, listar certs, assinar
  models/           → Detecção de plataforma
  config.js         → Persistência de configurações (porta, libs, devMode)
  ipc.js            → Handlers IPC para o renderer
src/renderer/       → Interface React (painel de configuração)
static/             → Ícones
```

**Fluxo principal**: GAMPES (browser) → `POST /api/sign` com hash + dados do token → `signer.js` usa PKCS#11 para assinar → retorna assinatura base64 + certificados.

## Stack Tecnológica

- Electron 9.0 / Node.js 14 (ambos em EOL — migração planejada)
- `graphene-pk11` 2.1.7 — binding PKCS#11 (C++ nativo via `pkcs11js`)
- `asn1.js-rfc5280` — parsing de certificados X.509
- React 16 + Chakra UI 0.8 (renderer)
- electron-webpack + electron-builder

## Build e Execução

```bash
npm install          # Requer windows-build-tools (node-gyp) e cross-env global
npm start            # Modo dev com hot reload
npm run release      # Build de produção (electron-webpack + electron-builder --x64)
npm run lint         # ESLint
```

**Importante**: o `postinstall` recompila o `pkcs11js` para Electron 9. O build requer ferramentas de compilação nativa.

## Convenções de Código

- ES modules com Babel (`import`/`export`)
- Prettier: aspas simples, sem trailing commas, 80 colunas, ponto e vírgula
- ESLint: eslint:recommended + plugin react + prettier
- Sem TypeScript — JavaScript puro
- Sem testes (nenhum framework de testes configurado)

## Convenção de Idioma

- Documentação, comentários e regras de negócio sempre em **português do Brasil**
- Manter em inglês apenas termos técnicos consolidados (ex.: Handler, Configuration, Repository, DTO, Service, middleware, slot, token)
- Objetivo: linguagem ubíqua entre negócio e código

## Problemas Conhecidos e Débitos Técnicos

- Build apenas x64 — incompatível com Apple Silicon (ver [docs/diagnostico-apple-silicon.md](docs/diagnostico-apple-silicon.md))
- `nodeIntegration: true` no renderer (risco de segurança)
- CORS `*` no servidor HTTP sem autenticação
- Parâmetros `algoritmoHash` e `esquemaAssinatura` são recebidos mas **ignorados** (hardcoded em SHA256_RSA_PKCS)
- PIN enviado em texto plano via HTTP

## Notas por Plataforma

- Windows: caminhos de DLLs em `libraries.js`, instalador NSIS
- macOS: caminhos de dylib, usa `mod.close()` em vez de `mod.finalize()`
- Linux: caminhos de .so, pacote RPM
- `__static` aponta para a pasta `static/` em tempo de execução
