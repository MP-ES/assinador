import { Menu, nativeImage, Tray } from 'electron';
import path from 'path';
import updater from './updater';

let tray = null;

const start = app => {
    const image = nativeImage
        .createFromPath(path.join(__static, 'icon.png'))
        .resize({ width: 16, height: 16 });
    try {
        tray = new Tray(path.join(__static, 'icon.ico'));
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

export default {
    start
};
