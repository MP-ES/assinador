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
