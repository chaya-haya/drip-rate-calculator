#!/bin/bash
# AskUserQuestionフック: ユーザーへの質問時にDiscord通知を送る

WEBHOOK_URL="${DISCORD_WEBHOOK_URL:-}"

if [ -z "$WEBHOOK_URL" ]; then
  exit 0
fi

# stdinからフック入力を読み取る
INPUT=$(cat)
QUESTION=$(echo "$INPUT" | jq -r '.tool_input.questions[0].question // "質問があります"')

PROJECT_NAME=$(basename "${CLAUDE_PROJECT_DIR:-$(pwd)}")
CONTENT="**質問があります** ❓\nプロジェクト: \`${PROJECT_NAME}\`\n${QUESTION}"

curl -s -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d "{\"content\": \"${CONTENT}\"}" > /dev/null 2>&1

exit 0
