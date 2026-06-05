#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${BASE_URL:-http://127.0.0.1:3100}"

echo "==> 1) 关闭观察模式，开启 IP 限流 (max=3 / 5s)"
curl -sS -X PATCH "$BASE_URL/admin/rate-limit/Cip" \
  -H 'Content-Type: application/json' \
  -d '{"disable":false,"rateLimitMax":3,"rateLimitInterval":5000}'
echo

echo
echo "==> 2) 连续请求 5 次，预期第 4 次开始返回 429"
for i in 1 2 3 4 5; do
  echo "--- request #$i"
  curl -sS -o /tmp/rate-limit-response.json -w "HTTP %{http_code}\n" "$BASE_URL/api/echo"
  cat /tmp/rate-limit-response.json
  echo
done

echo "==> 3) 等待限流窗口过期后恢复观察模式"
sleep 6
curl -sS -X PATCH "$BASE_URL/admin/rate-limit/Cip" \
  -H 'Content-Type: application/json' \
  -d '{"disable":true}'
echo
