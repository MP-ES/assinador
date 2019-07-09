import { app } from 'electron';
import splash from './splash';
import tray from './tray';
import dotnet from './dotnet';
import updater from './updater';

app.setAsDefaultProtocolClient('assinador-mpes');

app.on('window-all-closed', () => {
    app.quit();
});

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
    app.quit();
} else {
    app.on('ready', async () => {
        splash.start();
        tray.start(app);
        updater.start();
        await dotnet.start();
    });
}
