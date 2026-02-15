#!/bin/bash
# Editフック: tasks.md のチェックが更新されたらDiscordに進捗通知

WEBHOOK_URL="${DISCORD_WEBHOOK_URL:-}"

# stdinからフック入力を読み取る
INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // ""')

# tasks.md 以外の編集は無視
case "$FILE_PATH" in
  */tasks.md) ;;
  *) exit 0 ;;
esac

TASKS_FILE="$FILE_PATH"

if [ ! -f "$TASKS_FILE" ]; then
  exit 0
fi

TOTAL=$(grep -c '^\- \[' "$TASKS_FILE" 2>/dev/null || true)
TOTAL=${TOTAL:-0}
REMAINING=$(grep -c '^\- \[ \]' "$TASKS_FILE" 2>/dev/null || true)
REMAINING=${REMAINING:-0}
DONE=$((TOTAL - REMAINING))

if [ -n "$WEBHOOK_URL" ] && [ "$TOTAL" -gt 0 ]; then
  PROJECT_NAME=$(basename "$(dirname "$(dirname "$TASKS_FILE")")" 2>/dev/null || basename "$(dirname "$TASKS_FILE")")

  if [ "$REMAINING" -eq 0 ]; then
    CONTENT="**全タスク完了** 🎉\nプロジェクト: \`${PROJECT_NAME}\`\n${DONE}/${TOTAL} 件すべて完了！"
  else
    CONTENT="**タスク完了** ✅ (${DONE}/${TOTAL})\nプロジェクト: \`${PROJECT_NAME}\`\n残り ${REMAINING} 件"
  fi

  curl -s -X POST "$WEBHOOK_URL" \
    -H "Content-Type: application/json" \
    -d "{\"content\": \"${CONTENT}\"}" > /dev/null 2>&1
fi

exit 0
