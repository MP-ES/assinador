import { autoUpdater } from 'electron-updater';
import logger from 'electron-log';
import message from './message';

let alert = false;
logger.transports.file.level = 'debug';
autoUpdater.logger = logger;
autoUpdater.autoDownload = false;

// autoUpdater.on('checking-for-update', () => {});
autoUpdater.on('update-not-available', info => {
  console.log('update-not-available');
  console.log(info);
  if (alert)
    message.show({
      type: message.type.INFO,
      title: 'Atualização',
      message: 'Você está com a versão atualizada do assinador!'
    });
});
autoUpdater.on('update-available', info => {
  console.log('update-available');
  console.log(info);
  message.show(
    {
      type: message.type.INFO,
      title: 'Atualização',
      message:
        'Existe uma versão atualizada do assinador, ela será instalada agora!'
    },
    () => autoUpdater.downloadUpdate()
  );
});
autoUpdater.on('update-downloaded', info => {
  console.log('update-downloaded');
  console.log(info);
  setImmediate(() => autoUpdater.quitAndInstall());
});
autoUpdater.on('error', error => {
  console.log('update-error');
  console.log(error);
});

const start = async (interative = false) => {
  alert = interative;
  autoUpdater.checkForUpdatesAndNotify();
};

export default { start };
