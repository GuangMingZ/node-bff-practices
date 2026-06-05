#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${BASE_URL:-http://127.0.0.1:3100}"

echo "==> 1) 确保处于观察模式 (disable=true)"
curl -sS -X PATCH "$BASE_URL/admin/rate-limit/Cip" \
  -H 'Content-Type: application/json' \
  -d '{"disable":true,"rateLimitMax":3,"rateLimitInterval":5000}'
echo

echo
echo "==> 2) 连续请求 5 次，HTTP 应始终 200，但服务端会打印 rate-limit-exceeded-observation"
for i in 1 2 3 4 5; do
  echo "--- request #$i"
  curl -sS -o /tmp/observation-response.json -w "HTTP %{http_code}\n" "$BASE_URL/api/echo"
  cat /tmp/observation-response.json
  echo
done

echo "请查看服务日志中的 event=rate-limit-exceeded-observation 记录"
