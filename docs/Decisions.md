# Tarımsal e-Danışman — Mimar ve Ürün Kararları (Decisions Log)

Bu doküman, proje boyunca alınan önemli mimari, teknik ve ürün yönetimi kararlarının gerekçeleriyle birlikte kaydını tutar.

---

## 📋 Alınan Kritik Kararlar

### ADR-001: Kredi Ekonomisi ve Dinamik Fotoğraf Ücretlendirmesi
- **Tarih:** 2026-07-26
- **Karar:** Soru sorma temel ücreti 4 Kredi olarak sabitlenmiş, ilk 2 resim bu ücrete dahil edilmiştir. 2 resimden sonra eklenen her resim için +1 Kredi ek ücret ve maksimum 10 resim sınırı getirilmiştir.
- **Gerekçe:** Kullanıcıların aşırı resim yüklemesini kontrol altında tutmak, gereksiz görsel yükünü azaltmak ve kaliteli resim paylaşımını teşvik etmek.
- **Mimari Etkisi:** `Question.creditCost` ve `Credit` loglarında dinamik harcama hesaplaması yapılmıştır.

---

### ADR-002: Uzman Danışman Puanlama ve Hak Ediş Modeli
- **Tarih:** 2026-07-25
- **Karar:** Uzmanlara doğrudan "cevap başına sabit ücret" vermek yerine, kaliteli içerik üretimini ödüllendiren dinamik haftalık puanlama sistemi kurulmuştur. Puanlar Admin tarafından dinamik TL çarpanına dönüştürülür.
- **Gerekçe:** Sadece sayısal olarak çok cevap veren değil, topluluğa en faydalı ve kaliteli cevapları üreten uzmanları öne çıkarmak.
- **Mimari Etkisi:** `ExpertScoreLog` ve `ExpertPayment` modelleri eklenmiş, cevap düzenlendiğinde veya silindiğinde puanların geriye dönük düşülmesi sağlanmıştır.

---

### ADR-003: Cevap Düzenleme ve Beğeni Sıfırlama Kuralı
- **Tarih:** 2026-07-26
- **Karar:** Bir cevap düzenlendiğinde, cevaba ait tüm beğeniler sıfırlanır ve uzmanın o beğenilerden kazandığı puanlar geri düşülür.
- **Gerekçe:** Cevabın içeriği değiştirildikten sonra eski metne verilen beğenilerin suistimal edilmesini veya yanıltıcı hale gelmesini engellemek.
- **Mimari Etkisi:** `PUT /api/answers/[id]` rotasında `AnswerLike.deleteMany` işlemi çalıştırılır.

---

### ADR-004: Yeni Özellik Değerlendirme Politikası ve Yaşayan Dokümantasyon
- **Tarih:** 2026-07-26
- **Karar:** Projeye gelen tüm yeni öneriler `docs/` altındaki `Roadmap.md`, `Product_Backlog.md` ve `Decisions.md` dosyaları üzerinden yönetilecektir.
- **Gerekçe:** Yazılım mimarisini korumak, geliştirme akışını bozmamak ve ürün sahipliğini sürdürülebilir kılmak.

---

### ADR-005: Veri Depolama, Veritabanı Ölçeklenme ve Altyapı Stratejisi
- **Tarih:** 2026-07-26
- **Karar:** Veritabanı her yıl sıfırlanmayacak, tek bir veritabanında kesintisiz tutulacaktır. Görseller optimize edilerek (maks 1200x1200px, ~300KB) saklanacak ve SEO değeri korunacaktır.
- **Gerekçe:** Google/SEO organik trafiğini kaybetmemek. Metin verisinin çok küçük boyutta kalması (~300MB/yıl) ve tek alan adı (`domain`) üzerinden sürdürülebilir olması.

---

### ADR-006: Modüler Arama Mimarisi (Search Service Abstraction)
- **Tarih:** 2026-07-26
- **Karar:** Arama mantığı `src/lib/services/searchService.ts` katmanına soyutlanmıştır. Şimdilik SQLite `contains` kullanılmakta, ileride projenin geri kalan kodlarını bozmadan Elasticsearch geçişine izin verilmektedir.
- **Gerekçe:** Gelecekte arama motoru değiştirildiğinde tüm sayfaları ve API'leri değiştirmek zorunda kalmamak.

---

### ADR-007: Sol Yan Menü (SideMenu Drawer) ve Sadeleştirilmiş Header Yapısı
- **Tarih:** 2026-07-26
- **Karar:** Mobil ve masaüstü uyumluluğunu artırmak adına tüm navigasyon linkleri sol üst sandviç menüye (`SideMenu`) toplanmış, Header bileşeni sadeleştirilmiştir.
- **Gerekçe:** Mobil ekranlardaki buton kalabalığını ve düzen kaymalarını engellemek, eklenen yeni özellikleri düzenli bir çekmecede toplamak.
