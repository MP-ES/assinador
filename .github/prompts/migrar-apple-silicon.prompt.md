---
description: 'Migração do Assinador MPES para compatibilidade com Apple Silicon. Atualiza Electron, Node.js, módulos nativos e configuração de build para gerar binários arm64/universal.'
agent: 'agent'
tools: ['search', 'editFiles', 'terminalLastCommand', 'runInTerminal']
---

# Migração Apple Silicon — Assinador MPES

## Contexto

Leia os documentos de referência antes de iniciar qualquer alteração:

- [Análise técnica completa](../../docs/analise-tecnica-assinador.md)
- [Diagnóstico Apple Silicon](../../docs/diagnostico-apple-silicon.md)
- [AGENTS.md](../../AGENTS.md)

## Objetivo

Tornar o Assinador MPES compatível com Apple Silicon (arm64), mantendo suporte a Intel (x64) via build universal. A migração deve ser feita em fases para minimizar riscos.

## Restrições

- Manter compatibilidade com Windows x64 e Linux x64
- Não alterar a lógica de assinatura PKCS#11 (arquivo `signer.js`)
- Preservar a API HTTP existente (`/health`, `/api/tokens`, `/api/sign`)
- Seguir a convenção de idioma: português do Brasil para comentários/docs, termos técnicos consolidados em inglês

---

## Fase 1 — Atualização do Electron e Node.js

### Checklist:

- [ ] Identificar a versão LTS mais recente do Electron compatível com o projeto
- [ ] Mapear breaking changes entre Electron 9 e a versão alvo (consultar https://www.electronjs.org/docs/latest/breaking-changes)
- [ ] Atualizar `electron` no `package.json`
- [ ] Atualizar `electron-builder` para versão compatível
- [ ] Atualizar `electron-webpack` ou substituir por alternativa (ex.: `electron-vite`, `electron-forge`)
- [ ] Atualizar `engines.node` no `package.json` para Node.js 20+
- [ ] Atualizar `electron-updater` para versão compatível

### Pontos críticos:

- `nodeIntegration: true` em `mainWindow.js` → migrar para `contextBridge` + `preload.js`
- `remote` module removido → verificar se há uso no renderer
- `BrowserWindow` → verificar mudanças na API de webPreferences

---

## Fase 2 — Segurança do Renderer (contextBridge)

### Checklist:

- [ ] Criar `preload.js` com `contextBridge.exposeInMainWorld()`
- [ ] Expor apenas os métodos IPC necessários (listados em `ipc.js`)
- [ ] Remover `nodeIntegration: true` de `mainWindow.js`
- [ ] Adicionar `contextIsolation: true`
- [ ] Atualizar `src/renderer/` para usar a API exposta via `window.electronAPI` em vez de `ipcRenderer` direto
- [ ] Atualizar componentes: `Config.js`, `Token.js`, `DevMode.js`

---

## Fase 3 — Módulos Nativos (pkcs11js / graphene-pk11)

### Checklist:

- [ ] Verificar se a versão atual de `graphene-pk11` suporta arm64
- [ ] Se não, identificar a versão mínima com suporte arm64 e atualizar
- [ ] Verificar se `pkcs11js` compila para arm64 com a versão do Node.js alvo
- [ ] Atualizar script `postinstall` para compilar para a arquitetura correta (ou ambas)
- [ ] Testar compilação nativa em macOS arm64
- [ ] Remover referências hardcoded a `--arch=x64` nos scripts

---

## Fase 4 — Configuração de Build Universal

### Checklist:

- [ ] Atualizar `electron-builder.yml`:
  - Adicionar seção `mac.target` com arch `[x64, arm64]` ou `universal`
  - Manter `win.target` com `[x64, ia32]`
  - Manter `linux.target` com RPM
- [ ] Atualizar scripts no `package.json`:
  - Remover `--x64` do script `release`
  - Atualizar `preinstall` removendo `npm_config_arch=x64` hardcoded
  - Atualizar `postinstall` para recompilar `pkcs11js` com a arch correta
- [ ] Testar build para cada plataforma/arquitetura
- [ ] Verificar assinatura de código (code signing) para macOS

---

## Fase 5 — Validação

### Checklist:

- [ ] Testar em macOS Apple Silicon (M1/M2/M3/M4) — sem Rosetta
- [ ] Testar em macOS Intel (se disponível)
- [ ] Testar em Windows x64
- [ ] Testar em Linux x64
- [ ] Validar que `/api/tokens` lista certificados corretamente
- [ ] Validar que `/api/sign` assina com token PKCS#11
- [ ] Validar auto-updater (GitHub Releases com múltiplos artefatos)
- [ ] Verificar que o aviso "Descontinuação da compatibilidade" não aparece mais no macOS

---

## Riscos e Dependências Externas

| Risco                                                  | Mitigação                                                                                         |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------------------- |
| DYLIBs dos fabricantes de token sem versão arm64       | Documentar quais tokens funcionam; manter build x64 para fallback via Rosetta enquanto disponível |
| Breaking changes no Electron quebrarem funcionalidades | Migrar em fases, testar cada fase antes de avançar                                                |
| `graphene-pk11` incompatível com Node.js 20+           | Avaliar fork ou substituição por `pkcs11js` direto                                                |
| Renderer quebrar com contextIsolation                  | Testar isoladamente na Fase 2 antes de mexer em build                                             |

---

## Notas

- Ao concluir cada fase, commitar separadamente para facilitar rollback
- Atualizar a documentação em `docs/` conforme as mudanças forem aplicadas
- Se uma fase estiver bloqueada (ex.: módulo nativo não compila), prosseguir com a próxima e registrar o bloqueio
