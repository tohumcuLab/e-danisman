# Canlıya Geçiş (Deployment) ve Veritabanı Aktarımı Planı

Lokal ortamda tamamlanan son geliştirmelerin (Kredi/Premium modalları, cevap form güncellemeleri, API kontrolleri) ve veritabanının canlı sunucuya (`194.62.52.55`) aktarılması için hazırlanan aktif plan aşağıdadır.

---

> [!CAUTION]
> ### ⚠️ Canlı Veritabanı ve Veri Kaybı Önlemi (Önemli)
>
> Projeniz veritabanı olarak **SQLite (`dev.db`)** kullanmaktadır ve sunucudaki `deploy.sh` betiği `git reset --hard origin/main` komutunu çalıştırmaktadır.
>
> **Güvenlik Önlemi:**
> 1. Sunucu üzerinde dağıtım başlatılmadan önce canlıdaki `/www/wwwroot/danisman/dev.db` veritabanı dosyası `dev.db.bak_[tarih_saat]` adıyla güvenli bir konuma yedeklenecektir.
> 2. Lokal veritabanınız canlıya aktarıldıktan sonra tüm yeni özellikler ve veri yapısı canlı ortamda aktif olacaktır.

---

## Yapılacak Değişiklikler

### 1. Kod Değişiklikleri ve Versiyon Kontrolü (Git)
Lokaldeki güncellemeler doğrulandı (`npm run build` başarılı):

* **[MODIFY] [AnswerForm.tsx](file:///Users/hobitohum/Documents/tarimsalDanismanlik/tarimsal-e-danisman/src/components/shared/AnswerForm.tsx)**: Kredi yetersizliğinde Premium ve Reklam yönlendirmeleri.
* **[MODIFY] [InsufficientCreditsModal.tsx](file:///Users/hobitohum/Documents/tarimsalDanismanlik/tarimsal-e-danisman/src/components/shared/InsufficientCreditsModal.tsx)**: Reklam izleme limiti dolduğunda Premium üyeliğe yönlendirme.
* **[NEW] [PremiumModal.tsx](file:///Users/hobitohum/Documents/tarimsalDanismanlik/tarimsal-e-danisman/src/components/shared/PremiumModal.tsx)**: Yeni eklenen Premium üyelik tanıtım modalı.
* **[MODIFY] [questions/route.ts](file:///Users/hobitohum/Documents/tarimsalDanismanlik/tarimsal-e-danisman/src/app/api/questions/route.ts)**: Soru sorarken kredi ve ban kontrol güncellemeleri.
* **[MODIFY] [answers/route.ts](file:///Users/hobitohum/Documents/tarimsalDanismanlik/tarimsal-e-danisman/src/app/api/answers/route.ts)**: Cevap verirken kredi kontrol güncellemeleri.
* **[MODIFY] [dev.db](file:///Users/hobitohum/Documents/tarimsalDanismanlik/tarimsal-e-danisman/dev.db)**: Güncellenmiş lokal veritabanı.

### 2. Dağıtım Adımları (Deployment Flow)

1. **Git Commit & Push (Lokal)**:
   Lokal değişiklikler ve güncel veritabanı GitHub `main` dalına gönderilecek.
2. **SSH ile Sunucuya Bağlantı & Veritabanı Yedeği**:
   Sunucuya (`194.62.52.55`) bağlanılarak mevcut veritabanı yedeklenecek:
   `cp /www/wwwroot/danisman/dev.db /www/wwwroot/danisman/dev.db.bak_$(date +%Y%m%d_%H%M%S)`
3. **Otomatik Dağıtım Betiğini Çalıştırma (`deploy.sh`)**:
   Sunucudaki mevcut `bash /www/wwwroot/danisman/deploy.sh` betiği çalıştırılarak:
   - `git fetch` ve `git reset --hard origin/main` (Yeni kodlar & veritabanı çekilecek)
   - `npm install`
   - `.next` önbelleği temizleme ve `npm run build` (Canlı derleme)
   - `pm2 restart` (Uygulamayı canlıda yeniden başlatma)
4. **Yayın Sonrası Doğrulama**:
   `https://sor.hobitohum.com` canlı adresinden test edilecek.

---

## Doğrulama Planı

### Otomatik Testler & Derleme
- Lokal `npm run build` (Başarıyla doğrulandı ✓)
- Sunucuda `deploy.sh` çıktısı ve PM2 durum kontrolü

### Manuel Doğrulama
- Canlı sitede soru/cevap gönderme, kredi düşümü ve yeni eklenen Premium Modal özelliklerinin çalıştığının teyit edilmesi.
