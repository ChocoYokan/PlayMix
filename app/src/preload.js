const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
    authAccount: (id, password) => ipcRenderer.send('auth-account', [id, password])
})
contextBridge.exposeInMainWorld('require', {
    oauthSpotify: () => ipcRenderer.invoke('oauthSpotify'),
    getSpotifyAccesssToken: () => ipcRenderer.invoke('getSpotifyAccesssToken'),
})