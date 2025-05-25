# google_review_script

Googleレビュー関連のスクリプトを管理するTypeScriptプロジェクトです。

## セットアップ

```sh
# 依存パッケージのインストール
yarn install
```

## 開発・実行

### 1. TypeScriptファイルの作成
`src/`ディレクトリを作成し、TypeScriptファイルを配置してください。

例:
```
mkdir src
vi src/index.ts
```

### 2. スクリプトの実行

```sh
yarn ts-node src/index.ts
```

---

## 注意
- 必要に応じて`tsconfig.json`を編集してください。
- 共通ライブラリはルート直下の`libs/`や`domain/`などを参照できます。 