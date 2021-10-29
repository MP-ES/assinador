import { app } from 'electron';
import path from 'path';
import fs from 'fs';

import libManager from './libManager';
import server from './server';
import { getNewFakeCert } from './libManager/fakeCerts';

const settingsPath = path.join(app.getPath('userData'), 'settings.json');

const devCerts = [
  getNewFakeCert(0, true),
  getNewFakeCert(1, false),
  getNewFakeCert(2, true, true)
];

let config = {
  port: 19333,
  libs: [],
  devMode: false,
  devCerts
};

function readFromFile() {
  try {
    const settingsFile = JSON.parse(fs.readFileSync(settingsPath));
    config.port = settingsFile.port || config.port;
    config.libs = settingsFile.libs || [];
    config.devMode = settingsFile.devMode || false;
    config.devCerts = settingsFile.devCerts || devCerts;
  } catch {
    config.libs = libManager.identify() || [];
    persist();
  }
}

export function persist() {
  fs.writeFileSync(settingsPath, JSON.stringify(config, null, 2));
}

export function setPort(port) {
  if (port >= 19333 && port <= 19335) config.port = port;
  persist();
  server.restart();
  return config.port;
}

export function setDevMode(devMode) {
  config.devMode = devMode;
  persist();
  return config.devMode;
}

export function addCert(valid) {
  config.devCerts = [
    ...config.devCerts,
    getNewFakeCert(config.devCerts.length, valid)
  ];
  persist();
  return config.devCerts;
}

export function removeCert(id) {
  config.devCerts = config.devCerts.filter(cert => cert.id !== id);
  persist();
  return config.devCerts;
}

export function toggleCertValid(id) {
  const index = config.devCerts.findIndex(cert => cert.id === id);
  config.devCerts[index] = {
    ...config.devCerts[index],
    valid: !config.devCerts[index].valid
  };
  persist();
  return config.devCerts;
}

export function toggleCertError(id) {
  const index = config.devCerts.findIndex(cert => cert.id === id);
  config.devCerts[index] = {
    ...config.devCerts[index],
    throwError: !config.devCerts[index].throwError
  };
  persist();
  return config.devCerts;
}

readFromFile();

export default config;
