# Faz 7: Moderasyon, Şikayet Yönetimi ve SEO/PWA Entegrasyonu

Bu fazda, platformun güvenliğini artıracak moderasyon sistemi ile erişilebilirliğini (SEO & PWA) artıracak özellikleri devreye alacağız.

## Propose Edilen Değişiklikler

### 1. Moderasyon & Şikayet Yönetimi (Report System)
Mevcut Prisma `Report` modelini kullanarak kullanıcıların içerikleri şikayet etmesini ve Adminlerin bu şikayetleri yönetmesini sağlayacağız.

- **[YENİ] `src/components/modals/ReportModal.tsx`**:
  Kullanıcıların Soru, Cevap veya diğer Kullanıcıları şikayet edebilmesi için genel bir form. Şikayet nedeni (reason) girilebilecek.
  
- **[DEĞİŞTİR] `src/components/questions/QuestionDetail.tsx` & `AnswerCard.tsx`**:
  İçeriklerin sağ üst köşesine (veya uygun bir yerine) 🚩 (Şikayet Et) ikonu eklenecek.
  
- **[YENİ] `src/app/api/reports/route.ts`**:
  Şikayeti veritabanına kaydedecek API uç noktası.
  
- **[YENİ] `src/app/(admin)/admin/reports/page.tsx`**:
  Adminlerin gelen şikayetleri listeleyip (PENDING, RESOLVED, DISMISSED) durumlarını değiştirebileceği, doğrudan sorunlu içeriğe linklenen moderasyon paneli.

### 2. SEO (Arama Motoru Optimizasyonu) ve OpenGraph Entegrasyonu
Platformdaki soru sayfalarının WhatsApp, Facebook, X (Twitter) gibi platformlarda paylaşıldığında zengin kart (Rich Snippet) olarak görünmesini sağlayacağız.

- **[DEĞİŞTİR] `src/app/soru/[id]/page.tsx`**:
  Next.js `generateMetadata` fonksiyonu eklenerek; sorunun başlığı, özeti ve (varsa) ilk görseli `og:title`, `og:description`, `og:image` olarak atanacak.
  
- **[DEĞİŞTİR] `src/app/layout.tsx`**:
  Ana site başlığı, genel `og` etiketleri ve Twitter kartı (twitter:card) yapılandırması.

### 3. PWA (Progressive Web App) Desteği
Uygulamanın mobil tarayıcılardan "Ana Ekrana Ekle" (Add to Home Screen) özelliği ile bir uygulama gibi kurulabilmesini sağlayacağız.

- **[YENİ] `public/manifest.json`**:
  PWA tanımlamaları (isim, renk teması, ikon yolları, display: standalone).
  
- **[DEĞİŞTİR] `src/app/layout.tsx`**:
  `<link rel="manifest" href="/manifest.json" />` ile manifest entegrasyonu. (Gerekirse Next.js metadata API üzerinden).
  
> [!NOTE]
> Offline önbellekleme (Service Worker) süreçleri PWA için eklenebilir ancak mevcut Turbopack build ortamında harici kütüphane (`next-pwa`) kurulumu bazen sorun çıkarabilmektedir. Bu nedenle ilk aşamada sadece **"Ana Ekrana Ekleme (Manifest)"** özelliği sunulması planlanmıştır. Tam bir çevrimdışı (offline) Service Worker istiyorsanız belirtebilirsiniz.

## Open Questions / Geri Bildiriminiz

1. Şikayet edilen içerikler Admin panelinden "Gizle" (Hide/Delete) dendiğinde içerik kalıcı olarak silinsin mi (Soft-Delete vs Hard-Delete)? Şimdilik sadece Adminlerin içeriği kalıcı silmesi (`delete`) veya sorunu "Çözüldü" (Resolved) yapması yeterli midir?
2. PWA kurulumu için eklemek istediğiniz özel bir favicon/ikon yoksa geçici renkli ikonlar oluşturulacaktır, uygun mudur?

Planı inceledikten sonra onay verebilirsiniz veya değişiklik isteyebilirsiniz.
