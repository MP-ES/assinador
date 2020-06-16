import { app } from 'electron';
import path from 'path';
import fs from 'fs';

import libManager from './libManager';
import server from './server';

const settingsPath = path.join(app.getPath('userData'), 'settings.json');

let config = {
  port: 19333,
  libs: []
};

function readFromFile() {
  try {
    const settingsFile = JSON.parse(fs.readFileSync(settingsPath));
    config.port = settingsFile.port;
    config.libs = settingsFile.libs;
  } catch {
    config.libs = libManager.identify();
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

readFromFile();

export default config;
