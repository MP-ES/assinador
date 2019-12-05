/* global __static */
import os from 'os';
import fs from 'fs';
import path from 'path';

import platform from '../models/platform';

const getLibs = () => {
  const osPlatform = os.platform();
  const osPath =
    osPlatform === platform.linux
      ? 'linux'
      : osPlatform === platform.mac
      ? 'mac'
      : 'windows';
  const libPath = path.join(__static, 'lib', osPath);
  return fs.readdirSync(libPath).map(file => path.join(libPath, file));
};

export default getLibs;
