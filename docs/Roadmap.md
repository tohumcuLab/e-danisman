# Tarımsal e-Danışman — Ürün Yol Haritası (Roadmap)

Bu doküman, platformun sürüm planlamasını ve aşama (faz) hedeflerini tanımlar.

---

## 🟢 Faz 1: Temel Mimari, Kimlik Doğrulama ve Rol Yönetimi (Tamamlandı)
- **Sürüm:** v1.0.0 (MVP)
- **Kapsam:**
  - Next.js 16 + Prisma 7 + SQLite mimarisinin kurulması.
  - NextAuth ile güvenli kullanıcı kayıt ve giriş akışları.
  - Temel kullanıcı rolleri (`USER`, `EXPERT`, `ADMIN`).
  - Admin paneli üzerinden kullanıcı rollerinin (`USER` ↔ `EXPERT` ↔ `ADMIN`) anlık güncellenmesi ve bildirim gönderimi.

---

## 🟢 Faz 2: Soru-Cevap Çekirdek Yapısı ve Kredi Ekonomisi (Tamamlandı)
- **Sürüm:** v1.0.0 (MVP)
- **Kapsam:**
  - Kategori, bitki türü ve il/ilçe/köy konum filtreli soru sorma akışı.
  - Dinamik Kredi Sistemi: Temel soru sorma 4 Kredi (ilk 2 resim dahil). 2 resimden sonra eklenen her resim için +1 Kredi (Maks. 10 resim, resim başı maks. 5 MB & 1200x1200px otomatik Canvas optimizasyonu).
  - Cevap yazma, cevap düzenleme/silme (düzenlemede beğenilerin ve puanların sıfırlanması).
  - Cevap beğenme (+1 Kredi kazancı) ve Soru Sahibinin "En İyi Cevap" seçmesi.

---

## 🟢 Faz 3: Topluluk & Profil Yönetimi (Tamamlandı)
- **Sürüm:** v1.1.0
- **Kapsam:**
  - Kullanıcı Profil Düzenleme (`/profil`): Avatar yükleme (2MB limit, format kontrolü), biyografi/slogan, konum ve sosyal medya hesapları (YouTube, Website, Twitter, Instagram, LinkedIn, Facebook).
  - Kamu / Topluluk Profili Sayfası (`/kullanici/[id]`): Danışman rozetleri, öne çıkan cevaplar, istatistikler ve sosyal medya bağlantıları.
  - YouTube tarzı yapışkan (sticky) yan menü: En Aktif Kullanıcılar (statü/rozet gösterimli), En Popüler Sorular (İlk 5) ve Cevap Bekleyen Sorular (İlk 5).

---

## 🟢 Faz 4: Uzman Danışman Puanlama & Hak Ediş Sistemi (Tamamlandı)
- **Sürüm:** v1.2.0
- **Kapsam:**
  - Uzman Danışman Puanlama Altyapısı (`ExpertScoreLog`): Onaylı cevap (Admin ayarlı, varsayılan +10), Beğeni (+3), En İyi Cevap (+20), Öne Çıkarma (+15), Spam/Cezalar (-20 / -50).
  - Suistimal Engelleri: <50 karakter cevaplara puan yok, haftalık aynı kişiden maks. 3 puanlı beğeni.
  - Uzman Paneli (`/uzman`): Haftalık/Aylık puanlar, yazılan cevaplar, alınan beğeniler ve tahmini TL hak edişi.
  - Admin Uzman Yönetimi (`/admin/uzmanlar`): Haftalık performans tablosu, tek tıkla ödeme tamamlama ve otomatik bildirim gönderimi.
  - Admin Sistem Ayarları (`/admin/settings`): 1 Puan = X TL çarpanı ve Onaylı Cevap Puanı ayarları. Değişikliklerde tüm uzmanlara sistem bildirimi.

---

## 🟢 Faz 5: Reklam Sistemi & Bakiye Kontrolü (Tamamlandı)
- **Sürüm:** v1.3.0
- **Kapsam:**
  - Admin Reklam Yönetimi (`/admin/ads`): MP4 video yükleme/bağlantı ekleme, hedefleme, günlük izleme limiti (`DAILY_AD_LIMIT`).
  - Akış İçi Reklamlar (FEED): Ana sayfadaki soru listesinde her 5 soruda bir gösterim.
  - Ödüllü Video Reklamlar (REWARD_VIDEO): `/kredi-kazan` sayfası ve soru sorma esnasında yetersiz bakiye durumunda açılan `InsufficientCreditsModal` popup ile anında kredi kazanma.

---

## 🟢 Faz 6: Arama ve Bildirimler (Tamamlandı)
- **Sürüm:** v1.4.0
- **Kapsam:**
  - Modüler Search Service (`searchService.ts`): SQLite `contains` tabanlı, Elasticsearch geçişine uygun katmanlı mimari.
  - Site genelinde arama (`/arama`): Soru başlıkları, içerik, kategori ve kullanıcı/danışman arama sonuçları.
  - Sol Sandviç Menü (SideMenu Drawer): Sol üst köşe menüsü, dinamik oturum yönlendirmeleri ve temiz mobil/masaüstü düzeni.
  - Bildirim Merkezi & Çan İkonu (`NotificationDropdown`): Son 5 bildirim menü gösterimi, menü açıldığında otomatik okundu işaretleme ve `/bildirimler` tüm bildirimler geçmişi.

---

## 🔵 Faz 7: Moderasyon, İçerik Şikayet Yönetimi ve SEO/PWA (Sıradaki Faz)
- **Hedef Sürüm:** v1.5.0
- **Kapsam:**
  - Şikayet & Moderasyon Altyapısı: Kullanıcıların soru ve cevapları şikayet edebilmesi, Admin paneli altında Şikayet Yönetim Merkezi (`/admin/reports`).
  - Gelişmiş SEO & Sosyal Paylaşım (OpenGraph): Dinamik soru başlığı, resmi ve açıklama meta etiketleri.
  - Mobil PWA (Progressive Web App) Desteği: Manifest, çevrimdışı önbellekleme ve mobilde uygulamalaştırma.

---

## 🟡 Gelecek Fazlar (Planlanan / Backlog)
- **v2.0.0:** Mobil Uygulama Entegrasyonu (React Native / Flutter için REST API genişletmesi).
- **v2.1.0:** Danışmanlar İçin Doğrudan Özel Mesajlaşma / Birebir Danışmanlık Modülü.
