const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const crypto = require('crypto');
const express = require('express');
const axios = require('axios');
const Store = require('electron-store')
const keytar = require('keytar');
// const electronReload = require('electron-reload');
const servicename = "playmix";
require('dotenv').config({ path: __dirname + '/../../.env' });
// require('electron-reload')(__dirname, {
//     electron: require('${__dirname}/../../node_modules/electron')
// });
global.store = new Store({ encryptionKey: 'PlayMix' });
axios.defaults.baseURL = 'http://127.0.0.1:8000/api/v1/';
axios.defaults.headers.post['Content-Type'] = 'application/json';

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
                    console.log("success auth");
                    store.set("user", response.data);
                    mainWindow.loadFile('./src/index.html');
                } else {
                    console.log("fail auth");
                    mainWindow.loadFile('./src/login.html');
                }
            })
            .catch(err => mainWindow.loadFile('./src/login.html'));
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
                console.log("error", err.data.detail);
            });
    })

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

app.on('ready', createWindow);

app.whenReady().then(async () => {
    ipcMain.handle('oauthSpotify', oauthSpotify);
    ipcMain.handle('getSpotifyAccesssToken', getSpotifyAccesssToken);
})

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

async function oauthSpotify() {
    const client_id = process.env.SPOTIFY_CLIENT_ID;
    const client_secret = process.env.SPOTIFY_CLIENT_SEACRET;
    const auth_url = "https://accounts.spotify.com/authorize";
    const redirect_uri = "http://localhost:33201/oauth2/callback";
    const state_id = Math.random().toString(32).substring(2);
    const scope = "user-read-private user-read-email user-read-playback-state user-modify-playback-state user-read-currently-playing streaming app-remote-control"
    const code_verifier = base64URLEncode(crypto.randomBytes(32));
    const hashed = createHash256(code_verifier);
    const code_challenge = base64URLEncode(hashed);
    const params = new URLSearchParams({
        response_type: 'code',
        client_id: client_id,
        scope: scope,
        redirect_uri: redirect_uri,
        state: state_id,
        code_challenge_method: 'S256',
        code_challenge: code_challenge
    }).toString();
    shell.openExternal(auth_url + "?" + params);

    const { code, state } = await waitCallback(redirect_uri);
    focusWin();
    if (code === undefined || state_id !== state) {
        console.log("Spotify authentication failed");
        return { "status": "failed" };
    }

    const encoded_base64 = Buffer.from(client_id + ':' + client_secret).toString('base64');
    const token_url = "https://accounts.spotify.com/api/token";
    const body = new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirect_uri,
        client_id: client_id,
        code_verifier: code_verifier,
    }).toString();
    const opt = {
        method: 'POST',
        headers: {
            'content-type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + encoded_base64
        },
        data: body,
        url: token_url,
    };
    try {
        // const store = new Store();
        const date = new Date();
        const unix_t = Math.floor(date.getTime() / 1000);
        const result = await axios(opt);
        const { access_token, expires_in, refresh_token } = result.data;
        store.set('spotify_expires_in', unix_t + expires_in);
        keytar.setPassword(servicename, "access_token", access_token);
        keytar.setPassword(servicename, "refresh_token", refresh_token);
    } catch (e) {
        console.log(e);
        return { "status": "failed" };
    }

    return { "status": "success" };
}

async function getSpotifyAccesssToken() {
    console.log("AAA");
    const date = new Date();
    console.log("AAA");
    const unix_t = Math.floor(date.getTime() / 1000);
    console.log("AAA");
    // const store = new Store();
    console.log("AAA");
    console.log(store.get("spotify_expires_in"));
    if (store.get("spotify_expires_in") <= unix_t) {
        const token_url = "https://accounts.spotify.com/api/token";
        const refresh_token = await keytar.getPassword(servicename, "refresh_token");
        console.log(refresh_token);
        const client_id = process.env.SPOTIFY_CLIENT_ID;
        const body = new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: refresh_token,
            client_id: client_id,
        }).toString();
        const opt = {
            method: 'POST',
            headers: {
                'content-type': 'application/x-www-form-urlencoded'
            },
            data: body,
            url: token_url,
        };
        try {
            // const store = new Store();
            const date = new Date();
            const unix_t = Math.floor(date.getTime() / 1000);
            const result = await axios(opt);
            const { access_token, expires_in } = result.data;
            store.set('spotify_expires_in', unix_t + expires_in);
            keytar.setPassword(servicename, "access_token", access_token);
            return access_token;
        } catch (e) {
            console.log(e);
            return null;
        }
    }
    return await keytar.getPassword(servicename, "access_token");
}

function createHash256(plain) {
    return crypto.createHash('sha256').update(plain).digest('base64');
}

function base64URLEncode(str) {
    return str.toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
}

async function waitCallback(redirectUri, options = {}) {
    const { protocol, hostname, port, pathname } = new URL(redirectUri);
    if (protocol !== 'http:' || hostname !== 'localhost') {
        throw new Error('redirectUri should be an http://localhost url');
    }

    return new Promise((resolve, reject) => {
        const app = express();
        app.get(pathname, async (req, res) => {
            resolve(req.query);
            res.send('<html><body><h1>認証成功しました！</h1><h2>アプリに戻るとSpotifyが使用できるようになります！このタブは閉じても構いません</h2></body></html>');
            setTimeout(shutdown, 100);
        });
        const server = app.listen(port);
        const shutdown = (reason) => {
            server.close();
            if (reason) {
                reject(new Error(reason));
            }
        };
        if (options.timeout) {
            setTimeout(() => shutdown('timeout'), options.timeout);
        }
    });
}

function focusWin() {
    if (mainWindow) { mainWindow.focus(); }
}

// storeに保存されたデータを読みだす処理
ipcMain.handle("storeGet", (event, accessText) => {
    return store.get(accessText)
});

//*
//* プレイリスト
//*
// Palylistをロードする処理
ipcMain.handle("loadPlaylist", (event) => {
    const accessToken = store.get("accessToken");

    const options = {
        headers: { Authorization: `JWT ${accessToken}` }
    };

    const results = axios.get("playlist/", options)
        .then((response) => {
            return response.data.results;
        })
        .catch((err) => {
            return [];
        });
    return results;
})

// PlayListを新規作成する処理
ipcMain.handle("addPlaylist", (event, name) => {
    const user = store.get("user");
    const userId = user.id;
    const accessToken = store.get("accessToken");

    const params = {
        name: name,
        user: userId
    }

    const result = axios.post("playlist/", params, {
        headers: { Authorization: `JWT ${accessToken}` },
    })
        .then(() => { return true })
        .catch(() => { return false })

    return result
});

//*
//* コンテンツ
//*
// コンテンツの追加
// {
//     name: "", 
//     url: "",
//     content_type: "",  (nikodo | youtube | spotify)
//     playlist: "",      playlistのプライマリーキー
//     order: 0,
//     thumbnail: "",
// }
ipcMain.handle("addContent", (event, content) => {
    const accessToken = store.get("accessToken");

    const result = axios.post("contents/", content, {
        headers: { Authorization: `JWT ${accessToken}` },
    })
        .then(() => { return true })
        .catch((e) => {
            console.log("addContentError", e.response);
            return false;
        });

    return result
})