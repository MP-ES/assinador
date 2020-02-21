FROM mcr.microsoft.com/dotnet/core/sdk:3.1 AS dotnet
COPY dotnet /dotnet
WORKDIR /dotnet
RUN dotnet publish -c release -p:PublishSingleFile=true --self-contained -o ./ -r linux-x64 && \
    dotnet publish -c release -p:PublishSingleFile=true --self-contained -o ./ -r win10-x64

FROM registrydev.mpes.mp.br/infra/electronbuilder:latest
COPY electron /app
WORKDIR /app
COPY --from=dotnet dotnet/assinador release/
COPY --from=dotnet dotnet/assinador.exe release/
RUN yarn && yarn release -wl
