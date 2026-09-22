#!/bin/bash
# ルート直下の Web 本体（index.html / css / js / manifest 等）を www/ へ一方向コピーする。
# www/ はビルド出力なので直接編集しない。正本はルート。
set -euo pipefail
cd "$(dirname "$0")/.."

mkdir -p www

rsync -a --delete --delete-excluded \
  --exclude 'SPEC.md' \
  --exclude 'tests/' \
  --exclude '.github/' \
  --exclude 'store/' \
  --exclude 'ios/' \
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
  --exclude '.git/' \
  ./ ./www/

echo "synced -> www/"
