#!/usr/bin/env bash
set -euo pipefail

if [ $# -eq 0 ]; then
  echo "Usage: ./deploy.sh \"commit message\""
  exit 1
fi

MSG="$1"

echo "==> Building..."
npm run build

echo "==> Committing..."
git add -A
git commit -m "$MSG"

echo "==> Pushing to origin/main..."
git push origin main

echo "==> Deploying to GitHub Pages..."
npx gh-pages -d dist

echo "==> Done. Site will update at https://wolframike.github.io/Themis/"
