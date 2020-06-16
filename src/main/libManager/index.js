import os from 'os';

import platforms from '../models/platform';
import config, { persist } from '../config';

import libraries from './libraries';
import tryLoad from './tryLoad';
import getCertificates from './getCertificates';

const getTokens = () => {
  const osPlatform = os.platform();
  switch (osPlatform) {
    case platforms.windows:
      return libraries.win;
    case platforms.linux:
      return libraries.linux;
    case platforms.mac:
      return libraries.mac;
  }
};

const identify = () => {
  const validLibs = [];
  const tokens = getTokens();

  Object.keys(tokens).forEach(token => {
    let valid = false;
    let index = 0;
    const libs = tokens[token];
    while (!valid && libs.length > index) {
      valid = tryLoad(libs[index]);
      if (valid) validLibs.push(libs[index]);
      index += 1;
    }
  });

  return validLibs;
};

const reloadLibs = () => {
  config.libs = identify();
  persist();
  return config.libs;
};

const addLib = lib => {
  if (!config.libs.find(internal => internal === lib)) {
    config.libs.push(lib);
    persist();
  }
  return config.libs;
};

const removeLib = lib => {
  const index = config.libs.findIndex(internal => internal === lib);
  if (index > -1) {
    config.libs.splice(index, 1);
    persist();
  }
  return config.libs;
};

export default {
  identify,
  reloadLibs,
  addLib,
  removeLib,
  getCertificates
};
