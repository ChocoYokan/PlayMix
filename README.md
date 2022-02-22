# PlayMix
## 環境構築
### Pipenvのインストール
```shell
$ pip install pipenv
```

### Pipenv導入
環境の同期
```shell
$ pipenv sync
```

仮想環境に設定
```shell
$ pipenv shell
```

### 環境変数の設定
```shell
$ cp .env.sample .env
```

### ローカルサーバ起動
```shell
$ pipenv run start
```

### アプリ起動
```shell
$ npm start
```

### アプリビルド
```shell
## Windows
$ npm run build-windows
## macOS
$ npm run build-macOS
```