import { app, BrowserWindow, nativeImage } from 'electron';
import { format as formatUrl } from 'url';
import path from 'path';

import platform from './models/platform';

const isDevelopment = process.env.NODE_ENV !== 'production';

const getIcon = (resize = false) => {
  if (platform.current === platform.options.windows)
    return path.join(__static, 'icon.ico');
  else {
    const image = nativeImage.createFromPath(path.join(__static, 'icon.png'));
    if (resize) return image.resize({ width: 16, height: 16 });
    return image;
  }
};

// global reference to mainWindow (necessary to prevent window from being garbage collected)
let mainWindow;

function createMainWindow() {
  const window = new BrowserWindow({
    width: 600,
    height: 600,
    center: true,
    minimizable: false,
    maximizable: false,
    resizable: false,
    show: false,
    // skipTaskbar: true,
    title: 'Configurações',
    icon: getIcon(),
    webPreferences: {
      nodeIntegration: true
    }
  });

  if (isDevelopment) {
    window.loadURL(`http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}`);
  } else {
    window.setMenu(null);
    window.loadURL(
      formatUrl({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file',
        slashes: true
      })
    );
  }

  window.on('close', event => {
    if (!app.isQuitting) {
      event.preventDefault();
      mainWindow.hide();
    }
    return false;
  });

  window.on('closed', () => {
    mainWindow = null;
  });

  window.webContents.on('devtools-opened', () => {
    window.focus();
    setImmediate(() => {
      window.focus();
    });
  });

  return window;
}

// quit application when all windows are closed
app.on('window-all-closed', () => {
  // on macOS it is common for applications to stay open until the user explicitly quits
  if (platform.currentPlatform !== platform.options.mac) {
    app.quit();
  }
});

app.on('activate', () => {
  // on macOS it is common to re-create a window even after all windows have been closed
  if (mainWindow === null) mainWindow = createMainWindow();
});

// create main BrowserWindow when electron is ready
app.on('ready', () => {
  mainWindow = createMainWindow();
});

export function show() {
  mainWindow.show();
}
