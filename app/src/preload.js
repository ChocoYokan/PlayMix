const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
    authAccount: (id, password) => ipcRenderer.send('auth-account', [id, password]),
    storeGet: async (accessText) => await ipcRenderer.invoke('storeGet', accessText),
    addPlaylist: async (name) => await ipcRenderer.invoke('addPlaylist', name),
})