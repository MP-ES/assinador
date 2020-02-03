/* global __static */
import { spawn } from 'child_process';
import path from 'path';
import os from 'os';

import platform from './models/platform';

const osPlatform = os.platform();
const execPath = path.join(__static, 'bin');

const startAspnetCoreApp = () => {
  const apiProcess =
    osPlatform === platform.windows
      ? spawn('assinador.exe', [], { cwd: execPath })
      : spawn('sudo', ['./assinador'], { cwd: execPath });
  apiProcess.stdout.on('data', data =>
    console.log(`stdout: ${data.toString()}`)
  );
};

export default {
  start: startAspnetCoreApp
};
