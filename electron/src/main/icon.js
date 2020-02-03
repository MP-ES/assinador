/* global __static */
import { nativeImage } from 'electron';
import path from 'path';
import os from 'os';

import platform from './models/platform';

const osPlatform = os.platform();

const get = (resize = false) => {
  if (osPlatform === platform.windows) return path.join(__static, 'icon.ico');
  else {
    const image = nativeImage.createFromPath(path.join(__static, 'icon.png'));
    if (resize) return image.resize({ width: 16, height: 16 });
    return image;
  }
};

export default { get };
