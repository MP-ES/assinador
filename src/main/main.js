import { app } from 'electron';

import tray from './tray';
import updater from './updater';
import autolauncher from './autolauncher';
import server from './server';

import './config';
import './ipc';
import './mainWindow';

app.setAsDefaultProtocolClient('assinador-mpes');

// quit application when all windows are closed
app.on('window-all-closed', () => {
  // on macOS it is common for applications to stay open until the user explicitly quits
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.whenReady().then(async () => {
    tray.start(app);
    updater.start();
    autolauncher.start();
    server.start();
  });
}
