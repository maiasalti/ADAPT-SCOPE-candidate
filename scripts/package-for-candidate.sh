#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."
WORKDIR=$(mktemp -d)
trap 'rm -rf "$WORKDIR"' EXIT

rsync -a \
  --exclude 'node_modules' \
  --exclude 'dist' \
  --exclude '.git' \
  --exclude 'test-hidden' \
  --exclude 'vitest.hidden.config.ts' \
  --exclude 'scripts' \
  ./ "$WORKDIR/finguard/"

mkdir -p dist
(cd "$WORKDIR/finguard" && git init -q && git add -A && git commit -q -m "FinGuard starting point")
(cd "$WORKDIR" && zip -qr "finguard-candidate.zip" finguard)
mv "$WORKDIR/finguard-candidate.zip" dist/finguard-candidate.zip

echo "Wrote dist/finguard-candidate.zip"
