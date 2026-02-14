#!/bin/bash
# パーミッション切り替えスクリプト
# 使い方: ./switch-permissions.sh [open|strict]

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SETTINGS_FILE="${SCRIPT_DIR}/settings.local.json"

MODE="${1:-}"

if [ "$MODE" != "open" ] && [ "$MODE" != "strict" ]; then
  echo "使い方: $0 [open|strict]"
  echo "  open   : 全ツール許可（開発中）"
  echo "  strict : 最小限の許可（レビュー・本番前）"
  exit 1
fi

# 現在のsettings.local.jsonからhooksを保持
HOOKS=$(jq '.hooks // empty' "$SETTINGS_FILE" 2>/dev/null)
PERMISSIONS=$(cat "${SCRIPT_DIR}/permissions-${MODE}.json")

# hooksとpermissionsをマージして書き出す
if [ -n "$HOOKS" ]; then
  jq -n --argjson perms "$PERMISSIONS" --argjson hooks "$HOOKS" \
    '{ permissions: $perms, hooks: $hooks }' > "$SETTINGS_FILE"
else
  jq -n --argjson perms "$PERMISSIONS" \
    '{ permissions: $perms }' > "$SETTINGS_FILE"
fi

echo "パーミッションを [${MODE}] に切り替えました"
