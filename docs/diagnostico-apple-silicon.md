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
