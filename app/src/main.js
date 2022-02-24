const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const axios = require('axios');
const electronReload = require('electron-reload');
const Store = require('electron-store');
global.store = new Store({encryptionKey: 'PlayMix'});

axios.defaults.baseURL = 'http://127.0.0.1:8000/api/v1/';
axios.defaults.headers.post['Content-Type'] = 'application/json';

require('electron-reload')(__dirname, {
    electron: require('${__dirname}/../../node_modules/electron')
});

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
    
    const login = (accessToken) => {
        const options = {
            headers: { Authorization: `JWT ${accessToken}` }
        };
        axios.get("/auth/users/me/", options)
            .then(response => {
                if (response.status === 200) {
                    store.set("user", response.data);
                    mainWindow.loadFile('./src/index.html');
                } else {
                    mainWindow.loadFile('./src/login.html');
                }
            })
            .catch(err => console.error("error", err));
    }
    const accessToken = store.get("accessToken");
    if (accessToken !== "") {
        login(accessToken);
    } else {
        mainWindow.loadFile('./src/login.html');
    }

    ipcMain.on('auth-account', (event, [email, password]) => {
        const webContents = event.sender;
        
        const options = {
            "email": email,
            "password": password
        }

        axios.post("/auth/jwt/create/", options)
            .then((res) => {
                if (res.status === 200) {
                    //ログイン
                    console.log("fetchしたaccess", res.data.access)
                    store.set("accessToken", res.data.access || "");
                    store.set("refreshToken", res.data.access || "");
                    mainWindow.loadFile('./src/index.html');
                } else {
                    //認証エラー
                    console.log("error", res.data);
                }
            })
            .catch((err) => {
                //通信エラー
                console.log("error", err);
            });
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


// storeに保存されたデータを読みだす処理
ipcMain.handle("storeGet", (event, accessText) => {
    return store.get(accessText)
});

// PlayListを新規作成する処理
ipcMain.handle("addPlaylist", (event, name) => {
    const user = store.get("user");
    const userId = user.id;
    const accessToken = store.get("accessToken");

    const params = {
        name: name,
        user: userId
    }

    axios.post("playlist/", params, {
            headers: { Authorization: `JWT ${accessToken}` },
        })
        .then( () => { return true })
        .catch( () => { return false })
});