# Assinador MPES

Aplicação desktop que assina digitalmente documentos do sistema **GAMPES** usando
tokens de hardware (certificados A3, ICP-Brasil). Roda na bandeja do sistema e
sobe um servidor local (`http://localhost:19333`) que o GAMPES consome no browser.

> Documentação técnica: `CLAUDE.md` (arquitetura), `docs/build-e-distribuicao.md`
> (build/release), `docs/diagnostico-apple-silicon.md` (por que o macOS precisou
> ser atualizado), `Troubleshoot.md`.

---

## Baixar e instalar (usuário / testador)

### 1. Onde baixar

- **Release oficial:** aba **Releases** do repositório
  (https://github.com/MP-ES/assinador/releases) — pegue a versão mais recente.
- **Build de teste (ainda sem release):** aba **Actions** → execução mais recente
  do workflow **"Build and Release"** → seção **Artifacts** no fim da página.
  Baixe `assinador-windows-latest` (Windows) ou `assinador-macos-latest` (macOS).
  O artifact vem como `.zip`; descompacte para achar o instalador.

### 2. Escolha o arquivo certo para a sua máquina

| Sistema | Arquitetura | Arquivo a baixar |
| --- | --- | --- |
| **Windows** 64-bit (padrão) | x64 | `assinador-<versão>-x64-win.exe` |
| **Windows** 32-bit (antigo) | ia32 | `assinador-<versão>-ia32-win.exe` |
| **macOS** com chip **Apple** (M1/M2/M3/M4) | arm64 | `assinador-<versão>-arm64-mac.dmg` |
| **macOS** com chip **Intel** | x64 | `assinador-<versão>-x64-mac.dmg` |

**Como saber se o Mac é Apple Silicon ou Intel:** menu Apple () →
**Sobre este Mac**. Se aparecer **"Chip Apple M…"** é Apple Silicon (baixe o
**arm64**); se aparecer **"Processador Intel"** é Intel (baixe o **x64**).

> Instalar o arquivo da arquitetura errada faz o app rodar traduzido (Rosetta) ou
> nem abrir. Em Mac Apple Silicon, use sempre o **arm64** para evitar o aviso de
> descontinuação da Apple.

### 3. Instalar

- **Windows:** execute o `.exe` — instala e já abre (o app fica na **bandeja**,
  perto do relógio, não abre janela).
- **macOS:** abra o `.dmg` e arraste o **Assinador MPES** para **Applications**.

#### ⚠️ macOS: build não assinado (teste)

As versões de teste **não** têm assinatura Apple (Developer ID), então o macOS
bloqueia na primeira abertura ("app está danificado" / "desenvolvedor não
verificado"). Para liberar, rode no Terminal:

```bash
xattr -dr com.apple.quarantine "/Applications/Assinador MPES.app"
```

Ou clique com o **botão direito** no app → **Abrir** → **Abrir**. Isso é aceitável
para teste; para distribuição ampla é preciso assinar/notarizar com Developer ID.

### 4. Conferir que subiu

Com o app aberto, acesse `http://localhost:19333/health` no navegador — deve
retornar `{"version":"<versão>"}`. Para listar os certificados do token:
`http://localhost:19333/api/tokens`.

> **Token no macOS Apple Silicon:** o app nativo arm64 só lê o token se o
> fabricante (ePass2003, eToken, WDPKCS…) tiver o middleware/driver **arm64**
> instalado. Sem ele, o token não aparece mesmo com o app correto — nesse caso o
> contorno é usar o `.dmg` **x64** sob Rosetta. Isso depende do fabricante.

---

## Desenvolvimento

Stack atual: **Electron 33 + electron-vite + React 18 + Node 22**. Não é mais
necessário `windows-build-tools` nem `cross-env` (stack antigo).

Pré-requisitos: **Node 22** (ver `.nvmrc`) e o toolchain de compilação nativa do
SO (necessário porque o `postinstall` recompila o módulo nativo `pkcs11js` para o
Electron alvo).

```bash
npm install     # instala deps e recompila o módulo nativo (postinstall)
npm start       # dev com hot reload (electron-vite dev)
npm run build   # build de produção → dist/{main,preload,renderer}
npm run lint    # ESLint (único gate de CI em PRs)
```

Geração de instaladores e publicação de release: ver
**`docs/build-e-distribuicao.md`**.
