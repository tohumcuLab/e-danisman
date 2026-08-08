import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Topluluk Kuralları | Tarımsal e-Danışman",
  description: "Tarımsal e-Danışman platformu kullanım ve topluluk kuralları, yasal sorumluluklar ve danışmanlık ilkesi.",
};

export default function ToplulukKurallariPage() {
  return (
    <div className="container max-w-4xl py-8 space-y-8">
      {/* Üst Header */}
      <div className="card p-6 border-l-4 border-[var(--primary)] bg-[var(--primary)]/5 space-y-2">
        <div className="flex items-center gap-3">
          <span className="text-3xl">📜</span>
          <div>
            <h1 className="text-2xl font-extrabold text-[var(--on-surface)]">Tarımsal e-Danışman Topluluk Kuralları</h1>
            <p className="text-xs text-[var(--on-surface-variant)]">
              Sağlıklı, güvenli ve bilgi dolu bir tarım topluluğu için uymamız gereken temel ilkeler.
            </p>
          </div>
        </div>
      </div>

      {/* Ana Vurgu Uyarı Kutusu */}
      <div className="p-5 bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-400 dark:border-amber-700 rounded-2xl space-y-3 shadow-sm">
        <h2 className="text-sm font-extrabold text-amber-900 dark:text-amber-200 flex items-center gap-2">
          <span>⚠️ ÖNEMLİ YASAL SORUMLULUK VE TAVSİYE UYARISI</span>
        </h2>
        <div className="text-xs text-amber-900 dark:text-amber-300 space-y-2 leading-relaxed font-medium">
          <p>
            <strong>1. HER KULLANICI KENDİ PAYLAŞIMINDAN SORUMLUDUR:</strong> Platform üzerinde paylaşılan tüm sorular, metinler, fotoğraflar ve yanıtların yasal ve cezai sorumluluğu tamamen paylaşımı yapan kullanıcıya aittir. Uygunsuz, tahrif edilmiş, yanıltıcı veya hukuka aykırı içerik paylaşan kullanıcılar doğacak zararlardan doğrudan sorumludur. <strong>Tarımsal e-Danışman sosyal platformu bu konuda hiçbir hukuki ve cezai sorumluluk kabul etmez.</strong>
          </p>
          <p>
            <strong>2. CEVAPLAR YALNIZCA TAVSİYE NİTELİĞİNDEDİR:</strong> Tarımsal e-Danışman platformunda yer alan tüm cevaplar, uzman ve çiftçi görüşleri <u>tamamen genel bilgi ve tavsiye niteliğindedir</u>. Bu tavsiyelerin uygulanması sonucu tarlanızda, bahçenizde veya ürünlerinizde oluşabilecek verim kayıplarından, hastalık yayılımlarından veya beklenmeyen olumsuz durumlardan <strong>Tarımsal e-Danışmanlık platformu kesinlikle sorumlu tutulamaz.</strong>
          </p>
          <p className="font-extrabold underline text-amber-950 dark:text-amber-100">
            Platforma üye olan, soru soran veya yanıt yazan tüm kullanıcılarımız bu şartları peşinen bilerek ve kabul ederek üye olurlar.
          </p>
        </div>
      </div>

      {/* Detaylı Kurallar Maddeleri */}
      <div className="card p-6 space-y-6">
        <section className="space-y-3">
          <h3 className="text-base font-bold text-[var(--primary)] border-b border-[var(--outline-variant)] pb-2 flex items-center gap-2">
            <span>🌱 1. Zirai İlaç ve Kimyasal Kullanım Sorumluluğu</span>
          </h3>
          <p className="text-xs text-[var(--on-surface-variant)] leading-relaxed">
            Platformda önerilen bitki koruma ürünleri (pestisit, fungisit, insektisit vb.) ve gübre tavsiyeleri resmi reçete yerine geçmez. Üreticilerimiz uygulama yapmadan önce mutlaka T.C. Tarım ve Orman Bakanlığı tarafından ruhsatlandırılmış etiket bilgilerini okumalı ve bölgesel yetkili il/ilçe tarım müdürlükleri ya da ziraat mühendisleri ile istişare etmelidir. Doz aşımı ve yanlış ilaç kullanım zararlarından uygulayıcı sorumludur.
          </p>
        </section>

        <section className="space-y-3">
          <h3 className="text-base font-bold text-[var(--primary)] border-b border-[var(--outline-variant)] pb-2 flex items-center gap-2">
            <span>📸 2. Fotoğraf ve İçerik Telif Hakları</span>
          </h3>
          <p className="text-xs text-[var(--on-surface-variant)] leading-relaxed">
            Soru sorarken veya yanıt verirken yüklediğiniz fotoğrafların mülkiyet ve kullanım hakkına sahip olduğunuzu beyan etmiş olursunuz. İnternetten izinsiz alınan, başkalarına ait telifli görsellerin paylaşılması yasaktır. Telif ihlallerinden doğacak idari ve hukuki sorumluluk doğrudan paylaşımı yapan kullanıcıya aittir.
          </p>
        </section>

        <section className="space-y-3">
          <h3 className="text-base font-bold text-[var(--primary)] border-b border-[var(--outline-variant)] pb-2 flex items-center gap-2">
            <span>🤝 3. Nezaket, Saygı ve Üslup</span>
          </h3>
          <p className="text-xs text-[var(--on-surface-variant)] leading-relaxed">
            Tarımsal e-Danışman, Türkiye'deki tüm çiftçiler ve ziraat uzmanlarının dayanışma alanıdır. Hakaret, aşağılama, siyasi tartışma, argo, ticari spam ve reklam amaçlı içerikler kesinlikle yasaktır. Saygısız üslup kullanan hesaplar uyarı yapılmaksızın dondurulur veya silinir.
          </p>
        </section>

        <section className="space-y-3">
          <h3 className="text-base font-bold text-[var(--primary)] border-b border-[var(--outline-variant)] pb-2 flex items-center gap-2">
            <span>🚫 4. Hesap Askıya Alma ve İçerik Kaldırma Yetkisi</span>
          </h3>
          <p className="text-xs text-[var(--on-surface-variant)] leading-relaxed">
            Platform moderatörleri ve site yönetimi; topluluk kurallarına uymayan, şikayet edilen veya uygunsuz bulunan soru, yorum ve fotoğrafları bildirim yapmaksızın silme veya düzenleme hakkını saklı tutar. Kural ihlali gerçekleştiren kullanıcıların üyelikleri ve kazanmış oldukları bakiyeler iptal edilebilir.
          </p>
        </section>
      </div>
    </div>
  );
}
