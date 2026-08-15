#!/bin/bash
echo "🚀 Tarımsal e-Danışman Otomatik Canlıya Alma Başlatılıyor..."

# 0. Sahiplik ve İzin Kilitlerini Otomatik Sıfırla (aaPanel Root Çakışmalarını Önler)
sudo chown -R tohumcu09:www /www/wwwroot/danisman /www/server/nodejs/cache 2>/dev/null || true
sudo chmod -R 777 /www/wwwroot/danisman /www/server/nodejs/cache 2>/dev/null || true

# 1. Klasöre git
cd /www/wwwroot/danisman || exit 1

# 2. Güvenli git dizinini ayarla ve en son kodları çek
git config --global --add safe.directory /www/wwwroot/danisman
echo "📥 1/4 GitHub'dan en güncel kodlar zorunlu senkronize ediliyor..."
git fetch origin main
git reset --hard origin/main

echo "📦 Paketlenmiş kütüphaneler yükleniyor (npm install)..."
npm install --cache /tmp/.npm-cache

# 3. Eski Next.js ve Prisma derleme önbelleğini sıfırla
echo "🧹 2/4 Eski derleme önbelleği (.next ve .prisma) temizleniyor..."
rm -rf .next node_modules/.prisma


# 4. Veritabanı şemasını senkronize et
echo "🗄️ Veritabanı şeması güncelleniyor (prisma db push)..."
npx prisma db push --accept-data-loss

# 5. Projeyi canlı ortam için temiz derle
echo "⚙️ 3/4 Uygulama canlı ortam için derleniyor..."
NODE_OPTIONS="--max-old-space-size=1536" DATABASE_URL="file:./prisma/dev.db" npm run build


# 5. PM2 sürecini zorla yenile (Önce 3000 portunu serbest bırak)
echo "🔄 4/4 Sunucu süreçleri yeniden başlatılıyor..."
npx kill-port 3000 2>/dev/null || fuser -k 3000/tcp 2>/dev/null || true
npx pm2 restart danisman 2>/dev/null || npx pm2 start npm --name "danisman" -- start



echo "✅ TEBRİKLER! Yayınlama başarıyla tamamlandı!"
