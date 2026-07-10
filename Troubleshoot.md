# Assinador MPES
O assinador é um serviço web executado na máquina do usuário (localhost ou  127.0.0.1), usando a porta padrão 19333 e o protocolo HTTP utilizando *locally-delivered mixed resources*. Mais detalhes em:
https://developer.mozilla.org/en-US/docs/Web/Security/Mixed_content#loading_locally_delivered_mixed-resources

## Mudando as configurações padrão
É possível alterar as configurações usando variáveis de ambiente.

# **Todos os comandos a seguir devem ser executados no powershell**

### Para mudar a porta padrão
```powershell
[System.Environment]::SetEnvironmentVariable('ASSINADOR_MPES_PORTA', '19334', 'User')
```
*São aceitas apenas as portas 19333, 19334 e 19335.*

### Para adicionar um caminho para a lib do token
```powershell
[System.Environment]::SetEnvironmentVariable('ASSINADOR_MPES_LIB_PATH', '/path/da/lib', 'User')
```

## Consultando o valor das variáveis
```powershell
[System.Environment]::GetEnvironmentVariable('ASSINADOR_MPES_PORTA')
[System.Environment]::GetEnvironmentVariable('ASSINADOR_MPES_LIB_PATH')
```

## Verificando se o serviço está sendo executado
Para validar se o assinador está em execução e acessível, basta acessar o seguinte endereço:

http://localhost:19333/health

*Lembre de mudar os valores de acordo com as configurações das variáveis*

---

## macOS: instalar/atualizar no Apple Silicon (M1/M2/M3/M4)

> Contexto de arquitetura (Rosetta, x64 vs arm64) explicado em
> [docs/diagnostico-apple-silicon.md](docs/diagnostico-apple-silicon.md#como-funciona-rosetta-arquiteturas-e-o-token-guia-do-técnico).
> Resumo: a versão nova (5.x) tem build **arm64 nativo** — no Apple Silicon use o
> `arm64-mac.dmg`, que roda **sem Rosetta**.

### Saindo de uma versão antiga (que não abre / roda por Rosetta)

1. **Feche o Assinador antigo antes de tudo.** Ele roda na barra de menus (ícone
   perto do relógio) e como serviço na porta 19333. Clique no ícone → **Sair**.
   Se não achar, abra o **Monitor de Atividade**, procure `Assinador MPES` e force
   o encerramento. (Se ficar rodando, o app novo não consegue subir na mesma porta.)
2. **Remova o app antigo:** Finder → **Aplicativos** → arraste **Assinador MPES**
   para a Lixeira. *Não é obrigatório desinstalar antes de instalar o novo (o dmg
   substitui o app), mas ajuda a evitar confusão de duas cópias.*
3. **Rosetta pode ficar instalado.** Se o técnico instalou o **Rosetta 2**, tudo
   bem — é seguro e **não precisa remover**. O app arm64 simplesmente não o usa.

### Instalando a versão nova

4. Baixe o **`assinador-<versão>-arm64-mac.dmg`** (para Apple Silicon) na página de
   releases. Abra o dmg e arraste **Assinador MPES** para **Aplicativos**.
5. **Primeira abertura:** botão direito (ou Control + clique) no app → **Abrir** →
   **Abrir**. Se disser que "está danificado", rode no Terminal e tente de novo:
   ```bash
   xattr -dr com.apple.quarantine "/Applications/Assinador MPES.app"
   ```

### Conferindo que está rodando NATIVO (sem Rosetta)

6. **Monitor de Atividade** → aba **CPU** → achar **Assinador MPES** → coluna
   **Tipo**:
   - **"Apple"** = nativo arm64 ✅ (correto no M1/M2/M3/M4)
   - **"Intel"** = está sob Rosetta. Corrija: Finder → app → **Obter Informações**
     (Cmd+I) → **desmarcar** "Abrir com o Rosetta" → reabrir.
7. Confirme o serviço: acesse **http://localhost:19333/health** — deve retornar a
   versão instalada.

### Se o token não for reconhecido no app arm64

É o ponto que depende do fabricante: um app arm64 só lê driver PKCS#11 **arm64**.
Se o fabricante do token só tiver driver **x64**, o token não aparece. Contorno
temporário: usar o **`x64-mac.dmg`** (roda sob Rosetta e carrega o driver x64) até
o fabricante liberar a versão arm64. Registrar no chamado qual token/fabricante é.
