# Diagnóstico: Incompatibilidade Apple Silicon — Assinador MPES

## Problema Reportado

Usuários macOS recebem o aviso:

> "Descontinuação da compatibilidade com apps para Intel. Esta versão do app Assinador MPES não poderá ser aberta em uma versão futura do macOS. Saiba como atualizar para uma versão compatível com Apple Silicon."

## Causa Raiz

O assinador é compilado exclusivamente para **x64 (Intel)**. O Electron 9 **não suporta ARM64/Apple Silicon nativamente**.

### Evidências no código:

- `package.json` → scripts com `--x64` e `npm_config_arch=x64`
- `electron-builder.yml` → sem target arm64 para mac
- `pkcs11js` (módulo nativo) compilado apenas para x64

## Contexto Apple (fonte: [support.apple.com/pt-br/102527](https://support.apple.com/pt-br/102527))

- Em 2020, Apple migrou de Intel para Apple Silicon (ARM)
- **Rosetta** traduz automaticamente apps Intel para rodar em Apple Silicon
- Todos os Macs vendidos desde Nov/2020 são Apple Silicon
- Macs Intel não são mais vendidos desde 2022

## Timeline

| Versão macOS         | Status Rosetta                     | Impacto                   |
| -------------------- | ---------------------------------- | ------------------------- |
| macOS até 26 (atual) | Rosetta disponível                 | Funciona com aviso        |
| **macOS 27** (~2027) | Última versão com Rosetta completo | Último macOS funcional    |
| **macOS 28** (~2028) | Rosetta removido                   | **App PARA de funcionar** |

## O que é necessário para corrigir

### Pré-requisitos:

1. **Atualizar Electron** de 9 para 28+ (suporte ARM64 só existe a partir do Electron 11)
2. **Atualizar Node.js** de 14 para 20+ (suporte arm64 nativo)
3. **Recompilar `pkcs11js`** para arm64
   - Verificar se a versão atual do `graphene-pk11` suporta arm64
   - Pode exigir atualização de `graphene-pk11`
4. **Verificar bibliotecas PKCS#11 dos tokens em arm64**
   - As DYLIBs dos fabricantes (ePass2003, eToken, WDPKCS) precisam ter versão arm64
   - Sem a DYLIB arm64 do fabricante, o token NÃO funciona mesmo com app Universal
   - Isso está **FORA do controle do MPES** (depende dos fabricantes)

### Alterações no build:

- `electron-builder.yml`: adicionar `arch: [x64, arm64]` ou `arch: [universal]` para mac
- `package.json` scripts: remover `--x64` hardcoded ou usar matrix de build
- CI/CD: build separado para cada arquitetura ou build universal

## Riscos

- `pkcs11js` pode não compilar para arm64 sem patches
- Fabricantes de token podem não oferecer DYLIB arm64
- Atualizar Electron de 9 para 28+ é uma migração **MAJOR** (breaking changes em APIs)
- `nodeIntegration: true` foi deprecated — exige refatoração do renderer
- Mesmo com app atualizado, se fabricantes não liberarem drivers arm64, o token não funciona no Apple Silicon

## Urgência

- **Janela de tempo**: ~1-2 anos até o app parar de funcionar
- **Impacto**: todos os usuários macOS com Apple Silicon (M1/M2/M3/M4)

## Recomendação

| Prazo           | Ação                                                                                                                                                                   |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Curto prazo** | Informar usuários sobre a timeline (funciona até macOS 27)                                                                                                             |
| **Médio prazo** | Atualizar Electron + Node.js + build universal (resolve segurança + compatibilidade)                                                                                   |
| **Longo prazo** | Para certificados A1, mover assinatura para backend GAMPES (elimina problema de plataforma). Para A3, manter app desktop atualizado (inevitável por causa do hardware) |

---

## Como funciona: Rosetta, arquiteturas e o token (guia do técnico)

Esta seção explica o "porquê" para quem dá suporte. É a parte que mais gera
confusão nos chamados de macOS.

### Duas arquiteturas de processador

Um programa é compilado para uma **arquitetura** de CPU. No mundo Mac existem duas:

- **x64** (também chamado `x86_64` ou "Intel") — Macs vendidos até ~2020.
- **arm64** (também chamado "Apple Silicon", chips **M1/M2/M3/M4**) — Macs de
  fim de 2020 em diante.

São **linguagens de máquina diferentes**. Um app compilado só para Intel não roda
nativamente num chip Apple — e vice-versa.

### O que é o Rosetta 2

**Rosetta 2** é um tradutor da Apple que roda **apps Intel (x64) em Macs Apple
Silicon**, traduzindo as instruções em tempo real. Pontos importantes:

- É **oficial da Apple** e **seguro**. Instalar Rosetta **não "bagunça" nada** —
  muitos apps pedem essa instalação; ela só habilita rodar programas Intel. Não
  precisa desinstalar depois.
- Só existe **uma** versão relevante: "Rosetta 2". Se o técnico "instalou o Rosetta
  2", está correto — é esse mesmo.
- É uma **muleta temporária**: a Apple já anunciou a **remoção do Rosetta** (pelo
  cronograma, ~macOS 27 é o último com Rosetta completo; macOS 28 remove). Quando
  isso acontecer, **todo app só-Intel para de abrir** no Apple Silicon.

### Por que a versão antiga do Assinador dava problema

O Assinador **até a 4.x era compilado só para x64 (Intel)**. Num Mac Apple Silicon
ele **só rodava traduzido pelo Rosetta** — por isso o macOS mostrava o aviso de
"descontinuação de apps Intel". Se o Rosetta não estivesse instalado, o app Intel
simplesmente **não abria**.

### Por que a versão nova (arm64) resolve

A partir da **5.0.0** geramos um build **arm64 nativo**. Num Mac Apple Silicon ele
**roda direto no chip, sem Rosetta** → o aviso some e o app **sobrevive ao macOS
28**. Também geramos o build **x64** para Macs Intel (onde x64 é nativo).

### A regra de ouro (e a única pegadinha que sobra): o driver do token

**Um processo não mistura arquiteturas.** Um app **arm64** só consegue carregar
uma biblioteca PKCS#11 (driver do token, `.dylib`) **também arm64**. Se o
fabricante do token (ePass2003, eToken, Safenet/WDPKCS…) só distribuir driver
**x64**, o token **não é reconhecido** no app arm64 nativo — mesmo tudo estando
"certo" do lado do Assinador.

Nesse caso — **e só nesse caso** — o contorno **temporário** é rodar o app **x64
sob Rosetta** (aí o processo inteiro é x64 e carrega o driver x64). Isso volta a
depender do Rosetta e morre junto com ele. A solução definitiva depende do
**fabricante** liberar driver arm64 — **fora do controle do MPES**.

### Como o técnico confere em qual arquitetura o app está rodando

Abrir o **Monitor de Atividade** (Activity Monitor) → aba **CPU** → achar
**Assinador MPES** → coluna **Tipo** (Kind):

- **"Apple"** = rodando **nativo arm64** ✅ (é o que queremos no M1/M2/M3/M4)
- **"Intel"** = rodando **sob Rosetta** (só deveria acontecer com o build x64)

Se instalou o build arm64 mas aparece "Intel", provavelmente a opção **"Abrir com
o Rosetta"** ficou marcada: **Finder → clicar no app → Obter Informações (Cmd+I) →
desmarcar "Abrir com o Rosetta"**.

### Resumo

| Situação | Usa Rosetta? | Sobrevive ao macOS 28? |
| --- | --- | --- |
| App antigo (x64) em Apple Silicon | Sim | **Não** |
| App novo **arm64** em Apple Silicon | **Não** | **Sim** ✅ |
| App novo x64 em Mac **Intel** | Não (Intel é nativo) | Não se aplica |
| Plano B: app x64 sob Rosetta (só se driver do token for x64) | Sim | Não (provisório) |
