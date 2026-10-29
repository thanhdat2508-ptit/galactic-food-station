#!/bin/zsh
# =====================================================================
#  publish_internet.command — PHÁT HÀNH GIAN HÀNG 3D LÊN INTERNET (1 CHẠM)
#  Nhấp đúp vào tệp này trong Finder hoặc chạy ./publish_internet.command
# =====================================================================

DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$DIR"

PORT=8000
if ! lsof -i :$PORT >/dev/null 2>&1; then
  echo "🚀 Đang khởi động Local HTTP Server tại cổng $PORT..."
  python3 -m http.server $PORT >/dev/null 2>&1 &
  SRV_PID=$!
  trap "kill $SRV_PID 2>/dev/null" EXIT
  sleep 1
fi

CF_BIN="/tmp/cloudflared"
if [ ! -x "$CF_BIN" ]; then
  echo "⬇️ Đang tải công cụ Cloudflare Quick Tunnel..."
  ARCH="$(uname -m)"
  if [ "$ARCH" = "arm64" ]; then
    URL="https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-darwin-arm64.tgz"
  else
    URL="https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-darwin-amd64.tgz"
  fi
  curl -sL "$URL" -o /tmp/cloudflared.tgz && tar -xzf /tmp/cloudflared.tgz -C /tmp && chmod +x "$CF_BIN"
fi

echo "🌐 Đang tạo đường link HTTPS công khai (không cần tài khoản)..."
"$CF_BIN" tunnel --no-autoupdate --url "http://localhost:$PORT"
