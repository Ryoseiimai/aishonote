# DotGothic16

- 取得日: 2026-09-27
- 配布元: Google Fonts / The DotGothic16 Project Authors
- Google Fonts CSS: https://fonts.googleapis.com/css2?family=DotGothic16&display=swap
- フォント実体: https://fonts.gstatic.com/s/dotgothic16/v21/v6-QGYjBJFKgyw5nSoDAGE7L.ttf
- OFL原文: https://raw.githubusercontent.com/google/fonts/main/ofl/dotgothic16/OFL.txt
- ライセンス: SIL Open Font License 1.1（同梱のOFL.txt、本文は無改変。改行LF・行末空白のみ正規化）

Google FontsのTTFをfontToolsでWOFF2コンテナへ可逆圧縮。字形・フォント名は変更せず、8231コードポイントを保持しています。サブセット化なし。アプリ実行時のダウンロードや変換処理はありません。

同梱WOFF2 SHA-256: `4d696393262915ea6e963eca89f8d8799555ca7579cb4b49f7c38dcaa1b893f3`

再変換の例（開発用。アプリに依存追加は不要）:

```python
from fontTools.ttLib import TTFont
font = TTFont("DotGothic16-Regular.ttf")
font.flavor = "woff2"
font.save("DotGothic16-Regular.woff2")
```
