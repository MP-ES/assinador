const { BrowserWindow } = require('electron');

let splashScreen = null;

const getWindow = () => splashScreen;

const showSplash = () => {
    splashScreen = new BrowserWindow({
        width: 800,
        height: 600,
        show: true,
        title: 'Assinador MPES',
        resizable: false,
        movable: false,
        center: true,
        minimizable: false,
        maximizable: false,
        alwaysOnTop: false,
        fullscreenable: false,
        frame: false
    });
    splashScreen.loadFile('splash.html');
    splashScreen.once('ready-to-show', () => {
        splashScreen.show();
        splashScreen.focus();
    });
    splashScreen.on('closed', () => (splashScreen = null));
};

module.exports = {
    getWindow: getWindow,
    start: showSplash
};
