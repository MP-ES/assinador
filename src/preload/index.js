const { contextBridge, ipcRenderer, shell } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getVersion: () => ipcRenderer.invoke('get-version'),
  getPort: () => ipcRenderer.invoke('get-port'),
  getLibs: () => ipcRenderer.invoke('get-libs'),
  getDevMode: () => ipcRenderer.invoke('get-dev-mode'),
  getDevCerts: () => ipcRenderer.invoke('get-dev-certs'),
  getCertificates: lib => ipcRenderer.invoke('get-certificates', lib),
  reloadLibs: () => ipcRenderer.invoke('reload-libs'),
  setPort: port => ipcRenderer.invoke('set-port', port),
  setDevMode: devMode => ipcRenderer.invoke('set-dev-mode', devMode),
  addLib: () => ipcRenderer.invoke('add-lib'),
  removeLib: lib => ipcRenderer.invoke('remove-lib', lib),
  addCert: valid => ipcRenderer.invoke('add-cert', valid),
  removeCert: id => ipcRenderer.invoke('remove-cert', id),
  toggleCertValid: id => ipcRenderer.invoke('toggle-cert-valid', id),
  toggleCertError: id => ipcRenderer.invoke('toggle-cert-error', id),
  openExternal: url => shell.openExternal(url)
});
