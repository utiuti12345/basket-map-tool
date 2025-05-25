# basket-map-tool モノレポ構成

このリポジトリはモノレポ構成です。各種ツールや共通ライブラリを `packages/` 配下やルート直下にまとめています。

## ディレクトリ構成

```
basket-map-tool/
├── packages/
│   └── csv_import_park/   # 公園CSVインポートツール
├── libs/                 # 共通ライブラリ
├── domain/               # ドメイン層（モデル・リポジトリ）
├── utils/                # ユーティリティ
├── constants/            # 定数
├── package.json          # ルート（ワークスペース管理）
├── yarn.lock             # yarn用ロックファイル
└── README.md             # このファイル
```

## 初期構築手順

1. **リポジトリをクローン**

```sh
git clone <このリポジトリのURL>
cd basket-map-tool
```

2. **依存パッケージのインストール**

```sh
yarn install
```

3. **各パッケージの依存追加（例: axios）**

```sh
yarn workspace csv_import_park add axios
```

4. **TypeScriptやNode型定義が必要な場合**

```sh
yarn workspace csv_import_park add -D @types/node
```

5. **各パッケージのスクリプト実行例**

```sh
cd packages/csv_import_park
yarn start
```

---

## .envファイルについて

- APIキーやDB接続情報などの機密情報は `.env` ファイルで管理します。
- `.env` ファイルは **プロジェクトルート**（`basket-map-tool/`）に配置してください。
- 必要に応じて各パッケージ配下にも `.env` を置くことができます。

### 例: .env

```
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_KEY=your_supabase_service_key
OTHER_API_KEY=your_api_key
```

- 変数名は大文字・アンダースコア区切りで記載します。
- 値にスペースや特殊文字が含まれる場合は "（ダブルクォート）で囲ってください。

### 注意
- `.env` ファイルは **絶対にGit管理しないでください**（`.gitignore`に追加済み）
- サンプル用に `.env.example` を用意しておくと便利です。

---

## 注意事項
- 共通化したいファイルはルート直下（libs, domain, utils, constantsなど）に配置してください。
- importパスは相対パス（例: ../../../libs/geo/geocode）で記述してください。
- 新しいパッケージを追加する場合は `packages/` 配下にディレクトリを作成し、`package.json` を用意してください。

---

何か不明点があれば、プロジェクト管理者までご連絡ください。 