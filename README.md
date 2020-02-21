
# Projeto

Assinado MP-ES

## Comandos básicos

Para criar novos instaladores na pasta ./installer:

``` sh
docker build . -f build.Dockerfile -t assinador
docker create -it --name stash assinador bash
docker cp stash:/app/installer .
docker rm stash
```
