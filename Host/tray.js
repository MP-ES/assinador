const { Menu, nativeImage, Tray } = require('electron');
const path = require('path');
const updater = require('./updater');

let tray = null;

const start = app => {
    const image = nativeImage
        .createFromPath(path.join(__dirname, 'icon.png'))
        .resize({ width: 16, height: 16 });
    try {
        tray = new Tray(path.join(__dirname, 'icon.ico'));
    } catch {
        tray = new Tray(image);
    }
    const contextMenu = Menu.buildFromTemplate([
        {
            label: 'Sair',
            click() {
                console.log('Sair clicked');
                app.quit();
            }
        },
        {
            label: 'Atualizar',
            click() {
                updater.start(true);
            }
        }
    ]);
    tray.setToolTip('Assinador MPES');
    tray.setContextMenu(contextMenu);
};

module.exports = {
    start
};
