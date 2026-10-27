const {contextBridge, ipcRenderer} = require('electron');
contextBridge.exposeInMainWorld('vvsCloud', {postMessage: message => ipcRenderer.send('club:cloud', message)});
