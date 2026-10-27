const {contextBridge, ipcRenderer} = require('electron');
contextBridge.exposeInMainWorld('club', {
  request: (action, data = {}) => ipcRenderer.invoke('club:request', action, data),
  onState: callback => ipcRenderer.on('club:state', (_event, state) => callback(state))
});
