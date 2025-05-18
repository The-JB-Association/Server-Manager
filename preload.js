const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    openFileDialog: () => ipcRenderer.invoke('open-file-dialog'),
    addServer: (entryFile) => ipcRenderer.invoke('add-server', entryFile),
    getServers: () => ipcRenderer.invoke('get-servers'),
    startServer: (id) => ipcRenderer.invoke('start-server', id),
    stopServer: (id) => ipcRenderer.invoke('stop-server', id),
    removeServer: (id) => ipcRenderer.invoke('remove-server', id),
    onServerOutput: (callback) => ipcRenderer.on('server-output', callback),
    onServerStatusChanged: (callback) => ipcRenderer.on('server-status-changed', callback),
    onLoadedServers: (callback) => ipcRenderer.on('loaded-servers', callback),
});