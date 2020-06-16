import { app, ipcMain } from 'electron';

import libManager from './libManager';
import config, { setPort } from './config';

ipcMain.handle('get-version', async () => app.getVersion());

ipcMain.handle('get-port', async () => config.port);

ipcMain.handle('get-libs', async () => config.libs);

ipcMain.handle('reload-libs', async () => libManager.reloadLibs());

ipcMain.handle('set-port', async (_event, port) => setPort(port));

ipcMain.handle('add-lib', async (_event, lib) => libManager.addLib(lib));

ipcMain.handle('remove-lib', async (_event, lib) => libManager.removeLib(lib));

ipcMain.handle('get-certificates', async (_event, lib) =>
  libManager.getCertificates(lib)
);
