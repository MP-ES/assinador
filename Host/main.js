const { app } = require('electron');
const { start: startSplash } = require('./splash');
const { start: startTray } = require('./tray');
const { start: startDotnet } = require('./dotnet');
const { start: startUpdate } = require('./updater');

app.setAsDefaultProtocolClient('assinador-mpes');

app.on('window-all-closed', () => {
    app.quit();
});

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
    app.quit();
} else {
    app.on('ready', async () => {
        startSplash();
        startTray(app);
        startUpdate();
        await startDotnet();
    });
}
