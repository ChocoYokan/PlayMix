const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const crypto = require('crypto');
const express = require('express');
const axios = require('axios');
const Store = require('electron-store')
const keytar = require('keytar');
const servicename = "playmix";
require('dotenv').config({ path: __dirname + '/../../.env' });

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
        const store = new Store();
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
    const date = new Date();
    const unix_t = Math.floor(date.getTime() / 1000);
    const store = new Store();
    if (store.get("spotify_expires_in") <= unix_t) {
        const token_url = "https://accounts.spotify.com/api/token";
        const refresh_token = await keytar.getPassword(servicename, "refresh_token");
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
            const store = new Store();
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