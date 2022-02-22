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
> 認証情報はTeamsへ

### データベース　マイグレーション
```shell
$ pipenv run python manage.py migrate
```
> または `$ pipenv run migrate`

### スーパーユーザーの設定(最初だけ)
```shell
$ pipenv run python manage.py createsuperuser
> username: admin
> email: admin@hoge.hoge
> password: admin
```
みたいな感じで作ってください

### ローカルサーバ起動
```shell
$ pipenv run start
```

<a href="http://127.0.0.1:8000/">http://127.0.0.1:8000/admin</a>にアクセスして先ほど設定したメールアドレスとパスワードを入力してログインするとページが開きます。

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
