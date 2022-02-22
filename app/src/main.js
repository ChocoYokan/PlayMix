const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path')

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        },
        width: 1200, height: 800,
        minWidth: 800, minHeight: 300,
    });

    // TODO: ここの条件分岐でアクセストークンが有効なのか確認してください。
    if (false) {
        mainWindow.loadFile('./src/index.html');
    } else {
        mainWindow.loadFile('./src/login.html');
    }

    ipcMain.on('auth-account', (event, [id, password]) => {
        const webContents = event.sender;

        console.log(id, password);

        //TODO: ここの条件分岐で上のid,passwordを使って認証してください
        if (true) {
            mainWindow.loadFile('./src/index.html');
        }
    })

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});
