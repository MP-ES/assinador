# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## O que é

Aplicação desktop **Electron** que funciona como um **oráculo criptográfico PKCS#11 local** para o sistema GAMPES. Roda um servidor HTTP em `localhost:<porta>` (padrão 19333) que recebe hashes de documentos e devolve assinaturas digitais geradas por tokens de hardware (certificados A3, ICP-Brasil), via biblioteca nativa PKCS#11.

Documentação adicional: `AGENTS.md`, `docs/analise-tecnica-assinador.md`, `docs/diagnostico-apple-silicon.md`, `Readme.md` (variáveis de ambiente para usuário final), `Troubleshoot.md`.

## Comandos

```bash
npm start            # Dev com hot reload (electron-vite dev)
npm run build        # Build (electron-vite build) → dist/{main,preload,renderer}
npm run release      # build + electron-builder (instalador assinado/publicável)
npm run dist         # build + electron-builder --dir (pacote local, sem publicar)
npm run lint         # eslint ./src   ← único gate de CI em PRs
```

Não há suíte de testes nem framework de teste configurado. Não há type-checking (JavaScript puro, sem TypeScript). O `lint` é a única verificação automatizada.

## Stack real (atenção: difere de docs antigas)

O código **já foi migrado** para electron-vite. Vários arquivos de documentação e CI ainda descrevem o stack antigo — não confie neles para versões:

| | Estado real (package.json) | Docs/CI desatualizados |
|---|---|---|
| Bundler | electron-vite 3 | ~~electron-webpack~~ (AGENTS.md) |
| Electron | 33 | ~~9~~ |
| Node | >=22 (engines), `.nvmrc` 22, CI em 22 | ~~14~~ |
| React / UI | 18 + Chakra UI 2 | ~~16 / Chakra 0.8~~ |

`AGENTS.md` e `docs/analise-tecnica-assinador.md` ainda descrevem o stack antigo (Electron 9, Node 14, electron-webpack) — defasados em relação ao código. Os workflows de CI (`.github/workflows/*.yml`) e o `.nvmrc` já foram migrados para Node 22 + electron-vite.

## Arquitetura

Três processos Electron, build separado por `electron.vite.config.mjs` (cada um com seu `outDir` em `dist/`):

- **`src/main/`** — processo principal. Entry `src/main/index.js`: adquire single-instance lock, inicia tray, updater, autolauncher e o servidor HTTP.
- **`src/preload/index.js`** — ponte segura. Expõe `window.electronAPI` via `contextBridge`; cada método é um `ipcRenderer.invoke(...)`. `contextIsolation: true`, `nodeIntegration: false`.
- **`src/renderer/`** — UI React (painel de Configurações). Só fala com o main via `window.electronAPI`; nunca importa `electron` diretamente.

### Fluxo de assinatura (o core)

`GAMPES (browser) → POST /api/sign {token, hash, ...} → src/main/server/routes/sign.js → src/main/libManager/signer.js → PKCS#11 → { assinatura, signCertificate, otherCertificates }`

### Servidor HTTP (`src/main/server/`)

- `index.js` — cria o `http.Server`, seta CORS `*` (sem autenticação), trata OPTIONS, delega ao router. Rotas: `GET /health`, `GET /api/tokens`, `POST /api/sign`.
- `router.js` / `handler.js` — roteamento minimalista próprio (não usa Express); match exato de `url` + `method`.
- `routes/tokens.js` — lista certificados de todas as `config.libs` (+ `devCerts` se devMode).
- `routes/sign.js` — valida o body com **yup**; se `token.libraryPath === 'test'`, retorna assinatura fake (modo dev); senão chama `signer`.

### Camada PKCS#11 (`src/main/libManager/`)

Toda interação com o token de hardware usa **`graphene-pk11`** (binding nativo sobre `pkcs11js`). Funciona via `Module.load(lib) → initialize() → getSlots() → session.login(pin) → ...`.

- `libraries.js` — catálogo de caminhos de bibliotecas (.dll/.dylib/.so) por fabricante e plataforma.
- `index.js` — `identify()` testa cada lib do catálogo via `tryLoad`; `addLib/removeLib/reloadLibs` mantêm `config.libs`.
- `getCertificates.js` — lê certs do slot, decodifica X.509 com `asn1.js-rfc5280`, filtra por `subjectAlternativeName` (ICP-Brasil) e calcula validade com `moment`.
- `signer.js` — assina o hash. **Importante:** o mecanismo é hardcoded em `SHA256_RSA_PKCS`; os parâmetros `algoritmoHash` e `esquemaAssinatura` da requisição são validados mas ignorados.
- `fakeCerts.js` — certificados sintéticos para o modo dev.

### Detalhe de plataforma crítico

`src/main/models/platform.js` expõe `platform.current` (== `os.platform()`) e `platform.options`. Nos finalizadores PKCS#11 (`signer.js`, `getCertificates.js`, `tryLoad.js`) o macOS usa `mod.close()` enquanto Windows/Linux usam `mod.finalize()` — sempre trate os dois caminhos ao mexer em ciclo de vida de módulo. Cuidado: há ocorrências de `platform.currentPlatform` (campo inexistente, sempre `undefined`) em alguns `window-all-closed` — bug latente, não copie o padrão.

### Configuração e IPC

- `src/main/config.js` — fonte única de estado runtime (`port`, `libs`, `devMode`, `devCerts`). Persiste em `settings.json` dentro de `app.getPath('userData')`. Mutações (`setPort`, etc.) sempre chamam `persist()`; `setPort` também faz `server.restart()`. Porta restrita a 19333–19335.
- `src/main/ipc.js` — registra todos os `ipcMain.handle(...)`. Ao adicionar uma capacidade da UI: criar o handler aqui **e** expor o método em `src/preload/index.js` (os dois precisam casar).

### App de bandeja, sem janela principal por padrão

Não é uma app de janela: roda na **system tray** (`tray.js`). A janela de Configurações (`mainWindow.js`) fica escondida e só aparece via menu da tray; fechar a janela apenas a esconde (não encerra). `updater.js` usa electron-updater (publish via GitHub `MP-ES/assinador`); `autolauncher.js` configura início automático.

## Convenções

- **Idioma:** documentação, comentários e regras de negócio em **português do Brasil**. Mantenha em inglês só termos técnicos consolidados (Handler, Service, slot, token, middleware, DTO). Linguagem ubíqua entre negócio e código.
- **Estilo (Prettier):** aspas simples, `semi: true`, sem trailing comma, 80 colunas, `arrowParens: avoid`, `endOfLine: auto`. ESLint estende `eslint:recommended` + react + prettier.
- ES modules (`import`/`export`) em `src/main` e `src/renderer`; o `preload` usa CommonJS (`require`) por restrição do contexto de preload.
- `graphene-pk11` e `pkcs11js` são marcados como `external` no build do main (binário nativo, não passa pelo bundler).

## Build / empacotamento

`electron-builder.yml`: Windows → NSIS (x64); macOS → dmg (x64 **e** arm64); Linux → rpm. As bibliotecas PKCS#11 nativas por SO vêm de `./libs/{windows,mac,linux}` como `extraResources` em `static/libs`. Protocolo customizado registrado: `assinador-mpes://`. `static/` é copiado como resource e referenciado em runtime via `path.join(__dirname, '../../static/...')`.

## Dívidas técnicas conhecidas (não introduzir novas)

- CORS `*` no servidor HTTP, sem autenticação; PIN trafega em texto plano via HTTP local.
- `algoritmoHash` / `esquemaAssinatura` ignorados (mecanismo fixo SHA256_RSA_PKCS).
- `libs/` não existe no repo: instaladores não embarcam as bibliotecas PKCS#11 dos fabricantes (`extraResources` vira warning tolerado).
