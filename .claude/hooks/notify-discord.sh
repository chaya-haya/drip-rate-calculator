#!/bin/bash
# Stopフック: 停止時にDiscordへ進捗通知を送る（停止自体はブロックしない）

WEBHOOK_URL="${DISCORD_WEBHOOK_URL:-}"

# stdinからフック入力を読み取る
INPUT=$(cat)
PROJECT_DIR=$(echo "$INPUT" | jq -r '.cwd // "."')
TASKS_FILE="${PROJECT_DIR}/tasks.md"

# --- tasks.md の未完了タスクを確認 ---
if [ -f "$TASKS_FILE" ]; then
  REMAINING=$(grep -c '^\- \[ \]' "$TASKS_FILE" 2>/dev/null || echo "0")
  TOTAL=$(grep -c '^\- \[' "$TASKS_FILE" 2>/dev/null || echo "0")
  DONE=$((TOTAL - REMAINING))

  if [ "$REMAINING" -gt 0 ]; then
    # 未完了タスクあり → Discord に進捗通知
    if [ -n "$WEBHOOK_URL" ]; then
      CONTENT="**タスク中断** ⏸️ (${DONE}/${TOTAL} 完了)\n残り ${REMAINING} 件の未完了タスクがあります"
      curl -s -X POST "$WEBHOOK_URL" \
        -H "Content-Type: application/json" \
        -d "{\"content\": \"${CONTENT}\"}" > /dev/null 2>&1
    fi
  else
    # 全タスク完了 → Discord に完了通知
    if [ -n "$WEBHOOK_URL" ]; then
      PROJECT_NAME=$(basename "$PROJECT_DIR")
      CONTENT="**全タスク完了** ✅\nプロジェクト: \`${PROJECT_NAME}\`\n時刻: $(date '+%Y-%m-%d %H:%M:%S')"
      curl -s -X POST "$WEBHOOK_URL" \
        -H "Content-Type: application/json" \
        -d "{\"content\": \"${CONTENT}\"}" > /dev/null 2>&1
    fi
  fi
else
  # tasks.md なし → Discord に通知
  if [ -n "$WEBHOOK_URL" ]; then
    PROJECT_NAME=$(basename "$PROJECT_DIR")
    CONTENT="**セッション終了** 🔚\nプロジェクト: \`${PROJECT_NAME}\`\n時刻: $(date '+%Y-%m-%d %H:%M:%S')"
    curl -s -X POST "$WEBHOOK_URL" \
      -H "Content-Type: application/json" \
      -d "{\"content\": \"${CONTENT}\"}" > /dev/null 2>&1
  fi
fi

# 常に停止を許可する（ユーザーの中断を妨げない）
exit 0
