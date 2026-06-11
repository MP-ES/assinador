import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import message from './message';

let alert = false;
log.transports.file.level = 'debug';
autoUpdater.logger = log;
autoUpdater.autoDownload = false;

autoUpdater.on('update-not-available', info => {
  log.info('update-not-available', info);
  if (alert)
    message.show({
      type: message.type.INFO,
      title: 'Atualização',
      message: 'Você está com a versão atualizada do assinador!'
    });
});
autoUpdater.on('update-available', info => {
  log.info('update-available', info);
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
  log.info('update-downloaded', info);
  setImmediate(() => autoUpdater.quitAndInstall());
});
autoUpdater.on('error', error => {
  log.error('update-error', error);
});

const start = async (interative = false) => {
  alert = interative;
  autoUpdater.checkForUpdatesAndNotify();
};

export default { start };
