#!/bin/bash
# 自动更新脚本 — 配合 crontab 定期执行
set -e
cd "$(dirname "$0")"

BRANCH="${1:-main}"
INTERVAL="${2:-60}"

LOG="/tmp/loj-autoupdate.log"
echo "[$(date)] Checking for updates..." >> "$LOG"

git fetch origin "$BRANCH" 2>/dev/null

LOCAL=$(git rev-parse "$BRANCH" 2>/dev/null)
REMOTE=$(git rev-parse "origin/$BRANCH" 2>/dev/null)

if [ "$LOCAL" != "$REMOTE" ] && [ -n "$REMOTE" ]; then
  echo "[$(date)] New commit $REMOTE, pulling..." | tee -a "$LOG"
  git pull origin "$BRANCH"
  docker compose up -d --build
  echo "[$(date)] Deployed!" >> "$LOG"
else
  echo "[$(date)] Up to date." >> "$LOG"
fi
