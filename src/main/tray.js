import { app, Menu, nativeImage, Tray } from 'electron';
import path from 'path';
import updater from './updater';
import message from './message';
import platform from './models/platform';
import * as mainWindow from './mainWindow';

let tray = null;

const getIcon = (resize = false) => {
  if (platform.current === platform.options.windows)
    return path.join(__static, 'icon.ico');
  else {
    const image = nativeImage.createFromPath(path.join(__static, 'icon.png'));
    if (resize) return image.resize({ width: 16, height: 16 });
    return image;
  }
};

const start = () => {
  tray = new Tray(getIcon(true));
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Sair',
      click: () => {
        app.isQuitting = true;
        app.quit();
      }
    },
    {
      label: 'Atualizar',
      click: () => updater.start(true)
    },
    {
      label: 'Configurar',
      click: () => mainWindow.show()
    },
    {
      label: 'Sobre',
      click: () =>
        message.show({
          type: message.type.INFO,
          icon: getIcon(),
          message: `Assinador MPES`,
          detail: `Versão ${app.getVersion()}`
        })
    }
  ]);
  tray.setToolTip('Assinador MPES');
  tray.setContextMenu(contextMenu);
};

export default { start };
