import { app } from 'electron';
import tray from './tray';
import updater from './updater';
import autolauncher from './autolauncher';
import server from './server';
import libManager from './libManager';

app.setAsDefaultProtocolClient('assinador-mpes');

app.on('window-all-closed', () => {
  app.quit();
});

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('ready', async () => {
    libManager.identify();
    tray.start(app);
    updater.start();
    autolauncher.start();
    server.start();
  });
}
