#!/bin/bash
# Stopフック: 残タスクがあれば続行、全完了ならDiscord通知して停止

WEBHOOK_URL="${DISCORD_WEBHOOK_URL:-}"

# stdinからフック入力を読み取る
INPUT=$(cat)
PROJECT_DIR=$(echo "$INPUT" | jq -r '.cwd // "."')
TASKS_FILE="${PROJECT_DIR}/tasks.md"

# --- tasks.md の未完了タスクを確認 ---
if [ -f "$TASKS_FILE" ]; then
  REMAINING=$(grep -c '^\- \[ \]' "$TASKS_FILE" 2>/dev/null || echo "0")

  if [ "$REMAINING" -gt 0 ]; then
    # 未完了タスクあり → Discord に進捗通知
    if [ -n "$WEBHOOK_URL" ]; then
      TOTAL=$(grep -c '^\- \[' "$TASKS_FILE" 2>/dev/null || echo "0")
      DONE=$((TOTAL - REMAINING))
      CONTENT="**タスク進捗** 📋 (${DONE}/${TOTAL} 完了)\n残り ${REMAINING} 件のタスクを続行します"
      curl -s -X POST "$WEBHOOK_URL" \
        -H "Content-Type: application/json" \
        -d "{\"content\": \"${CONTENT}\"}" > /dev/null 2>&1
    fi

    # 停止をブロック → Claude に次のタスクを続行させる
    echo "tasks.md に未完了タスクが ${REMAINING} 件あります。次の未完了タスクを実行してください。" >&2
    exit 2
  fi
fi

# --- 全タスク完了 or tasks.md なし → Discord通知して停止 ---
if [ -n "$WEBHOOK_URL" ]; then
  PROJECT_NAME=$(basename "$PROJECT_DIR")
  CONTENT="**全タスク完了** ✅\nプロジェクト: \`${PROJECT_NAME}\`\n時刻: $(date '+%Y-%m-%d %H:%M:%S')"
  curl -s -X POST "$WEBHOOK_URL" \
    -H "Content-Type: application/json" \
    -d "{\"content\": \"${CONTENT}\"}" > /dev/null 2>&1
fi

exit 0
