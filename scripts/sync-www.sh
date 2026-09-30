#!/bin/bash
# ルート直下の Web 本体（index.html / css / js / manifest 等）を www/ へ一方向コピーする。
# www/ はビルド出力なので直接編集しない。正本はルート。
set -euo pipefail
cd "$(dirname "$0")/.."

mkdir -p www

# iOS版（www/ は Capacitor の iOS 専用）には、許諾待ちの相性データ本体（シラツキ理論の相性表の抜粋）を同梱しない。
# js/reference-display.js の EMBED_REFERENCE_ON_NATIVE が false の間は matchup-reference.js を外し、URLだけの matchup-links.js を入れる。
REFERENCE_EXCLUDE=()
if grep -q '^export const EMBED_REFERENCE_ON_NATIVE = false;' js/reference-display.js; then
  REFERENCE_EXCLUDE=(--exclude '/js/presets/matchup-reference.js')
fi

rsync -a --delete --delete-excluded \
  ${REFERENCE_EXCLUDE[@]+"${REFERENCE_EXCLUDE[@]}"} \
  --exclude 'SPEC.md' \
  --exclude 'tests/' \
  --exclude '.github/' \
  --exclude 'store/' \
  --exclude 'AI_Logs/' \
  --exclude 'ios/' \
  --exclude 'android/' \
  --exclude 'build-out/' \
  --exclude 'android-build-out/' \
  --exclude 'assets/' \
  --exclude 'node_modules/' \
  --exclude 'www/' \
  --exclude 'build/' \
  --exclude '控え/' \
  --exclude 'docs/' \
  --exclude 'scripts/' \
  --exclude 'package.json' \
  --exclude 'package-lock.json' \
  --exclude 'capacitor.config.json' \
  --exclude '.gitignore' \
  --exclude '.DS_Store' \
  --exclude '.git/' \
  ./ ./www/

if [ ${#REFERENCE_EXCLUDE[@]} -gt 0 ]; then
  if [ -e www/js/presets/matchup-reference.js ] || grep -rq '"note"' www/js; then
    echo "www/ に相性データ本体が残っています" >&2
    exit 1
  fi
  echo "相性データ本体は同梱せず（matchup-links.js のみ）"
fi

# android/・build-out/ 等の除外漏れ検知: ビルド成果物(apk/aab/署名鍵)が紛れ込むとネイティブアプリに同梱されてしまうため。
if find www -type f \( -name '*.apk' -o -name '*.aab' -o -name '*.jks' -o -name '*.keystore' \) | grep -q .; then
  echo "www/ にビルド成果物/署名鍵が含まれています" >&2
  find www -type f \( -name '*.apk' -o -name '*.aab' -o -name '*.jks' -o -name '*.keystore' \)
  exit 1
fi

# www/ が肥大化していないかの目安チェック(通常は1MB未満)。超過時は除外漏れの調査用に上位5件を表示する。
WWW_SIZE_KB=$(du -sk www | cut -f1)
WWW_SIZE_LIMIT_KB=5000
if [ "$WWW_SIZE_KB" -gt "$WWW_SIZE_LIMIT_KB" ]; then
  echo "www/ が ${WWW_SIZE_KB}KB あります（上限 ${WWW_SIZE_LIMIT_KB}KB）。大きいファイル上位5件:" >&2
  find www -type f -exec du -k {} + | sort -rn | head -5 >&2
  exit 1
fi

echo "synced -> www/ (${WWW_SIZE_KB}KB)"
