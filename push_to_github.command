#!/bin/bash
cd "$(dirname "$0")"

REPO_URL="https://github.com/thanhdat2508-ptit/galactic-food-station.git"

echo "=================================================================="
echo "  ĐẨY DỰ ÁN GALACTIC FOOD STATION 3D LÊN GITHUB"
echo "  Repository: $REPO_URL"
echo "=================================================================="
echo ""

git branch -M main
if git remote | grep -q "^origin$"; then
  git remote set-url origin "$REPO_URL"
else
  git remote add origin "$REPO_URL"
fi

git add -A
git commit -m "Update Galactic Food Station 3D Booth & Camp Gate" 2>/dev/null || true

echo "🚀 Đang đẩy mã nguồn lên $REPO_URL ..."
git push -u -f origin main

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ ĐÃ ĐẨY LÊN GITHUB THÀNH CÔNG!"
  echo "🌐 Truy cập: https://github.com/thanhdat2508-ptit/galactic-food-station/settings/pages"
  echo "   Chọn Branch: main -> Save để nhận link https://thanhdat2508-ptit.github.io/galactic-food-station/"
else
  echo ""
  echo "💡 Mẹo nhanh nhất (Không cần mật khẩu/token Terminal):"
  echo "   Kéo thả toàn bộ các file trong thư mục galactic-food-station vào trang:"
  echo "   https://github.com/thanhdat2508-ptit/galactic-food-station/upload/main"
fi

read -p "Nhấn Enter để hoàn tất..."
