#!/bin/bash
echo "🚀 Tarımsal e-Danışman Otomatik Canlıya Alma Başlatılıyor..."

# 1. Klasöre git
cd /www/wwwroot/danisman || exit 1

# 2. Güvenli git dizinini ayarla ve en son kodları çek
git config --global --add safe.directory /www/wwwroot/danisman
echo "📥 1/4 GitHub'dan en güncel kodlar çekiliyor..."
git pull origin main

# 3. Eski Next.js derleme önbelleğini sıfırla
echo "🧹 2/4 Eski derleme önbelleği (.next) temizleniyor..."
rm -rf .next

# 4. Projeyi canlı ortam için temiz derle
echo "⚙️ 3/4 Uygulama canlı ortam için derleniyor..."
DATABASE_URL="file:./dev.db" npm run build

# 5. PM2 sürecini zorla yenile
echo "🔄 4/4 Sunucu süreçleri yeniden başlatılıyor..."
npx pm2 restart all --force 2>/dev/null || true

echo "✅ TEBRİKLER! Yayınlama başarıyla tamamlandı!"
