#!/usr/bin/env bash
set -euo pipefail

# Pollen Studio — deploy static build to newhetzner3.
# Run from repo root after committing.

if [[ -n "$(git status --porcelain)" ]]; then
  echo "Working tree dirty — commit before deploying." >&2
  exit 1
fi

pnpm install --frozen-lockfile
pnpm check
pnpm test
pnpm build

REMOTE="root@newhetzner3"
DEST="/var/www/autodom/pollenstudio.cru2.net/htdocs/"

rsync -avz --delete --exclude='.well-known/' --exclude='.htaccess' build/ "${REMOTE}:${DEST}"
ssh "${REMOTE}" "chown -R apache:apache ${DEST}"
echo "Deployed."
