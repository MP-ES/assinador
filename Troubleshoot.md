# Assinador MPES
O assinador é um serviço web executado na máquina do usuário (localhost ou  127.0.0.1), usando a porta padrão 19333 e o protocolo HTTPS.

## Mudando as configurações padrão
É possível alterar as configurações usando variáveis de ambiente.

# **Todos os comandos a seguir devem ser executados no powershell**

### Para mudar a porta padrão
```powershell
[System.Environment]::SetEnvironmentVariable('ASSINADOR_MPES_PORTA', '19334', 'User')
```
*São aceitas apenas as portas 19333, 19334 e 19335.*

### Para mudar o a versão do protocolo para HTTPS
```powershell
[System.Environment]::SetEnvironmentVariable('ASSINADOR_MPES_HTTP_VERSAO', '3', 'User')
```
#### *Valores aceitos:*
- 1: Http1;
- 3: Http2 depois Http1;
- -1: Nenhum;
- padrão: Http2.

### Para mudar o protocolo para HTTP
```powershell
[System.Environment]::SetEnvironmentVariable('ASSINADOR_MPES_HTTP', 'true', 'User')
```
*O sistema Gampes não funciona com o protocolo HTTP.*

*Esse procedimento serve apenas para solução de erros.*

## Consultando o valor das variáveis
```powershell
[System.Environment]::GetEnvironmentVariable('ASSINADOR_MPES_PORTA')
[System.Environment]::GetEnvironmentVariable('ASSINADOR_MPES_HTTP_VERSAO')
[System.Environment]::GetEnvironmentVariable('ASSINADOR_MPES_HTTP')
```

## Verificando se o serviço está sendo executado
Para validar se o assinador está em execução e acessível, basta acessar o seguinte endereço:

https://localhost:19333/health

*Lembre de mudar os valores de acordo com as configurações das variáveis*


## Executando o assinador 
Para fins de solução de problemas é possível executar o serviço do assinador e validar as saídas.
```powershell
~\AppData\Local\Programs\assinador.mpes\resources\static\bin\assinador.exe

# [output esperado]:
#
# info: Microsoft.Hosting.Lifetime[0]
#       Now listening on: https://127.0.0.1:19333
# info: Microsoft.Hosting.Lifetime[0]
#       Application started. Press Ctrl+C to shut down.
# info: Microsoft.Hosting.Lifetime[0]
#       Hosting environment: Production
# info: Microsoft.Hosting.Lifetime[0]
#       Content root path: C:\Users\[usuario]\AppData\Local\Programs\assinador.mpes\resources\static\bin
```