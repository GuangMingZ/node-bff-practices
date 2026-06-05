#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

cd "$ROOT_DIR"
git config --local include.path ../.gitconfig

echo "已启用项目级 Git 配置："
git config --local --get include.path
git config user.name
git config user.email
