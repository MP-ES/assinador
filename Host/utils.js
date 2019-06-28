const { BrowserWindow } = require('electron');
const path = require('path');

const getRootPath = () => {
    let dirs = __dirname.split(path.sep);
    const last = dirs.splice(-1, 1)[0];
    if (last !== 'app.asar') dirs.push(last);
    return dirs.join(path.sep);
};

const openWindowWithText = text => {
    const win = new BrowserWindow({
        show: false,
        closable: true
    });
    win.loadURL(`data:text/html;charset=UTF-8,${encodeURIComponent(text)}`);
    win.once('ready-to-show', () => {
        win.show();
    });
};

const openWindowWithUrl = url => {
    const win = new BrowserWindow({
        width: 600,
        height: 600,
        transparent: true,
        show: false,
        closable: true,
        title: 'Helper',
        webPreferences: {
            nodeIntegration: false,
            preload: path.join(__dirname, 'preload.js')
        }
    });
    win.loadURL(url);
    win.once('ready-to-show', () => {
        win.show();
    });
};

module.exports = {
    getRoot: getRootPath,
    showText: openWindowWithText,
    showUrl: openWindowWithUrl
};
