import { Menu, Tray } from 'electron';

import updater from './updater';
import message from './message';
import icon from './icon';

let tray = null;

const start = app => {
  tray = new Tray(icon.get(true));
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
          message: `Assinador MPES`,
          detail: `Versão ${app.getVersion()}`
        })
    }
  ]);
  tray.setToolTip('Assinador MPES');
  tray.setContextMenu(contextMenu);
};

export default { start };
