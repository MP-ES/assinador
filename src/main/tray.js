/* global __static */
import { Menu, nativeImage, Tray } from 'electron';
import os from 'os';
import path from 'path';
import updater from './updater';
import message from './message';
import platform from './models/platform';

let tray = null;
const osPlatform = os.platform();

const getIcon = (resize = false) => {
  if (osPlatform === platform.windows) return path.join(__static, 'icon.ico');
  else {
    const image = nativeImage.createFromPath(path.join(__static, 'icon.png'));
    if (resize) return image.resize({ width: 16, height: 16 });
    return image;
  }
};

const start = app => {
  tray = new Tray(getIcon(true));
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Sair',
      click: () => app.quit()
    },
    {
      label: 'Atualizar',
      click: () => updater.start(true)
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
