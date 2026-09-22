# コントリビュートガイド

このプロジェクトへの貢献を歓迎します。

## 開発方針

- 依存ライブラリ・ビルドツール・外部CDN・外部フォント・アクセス解析は追加しないでください。
- ユーザー入力をDOMに出すときは `innerHTML` を使わず、`js/dom.js` の `el()` など DOM API のみで
  組み立ててください。
- `eval` / `new Function` / `document.write` / `javascript:` URLは使用しないでください。
- ロジック（`js/stats.js` や `js/store.js` のような純粋関数）を追加・変更した場合は、`tests/` に
  `node:test` の単体テストを追加してください。

## セットアップ

```bash
git clone <このリポジトリ>
cd smash-note
python3 -m http.server 8000
```

## テストの実行

```bash
node --test tests/*.test.js
```

## Pull Requestの手順

1. Issueで議論するか、既存Issueにコメントしてから着手すると手戻りが少なくなります。
2. ブランチを切って変更し、`node --test tests/*.test.js` が通ることを確認してください。
3. CIの静的チェック（`innerHTML`/`eval`/`document.write`/外部URLの禁止パターン検出）が通ることを
   確認してください。
4. Pull Requestを作成し、変更内容と動作確認結果を記載してください。

## バグ報告・機能要望

`.github/ISSUE_TEMPLATE/` のテンプレートを使ってIssueを立ててください。
