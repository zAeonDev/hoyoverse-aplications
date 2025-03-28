# HoYoverse Aplications

HoYoverse Aplications tem a finalidade de facilitar o acesso a informações sobre os seguintes jogos: Genshin Impact, Honkai: Star Rail e Zenless Zone Zero.

**índice**
* [Download]()
* [Versões]()
* [Criador]()
* [Licença]()

* [Área do Desenvolvedor]()
* [Dependências]()
* [Configuração do package.json]()
* [Comandos]()

## Download

Você pode baixar o aplicativo [clicando aqui](https://github.com/zAeonDev/hoyoverse-aplications/releases)!

* Escolha a opção com o final **.exe** para instalar por um instalador!

## Versões

Veja as [tags neste repositório](https://github.com/zAeonDev/hoyoverse-aplications/tags) para ver as versões disponíveis!

## Criador

* **Aeon** - *Trabalho inicial.*
* **Quer entrar em contato? Me envie uma mensagem no Discord: @zaeon_**

## Licença

Este projeto é licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## Área do Desenvolvedor

### Dependências:
```
npm install electron --save-dev
```
```
npm install electron-builder --save-dev
```
```
npm install dotenv-cli --save-dev
```
```
npm install @ghostery/adblocker-electron
```
```
npm install cross-fetch
```
```
npm install electron-updater
```

### Configuração do package.json
* **Comando para criar um arquivo package.json**
```
npm init -y
```
* **Código do package.json** - *Obs: ás versões das dependências são apenas simbólicas e podem mudar.*
```
{
  "name": "nome-do-app",
  "version": "1.0.0",
  "description": "Descrição do App",
  "main": "main.js",
  "scripts": {
    "start": "electron .",
    "pack": "electron-builder --dir",
    "dist": "electron-builder",
    "publish": "dotenv -e .env -- electron-builder --publish=always"
  },
  "author": "Seu Nome",
  "license": "MIT",
  "devDependencies": {
    "dotenv-cli": "^8.0.0",
    "electron": "^35.0.3",
    "electron-builder": "^25.1.8"
  },
  "build": {
    "asar": true,
    "appId": "nome-do-app",
    "productName": "Nome do App",
    "directories": {
      "output": "dist"
    },
    "files": [
      "main.js",
      "package.json",
      "icon.ico",
      "src/**/*"
    ],
    "win": {
      "target": "nsis",
      "icon": "build/icon.ico"
    },
    "publish": [
      {
        "provider": "github",
        "owner": "seu nome de usuário do github",
        "repo": "nome-do-seu-respositório"
      }
    ]
  },
  "dependencies": {
    "@ghostery/adblocker-electron": "^2.5.0",
    "cross-fetch": "^4.1.0",
    "electron-updater": "^6.3.9"
  }
}
```

### Comandos:
* **inicia a depuração**
```
npm start
```
* **Compila o programa**
```
npm run dist
```
* **Publica a atualização do programa no GitHub**
```
npm rum publish
```
