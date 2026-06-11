# Build e Distribuição — Assinador MPES

Guia prático para gerar instaladores, distribuir para testes e publicar releases
com auto-update. Complementa o `docs/diagnostico-apple-silicon.md` (o "porquê" do
macOS) e o `CLAUDE.md` (arquitetura).

## Onde cada artefato pode ser gerado

| Artefato | Plataforma de build | Cross-compila? |
| --- | --- | --- |
| Instalador Windows (NSIS `.exe`, x64) | Windows | — |
| dmg macOS (x64 **e** arm64) | **Só macOS** | **Não** a partir de Windows/Linux |
| RPM Linux | Linux (ou CI) | parcial |

O dmg do macOS **não pode** ser gerado no Windows: criação do DMG, assinatura,
notarização e a recompilação do módulo nativo `pkcs11js` para `darwin-arm64`
exigem macOS. Use um Mac Apple Silicon físico ou o GitHub Actions (runner
`macos-latest`, que já é Apple Silicon).

## Windows

```powershell
# Instalador local, SEM publicar (gera installer\assinador-<versão>-x64-win.exe)
npm run build
npx electron-builder --publish never
```

Notas:

- `npm run release` tenta **publicar no GitHub** ao final e falha sem a env
  `GH_TOKEN`. Para apenas gerar o `.exe` localmente, use `--publish never` como
  acima.
- O warning `file source doesn't exist from=...\libs\windows` é tolerado: a pasta
  `libs/` não existe neste repositório, então as bibliotecas PKCS#11 dos
  fabricantes **não** são embarcadas. No Windows isso costuma funcionar porque o
  middleware do fabricante instala as DLLs no sistema (ex.: `system32\eTPKCS11.dll`)
  e `src/main/libManager/libraries.js` tem esses caminhos absolutos como fallback.
- O build assina os binários com `signtool.exe` (certificado configurado na
  máquina/CI).

### Validação pelo tester (token real)

1. Instalar o `.exe` e abrir o app (ele roda na **bandeja**, não abre janela).
2. Conferir que o serviço subiu: abrir `http://localhost:19333/health` →
   deve retornar `{"version":"<versão>"}`.
3. Inserir o token e listar certificados:
   ```powershell
   Invoke-RestMethod http://localhost:19333/api/tokens
   ```
   Deve retornar um array com `displayName`, `id`, `slotId`, `libraryPath`,
   `valid`. Se vier vazio: abrir a janela de Configurações pela bandeja e usar
   "Recarregar"/"Incluir Biblioteca" para apontar a lib PKCS#11 do token.
4. `POST /api/sign` é melhor validado **ponta a ponta pelo GAMPES**, pois exige o
   PIN do token e um hash real de documento. O corpo esperado está documentado em
   `docs/analise-tecnica-assinador.md` (seção 2.2).

## macOS (a fazer quando houver um Mac)

O `electron-builder.yml` já define `mac.target: dmg` com `arch: [x64, arm64]`,
então o build gera **dois** dmg: `...-x64-mac.dmg` (Intel) e `...-arm64-mac.dmg`
(Apple Silicon).

```bash
# Em um Mac Apple Silicon:
npm install            # postinstall recompila pkcs11js para a arch do Mac
npm run build
npx electron-builder --mac --publish never
```

### Rodar sem Rosetta

Instalar o **dmg arm64** (arrastar para Applications) → o app roda nativo, sem
Rosetta. Dois obstáculos práticos:

1. **Gatekeeper / notarização.** Um dmg baixado da internet sem assinatura
   *Developer ID* + notarização é bloqueado ("app está danificado" / "desenvolvedor
   não verificado").
   - **Distribuição correta:** assinar com *Developer ID Application* + notarizar
     (exige Apple Developer Program, US$99/ano).
   - **Teste interno (atalho):** o tester remove a quarentena:
     ```bash
     xattr -dr com.apple.quarantine "/Applications/Assinador MPES.app"
     ```
     ou abre com botão-direito → Abrir. Serve para tester de confiança, não para
     rollout.

2. **`.dylib` arm64 do fabricante do token (gargalo real).** Um processo arm64
   **não** carrega uma biblioteca PKCS#11 x64 — não se mistura arquitetura no mesmo
   processo. App arm64 só assina sem Rosetta se o fabricante (ePass2003, eToken,
   WDPKCS…) tiver middleware arm64. Caso só exista `.dylib` x64, as opções são
   distribuir o app **x64** sob Rosetta (temporário) ou aguardar o fabricante.
   **Fora do controle do MPES.** Só o teste com token real confirma.

## Auto-updater (electron-updater + GitHub)

O provider já aponta para `MP-ES/assinador` (`electron-builder.yml`). Para testar:

1. Subir a versão em `package.json` (ex.: `5.0.1`).
2. Buildar publicando: `npx electron-builder --publish always` com `GH_TOKEN` de
   escrita no repo. Alternativa: `--publish never` e depois criar a Release no
   GitHub manualmente, subindo os artefatos **e** os arquivos `latest.yml` (win) /
   `latest-mac.yml` (mac), gerados em `installer/`. Sem esses `.yml` o updater
   **não** detecta a nova versão.
3. Instalar a versão **antiga**, publicar a nova; o app checa no startup
   (`src/main/updater.js`, `updater.start()`).

⚠️ No macOS o auto-update **exige app assinado** — o electron-updater recusa
update não assinado. Ou seja, Developer ID é necessário também para o auto-update
no mac.

## CI (GitHub Actions)

Os workflows já estão no stack novo (Node 22 + electron-vite):

- **`pullRequest.yml`** (em PRs para `main`): `npm ci --ignore-scripts`, `lint` e
  `build` no `ubuntu-latest` — feedback rápido, sem recompilar nativo.
- **`main.yml`** (push em `main`, tags `v*`, dispatch): matrix `windows-latest` +
  `macos-latest` (Apple Silicon → dmg arm64 nativo). Em **tag `v*`** faz build +
  `--publish always` (cria a Release no GitHub e os `latest*.yml` do auto-updater);
  em push/dispatch faz build sem publicar e sobe os instaladores como **artifacts**
  baixáveis (permite pegar o dmg/exe sem ter um Mac e sem publicar release).

Fluxo para gerar uma release com auto-update: criar e empurrar uma tag `v5.0.1`
(após bumpar o `package.json`).

## Pendências

- **Apple Developer ID:** verificar se o MPES tem conta no Apple Developer Program.
  Sem ela: distribuição ampla no macOS e auto-update no mac ficam bloqueados (só
  dá para testar via atalho `xattr`). Quando houver, preencher os secrets de
  assinatura/notarização comentados em `.github/workflows/main.yml`.
- **`libs/` ausente:** as bibliotecas PKCS#11 dos fabricantes não são embarcadas
  (warning tolerado). No Windows há fallback para DLLs do sistema; no macOS/Linux
  depende do middleware instalado pelo usuário.
