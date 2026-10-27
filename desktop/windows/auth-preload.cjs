const {contextBridge, ipcRenderer} = require('electron');
contextBridge.exposeInMainWorld('auth', {
  action: action => ipcRenderer.send('club:auth', action),
  onState: callback => ipcRenderer.on('club:auth-state', (_event, state) => callback(state))
});
