#!/usr/bin/env bash
# Push the NSM repo to GitHub.
#
#   bash tools/push-github.sh [TOKEN]
#
# Token: first argument, or $NSM_GH_TOKEN. NEVER stored — it is used only in
# the transient push URL (no `git remote add`, no credential files).
#
# The remote is the project repo from the master prompt:
#   https://github.com/platinum-cfx/NSM
set -u
REPO="https://github.com/platinum-cfx/NSM"
TOKEN="${1:-${NSM_GH_TOKEN:-}}"

cd "$(dirname "$0")/.." || exit 1

if [ -n "$(git status --short)" ]; then
  echo "[push-github] WARNING: uncommitted changes present — they will NOT be pushed:"
  git status --short | head -10
fi

if [ -z "$TOKEN" ]; then
  echo "[push-github] no token (arg 1 or NSM_GH_TOKEN) — pushing without auth (works only if a credential helper has one):"
  exec git push "$REPO" main
fi

exec git push "https://${TOKEN}@github.com/platinum-cfx/NSM" main
