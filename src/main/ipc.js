import { app, ipcMain, dialog } from 'electron';

import libManager from './libManager';
import config, { setPort, setDevMode } from './config';
import platform from './models/platform';

function getFileFilter() {
  switch (platform.current) {
    case platform.options.linux:
      return [{ name: 'libraries', extensions: ['*'] }];
    case platform.options.windows:
      return [{ name: 'DLLs', extensions: ['dll'] }];
    case platform.options.mac:
      return [{ name: 'libraries', extensions: ['dylib'] }];
    default:
      return [{ name: 'Bibliotecas', extensions: ['*'] }];
  }
}
const fileFilter = getFileFilter();

ipcMain.handle('get-version', async () => app.getVersion());

ipcMain.handle('get-port', async () => config.port);

ipcMain.handle('get-libs', async () => config.libs);

ipcMain.handle('get-dev-mode', async () => config.devMode);

ipcMain.handle('reload-libs', async () => libManager.reloadLibs());

ipcMain.handle('set-port', async (_event, port) => setPort(port));

ipcMain.handle('set-dev-mode', async (_event, devMode) => setDevMode(devMode));

ipcMain.handle('add-lib', async () => {
  const [result] = dialog.showOpenDialogSync(null, {
    title: 'Escolha a nova biblioteca',
    filters: fileFilter,
    properties: ['openFile'],
    buttonLabel: 'Selecionar'
  });
  return libManager.addLib(result);
});

ipcMain.handle('remove-lib', async (_event, lib) => libManager.removeLib(lib));

ipcMain.handle('get-certificates', async (_event, lib) =>
  libManager.getCertificates(lib)
);
