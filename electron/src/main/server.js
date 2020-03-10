/* global __static */
import { spawn } from 'child_process';
import path from 'path';
import os from 'os';
import wait from 'wait-on';
import { app } from 'electron';

import platform from './models/platform';
import message from './message';

const port = process.env.ASSINADOR_MPES_PORTA || 19333;
const osPlatform = os.platform();
const execPath = path.join(__static, 'bin');
const segundos = 1000;

const startAspnetCoreApp = () =>
  new Promise(resolve => {
    const apiProcess =
      osPlatform === platform.windows
        ? spawn('assinador.exe', [], { cwd: execPath })
        : spawn('sudo', ['./assinador'], { cwd: execPath });
    apiProcess.stdout.on('data', data => console.log(`stdout: ${data}`));
    apiProcess.stderr.on('data', data => console.error(`stderr: ${data}`));
    apiProcess.on('close', code =>
      console.log(`child process exited with code ${code}`)
    );
    const waitOptions = {
      resources: [`tcp:${port}`],
      timeout: 30 * segundos
    };
    wait(waitOptions)
      .then(() => {
        resolve(true);
      })
      .catch(err => {
        message.show(
          {
            type: message.type.WARNING,
            title: 'Assinador MPES',
            message: `Não foi possível iniciar o assinador.\n
Verifique se o certificado foi instalado corretamente e se a porta: ${port} está disponível.\n
Se após reiniciar o computador o problema persistir, entre em contato com o suporte.
`
          },
          () => app.quit()
        );
        console.log(err);
      });
  });

export default {
  start: startAspnetCoreApp
};
