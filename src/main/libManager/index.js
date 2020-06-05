import os from 'os';
import * as graphene from 'graphene-pk11';

import platforms from '../models/platform';
import tokens from './tokens';

const validLibs = [];

const getTokens = () => {
  const osPlatform = os.platform();
  switch (osPlatform) {
    case platforms.windows:
      return tokens.win;
    case platforms.linux:
      return tokens.linux;
    case platforms.mac:
      return tokens.mac;
  }
};

const tryLoad = lib => {
  try {
    const mod = graphene.Module.load(lib);
    try {
      mod.initialize();
      mod.getSlots(true);
      return true;
    } catch {
      return false;
    } finally {
      mod.finalize();
    }
  } catch {
    return false;
  }
};

const identify = () => {
  Object.keys(getTokens()).forEach(token => {
    let valid = false;
    let index = 0;
    const libs = tokens.win[token];
    while (!valid && libs.length > index) {
      valid = tryLoad(libs[index]);
      if (valid) validLibs.push(libs[index]);
      index += 1;
    }
  });
};

const getLibs = () => {
  return validLibs;
};

export default { identify, getLibs };
