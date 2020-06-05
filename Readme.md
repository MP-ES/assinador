# Preparing

## windows
1. Install build tools:

    `npm install --global --production windows-build-tools`

2. download and install VCC Compiler:

    https://www.microsoft.com/en-in/download/details.aspx?id=48159

3. Set compiler version:

    `npm config set msvs_version 2015 --global`

4. Install cross-env global:
   
   `npm i -g cross-env`


source:
https://stackoverflow.com/questions/34335043/troubles-with-npm-and-node-gyp-in-windows

## linux
1. Install cross-env global:
   
   `npm i -g cross-env`

# CI

https://github.com/electron-userland/electron-builder/issues/871#issuecomment-258193778