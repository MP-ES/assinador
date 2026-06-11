# Análise Técnica Completa — Assinador Digital MPES (GAMPES)

---

## 1. Resumo Arquitetural

O assinador é uma **aplicação desktop Electron** (v9.0) que funciona como um **servidor HTTP local** na máquina do usuário, escutando na porta `19333`. Ele expõe uma API REST minimalista que o sistema GAMPES consome via browser (localhost).

**Conceito central**: O assinador **NÃO** gera PDFs, **NÃO** monta pacotes CAdES/PAdES e **NÃO** faz upload ao PJe. Ele atua exclusivamente como um **oráculo criptográfico local** — recebe um hash, assina com a chave privada do token PKCS#11 e devolve a assinatura bruta + certificados.

### Componentes principais:

| Componente    | Responsabilidade                                           |
| ------------- | ---------------------------------------------------------- |
| `server/`     | Servidor HTTP local com CORS aberto (`*`)                  |
| `libManager/` | Detecção, carregamento e interação com bibliotecas PKCS#11 |
| `renderer/`   | Interface de configuração (porta, bibliotecas, modo dev)   |
| `main.js`     | Inicialização Electron, tray, auto-updater, auto-launch    |

### Stack tecnológica:

- **Runtime**: Electron 9.0 / Node.js 14
- **Criptografia**: `graphene-pk11` v2.1.7 (binding Node.js para PKCS#11)
- **Parsing X.509**: `asn1.js-rfc5280` v3.0.0
- **Build**: electron-webpack + electron-builder
- **UI**: React 16 + Chakra UI
- **Distribuição**: NSIS (Windows), RPM (Linux)

---

## 2. Fluxo Completo da Assinatura

### Diagrama geral:

```
┌─────────────┐         ┌──────────────────────┐         ┌─────────────┐
│   GAMPES    │──HTTP──►│  Assinador Desktop    │◄───────►│ Token A3    │
│  (Browser)  │         │  (localhost:19333)    │ PKCS#11 │ (Hardware)  │
│             │◄─JSON───│                       │         │             │
└─────────────┘         └──────────────────────┘         └─────────────┘
      │
      │  GET /api/tokens → lista certificados do token
      │  POST /api/sign  → envia hash, recebe assinatura
      │
      ▼
┌─────────────┐
│ GAMPES Back │  ← Monta PDF/CAdES com a assinatura retornada
│  (Servidor) │  ← Envia ao PJe
└─────────────┘
```

### 2.1 Listagem de certificados (`GET /api/tokens`)

1. **GAMPES** faz `GET /api/tokens`
2. **Assinador** itera sobre as bibliotecas PKCS#11 configuradas em `config.libs`
3. Para cada biblioteca:
   - Carrega o módulo PKCS#11 via `graphene.Module.load(lib)`
   - Inicializa o módulo
   - Abre cada slot disponível
   - Busca objetos do tipo `CERTIFICATE` (X.509)
   - Decodifica com `asn1.js-rfc5280` para extrair:
     - `subjectAlternativeName` (valida se é ICP-Brasil)
     - Datas de validade (`notBefore`/`notAfter`)
     - Label e ID do certificado
4. **Retorna** array JSON com:
   ```json
   {
     "id": "<hex do ID PKCS#11>",
     "displayName": "<label> <data expiracao>",
     "valid": true/false,
     "libraryPath": "<caminho da DLL/SO>",
     "slotId": "<numero do slot>"
   }
   ```

### 2.2 Assinatura (`POST /api/sign`)

1. **GAMPES** faz `POST /api/sign` com body:
   ```json
   {
     "token": {
       "password": "<PIN do token>",
       "libraryPath": "<caminho da lib PKCS#11>",
       "slotId": "<id do slot>",
       "id": "<id hex do certificado>"
     },
     "hash": "<hash base64 do documento>",
     "algoritmoHash": "<algoritmo>",
     "esquemaAssinatura": "<esquema>"
   }
   ```
2. **Validação** via `yup` (campos obrigatórios)
3. **Processo criptográfico** em `signer.js`:
   - `graphene.Module.load(lib)` → carrega DLL/SO do token
   - `mod.initialize()` → inicializa PKCS#11
   - `slot.open()` → abre sessão no slot
   - `session.login(password)` → autentica com PIN
   - `session.find({class: PRIVATE_KEY, id: certId})` → localiza chave privada
   - `session.createSign(SHA256_RSA_PKCS, key)` → cria operação de assinatura
   - `sign.update(hash)` + `sign.final()` → executa assinatura
   - Busca certificados X.509 do token
   - `session.logout()` / `session.close()`
4. **Retorna**:
   ```json
   {
     "assinatura": "<base64>",
     "signCertificate": "<base64 do cert usado>",
     "otherCertificates": ["<base64>", "..."]
   }
   ```

### 2.3 O que o GAMPES faz (fora do assinador):

- Gera o hash do documento/PDF
- Envia hash ao assinador
- Recebe assinatura bruta + certificados
- Monta o envelope CAdES/PAdES
- Embute a assinatura no PDF
- Envia ao PJe

**O assinador é agnóstico ao formato do documento** — ele só assina hashes.

---

## 3. Dependências Encontradas

### Dependências críticas de runtime:

| Biblioteca         | Versão  | Função                                             |
| ------------------ | ------- | -------------------------------------------------- |
| `graphene-pk11`    | 2.1.7   | **Core** — binding PKCS#11 (usa `pkcs11js` nativo) |
| `asn1.js-rfc5280`  | 3.0.0   | Parsing de certificados X.509 DER                  |
| `electron`         | 9.0.0   | Runtime desktop                                    |
| `electron-updater` | 4.3.1   | Auto-atualização via GitHub Releases               |
| `auto-launch`      | 5.0.5   | Inicialização automática com o Windows             |
| `yup`              | 0.29.0  | Validação do body das requisições                  |
| `moment`           | 2.26.0  | Manipulação de datas de validade                   |
| `lodash`           | 4.17.19 | Utilitários (get, isEmpty, sortBy)                 |

### Dependências nativas:

- **`pkcs11js`** (dependência indireta de `graphene-pk11`) — módulo nativo C++ que faz o binding real com a API PKCS#11
- Requer **node-gyp** + compilação nativa para cada versão do Electron
- O `postinstall` script recompila `pkcs11js` para Electron 9.0.0

### Dependências externas (não-npm):

| Dependência                        | Tipo         | Obrigatória |
| ---------------------------------- | ------------ | ----------- |
| Driver/Biblioteca PKCS#11 do token | DLL/SO/DYLIB | **SIM**     |
| Token físico (smartcard/USB)       | Hardware     | **SIM**     |
| Middleware do fabricante do token  | Software     | **SIM**     |

### Bibliotecas PKCS#11 mapeadas (`libraries.js`):

**Windows**: ePass2003, eToken, OpenSC, AET, GCLIB, PK2PRIV, W32PK2IG, NGP11V211, ACOSPKCS11, DKCK201, DKCK232, CRYPTOKI22, ACPKCS, SLBCK, CMP11, WDPKCS

**macOS**: ePass2003, eToken, WDPKCS

**Linux**: ePass2003, eToken, OpenSC, AETUNX, CMP11, WDPKCS, GPKCS11, EPSNG

---

## 4. Pontos Acoplados ao A3

### Acoplamento TOTAL ao PKCS#11/hardware:

| Arquivo                 | Acoplamento                                                                                   | Severidade  |
| ----------------------- | --------------------------------------------------------------------------------------------- | ----------- |
| `signer.js`             | `graphene.Module.load(lib)`, `slot.open()`, `session.login(PIN)`, `session.find(PRIVATE_KEY)` | **CRÍTICO** |
| `getCertificates.js`    | `graphene.Module.load(lib)`, iteração de slots, busca de certificados via PKCS#11             | **CRÍTICO** |
| `tryLoad.js`            | `graphene.Module.load(lib)`, `mod.initialize()`, `mod.getSlots()`                             | **ALTO**    |
| `index.js` (libManager) | `identify()` busca DLLs de tokens conhecidos                                                  | **ALTO**    |
| `libraries.js`          | Mapa hardcoded de DLLs de tokens por SO                                                       | **ALTO**    |
| `sign.js` (rota)        | Schema de validação exige `libraryPath`, `slotId`                                             | **MÉDIO**   |
| `tokens.js` (rota)      | Itera `config.libs` (paths de DLLs)                                                           | **MÉDIO**   |

### Parâmetros que assumem A3:

- `token.libraryPath` — caminho para DLL PKCS#11
- `token.slotId` — slot do leitor de smartcard
- `token.password` — PIN do token (não senha de arquivo)
- `token.id` — ID do objeto PKCS#11 (buffer hex)

### Mecanismo criptográfico hardcoded:

```javascript
graphene.MechanismEnum.SHA256_RSA_PKCS;
```

Fixado em RSA com SHA-256. Não suporta ECDSA ou outros algoritmos sem alteração.

---

## 5. Viabilidade de A1

### 5.1 O que JÁ funcionaria hoje:

- **Nada**. O código atual não tem nenhum code path para certificados A1. Todo o fluxo é 100% PKCS#11.

### 5.2 O que NÃO funciona para A1:

| Aspecto                     | Motivo                                               |
| --------------------------- | ---------------------------------------------------- |
| Carregamento do certificado | Usa `graphene.Module.load(DLL)` — impossível com PFX |
| Acesso à chave privada      | Usa `session.find(PRIVATE_KEY)` via PKCS#11          |
| Autenticação                | Usa `session.login(PIN)` — A1 usa senha do arquivo   |
| Listagem de slots           | `mod.getSlots()` — A1 não tem slots                  |
| Assinatura                  | `session.createSign()` — API PKCS#11 exclusiva       |

### 5.3 O que precisaria ser alterado para A1:

1. **Novo módulo de carregamento de certificado A1**:
   - Ler arquivo PFX/P12
   - Descriptografar com senha
   - Extrair chave privada + cadeia de certificados

2. **Novo módulo de assinatura para A1**:
   - Usar `crypto` nativo do Node.js (`crypto.createSign()`)
   - Ou biblioteca como `node-forge` / `@peculiar/x509`

3. **Nova rota ou adaptação da rota existente**:
   - O schema de validação precisa aceitar `pfxPath` ou `pfxBuffer` + `password` (sem `libraryPath`/`slotId`)

4. **Nova rota de listagem de certificados A1**:
   - Ler certificados de um diretório configurado ou receber via upload

5. **Mudança na interface do GAMPES**:
   - Diferenciar entre token A3 e arquivo A1 na seleção

### 5.4 Partes que assumem obrigatoriamente A3:

- **100% do `libManager/`** — todo o diretório
- **Rota `/api/sign`** — schema e invocação do signer
- **Rota `/api/tokens`** — depende de `config.libs` (DLLs)
- **Interface `Config.js`** — gerencia bibliotecas PKCS#11

### 5.5 APIs incompatíveis com A1:

- `graphene-pk11` — **totalmente incompatível** com A1
- `pkcs11js` — idem
- A assinatura em si (hash → sign) poderia usar `crypto.createSign('RSA-SHA256')` do Node.js nativo para A1

### 5.6 Dependência de hardware:

**FORTE**. O fluxo inteiro pressupõe:

1. Token físico inserido
2. Driver instalado
3. Biblioteca PKCS#11 presente no filesystem
4. Slot acessível

### 5.7 A1 no macOS:

**SIM**, seria possível. Como A1 não depende de hardware nem drivers, funcionaria em qualquer SO com Node.js. O `crypto` nativo do Node.js suporta PFX/P12 em todas as plataformas.

### 5.8 Assinatura no backend (sem app desktop):

**SIM**, é a abordagem mais natural para A1:

- O certificado A1 é um arquivo — pode ficar no servidor
- A chave privada é acessível via software
- `crypto.createSign()` funciona em qualquer Node.js server-side
- Eliminaria a necessidade do Electron completamente para A1
- O GAMPES backend poderia assinar diretamente

### 5.9 Certificado em nuvem (futuro):

**POSSÍVEL**, mas requer adaptação:

- Provedores como VIDAAS, BirdID, RemoteID expõem APIs REST
- O backend GAMPES chamaria a API do provedor
- O fluxo seria: GAMPES → API do provedor → assinatura retornada
- Independente do assinador desktop atual

---

## 6. Complexidade da Mudança

### Para suportar A1 no assinador atual: **MÉDIA-ALTA**

**Justificativa**:

- Requer criar módulo paralelo ao `libManager` inteiro
- O schema de validação, rotas e interface precisam ser adaptados
- O `graphene-pk11` é uma dependência nativa que dificulta o build
- O Electron 9 está extremamente desatualizado (2020)
- O Node.js 14 está em EOL desde abril/2023
- Adaptar um app desktop para algo que não precisa de hardware é over-engineering

### Para assinar A1 no backend do GAMPES: **BAIXA-MÉDIA**

**Justificativa**:

- Poucas dependências: `crypto` nativo ou `node-forge`
- Sem Electron, sem build nativo, sem driver
- O GAMPES já computa o hash e monta o PDF — faltaria só o `crypto.sign()`
- Deploy simples (servidor)

---

## 7. Recomendação Técnica

### Decisão: **NÃO adaptar o assinador atual para A1. Implementar A1 diretamente no backend do GAMPES.**

### Comparativo:

| Critério             | Adaptar assinador            | Backend GAMPES                               |
| -------------------- | ---------------------------- | -------------------------------------------- |
| Complexidade         | Média-Alta                   | Baixa-Média                                  |
| Manutenibilidade     | Ruim (Electron antigo)       | Boa                                          |
| Disponibilidade      | Requer app desktop instalado | Sempre disponível                            |
| Cross-platform       | Sim, mas desnecessário       | N/A (servidor)                               |
| Segurança            | Chave no desktop do usuário  | Chave no servidor (atenção ao armazenamento) |
| Cloud-ready          | Não                          | Sim                                          |
| Mobile-friendly      | Não                          | Sim                                          |
| Futuro (cert. nuvem) | Requer novo módulo           | Extensão natural                             |

### Riscos:

1. **Segurança do armazenamento da chave A1 no servidor**: Requer HSM ou vault adequado. O PFX com senha no filesystem é aceitável mas não ideal.
2. **Responsabilidade legal**: Quem custodia a chave pode ter implicações jurídicas. Verificar com jurídico.
3. **Migração**: O GAMPES já sabe falar com o assinador local. Para A1 no backend, a integração muda (não precisa mais do localhost).

### Ganhos:

- Elimina dependência de instalação desktop para A1
- Funciona em mobile/tablet
- Simplifica suporte (sem "meu token não é reconhecido")
- Caminho natural para certificados em nuvem
- Manutenção centralizada no servidor

### Impactos futuros:

- O assinador desktop **continua necessário para A3** (tokens físicos PRECISAM de acesso local ao hardware)
- A arquitetura ideal é **dual**: A3 via assinador local + A1/nuvem via backend
- O assinador atual tem débito técnico significativo (Electron 9, Node 14, dependências desatualizadas) mas não precisa ser reescrito se continuar só atendendo A3

---

## 8. Débitos Técnicos Identificados

1. **Electron 9.0** — 6 anos desatualizado, sem patches de segurança
2. **Node.js 14** — EOL desde abril/2023
3. **`nodeIntegration: true`** no renderer — vulnerabilidade de segurança crítica (XSS → RCE)
4. **CORS `*`** no servidor — qualquer site pode chamar a API do assinador
5. **HTTP sem autenticação** — qualquer processo local pode assinar documentos
6. **PIN trafega em plaintext** no body HTTP (localhost, mas ainda assim)
7. **Mecanismo hardcoded** (SHA256_RSA_PKCS) — sem suporte a ECDSA
8. **Sem rate-limiting** — possível abuso
9. **`algoritmoHash` e `esquemaAssinatura`** são recebidos mas **ignorados** no código (apenas SHA256_RSA_PKCS é usado)
10. **Build apenas x64 (Intel)** — incompatível com Apple Silicon nativo (ver diagnóstico separado)

---

## 9. Limitações por Plataforma

| Plataforma          | Status                     | Limitações                      |
| ------------------- | -------------------------- | ------------------------------- |
| Windows x64         | ✅ Funcional               | Depende de drivers dos tokens   |
| Linux x64           | ✅ Funcional (RPM)         | Depende de libs .so dos tokens  |
| macOS Intel         | ✅ Funcional               | Depende de .dylib dos tokens    |
| macOS Apple Silicon | ⚠️ Via Rosetta (com aviso) | Parará de funcionar no macOS 28 |
| Mobile/Tablet       | ❌ Impossível              | Arquitetura desktop-only        |
| Cloud/Serverless    | ❌ Impossível              | Depende de hardware local       |
