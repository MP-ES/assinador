import { autoUpdater } from 'electron-updater';
import message from './message';

let alert = false;
autoUpdater.autoDownload = false;

// autoUpdater.on('checking-for-update', () => {});
autoUpdater.on('update-not-available', () => {
  if (alert)
    message.show({
      type: message.type.INFO,
      title: 'Atualização',
      message: 'Você está com a versão atualizada do assinador!'
    });
});
autoUpdater.on('update-available', () => {
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
  setImmediate(() => autoUpdater.quitAndInstall());
});
// autoUpdater.on('error', err => {
//     dialog.showMessageBox({
//         type: 'error',
//         title: 'Erro na atualização',
//         message: JSON.stringify(err, null, 2)
//     });
// });

const start = async (interative = false) => {
  alert = interative;
  autoUpdater.checkForUpdatesAndNotify();
};

export default { start };
