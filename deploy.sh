#!/bin/bash
echo "🚀 Tarımsal e-Danışman Otomatik Canlıya Alma Başlatılıyor..."

# 1. Klasöre git
cd /www/wwwroot/danisman || exit 1

# 2. Güvenli git dizinini ayarla ve en son kodları çek
git config --global --add safe.directory /www/wwwroot/danisman
echo "📥 1/4 GitHub'dan en güncel kodlar zorunlu senkronize ediliyor..."
git fetch origin main
git reset --hard origin/main

echo "📦 Paketlenmiş kütüphaneler yükleniyor (npm install)..."
npm install

# 3. Eski Next.js derleme önbelleğini sıfırla
echo "🧹 2/4 Eski derleme önbelleği (.next) temizleniyor..."
rm -rf .next

# 4. Projeyi canlı ortam için temiz derle
echo "⚙️ 3/4 Uygulama canlı ortam için derleniyor..."
DATABASE_URL="file:./prisma/dev.db" npm run build

# 5. PM2 sürecini zorla yenile
echo "🔄 4/4 Sunucu süreçleri yeniden başlatılıyor..."
npx pm2 restart danisman --force 2>/dev/null || npx pm2 start npm --name "danisman" -- start

echo "✅ TEBRİKLER! Yayınlama başarıyla tamamlandı!"
