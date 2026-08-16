import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Gizlilik Politikası, KVKK ve Çerez İlkeleri | Tarımsal e-Danışman",
  description: "Tarımsal e-Danışman kişisel verilerin korunması (KVKK), Google AdSense reklam çerezleri ve gizlilik ilkeleri.",
};

export default function GizlilikPolitikasiPage() {
  return (
    <div className="container max-w-4xl py-8 space-y-8">
      {/* Header */}
      <div className="card p-6 border-l-4 border-emerald-500 bg-emerald-50/20 space-y-2">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🔒</span>
          <div>
            <h1 className="text-2xl font-extrabold text-[var(--on-surface)]">Gizlilik Politikası, KVKK ve Çerez Bildirimi</h1>
            <p className="text-xs text-[var(--on-surface-variant)]">
              Kişisel verilerinizin güvenliği, gizliliği ve reklam ortaklarımızın veri işleme standartları hakkında bilgilendirme.
            </p>
          </div>
        </div>
      </div>

      {/* Maddeler */}
      <div className="card p-6 md:p-8 space-y-6 text-xs text-[var(--on-surface)] leading-relaxed">
        
        <section className="space-y-2">
          <h2 className="text-sm font-bold text-[var(--primary)]">1. Genel Bilgilendirme ve Veri Sorumlusu</h2>
          <p className="text-[var(--on-surface-variant)]">
            Tarımsal e-Danışman (hobitohum.com), kullanıcılarının gizliliğine ve kişisel verilerinin korunmasına azami özen göstermektedir. Bu metin, 6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) ile uluslararası gizlilik standartlarına (GDPR) ve Google yayıncı politikalarına tam uyumlu olarak hazırlanmıştır.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-[var(--primary)]">2. Toplanan Kişisel Veriler</h2>
          <p className="text-[var(--on-surface-variant)]">
            Platformumuza üye olurken veya soru sorarken sağladığınız ad-soyad, e-posta adresi, profil fotoğrafı, il/ilçe/köy lokasyon bilgisi ile yüklediğiniz ürün ve tarla fotoğrafları güvenli sunucularımızda işlenmektedir. Bu veriler sadece tarımsal danışmanlık hizmetinin sunulması, uzman yanıtlarının iletilmesi ve platform güvenliğinin temini için kullanılır.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-[var(--primary)]">3. Google AdSense ve Reklam Çerezleri (Cookies)</h2>
          <p className="text-[var(--on-surface-variant)]">
            Sitemizde Google ve diğer üçüncü taraf reklam sağlayıcılarının reklam teknolojileri kullanılmaktadır. Google AdSense ve bağlı reklam ağlarının çerez kullanımı ile ilgili hususlar şunlardır:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-[var(--on-surface-variant)]">
            <li>
              <strong>Üçüncü Taraf Satıcılar ve Çerezler:</strong> Google dahil olmak üzere üçüncü taraf satıcılar, kullanıcıların web sitemize veya internetteki diğer web sitelerine yaptığı önceki ziyaretlere dayalı olarak reklam yayınlamak için çerezler (cookies) kullanır.
            </li>
            <li>
              <strong>DoubleClick DART Çerezleri:</strong> Google'ın reklam çerezlerini kullanması, Google ve iş ortaklarının kullanıcılarımıza sitemize ve/veya internetteki diğer sitelere yaptıkları ziyaretlere dayalı olarak kişiselleştirilmiş reklamlar sunmasına olanak tanır.
            </li>
            <li>
              <strong>Kişiselleştirilmiş Reklamları Devre Dışı Bırakma:</strong> Kullanıcılar, <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer" className="text-[var(--primary)] font-bold underline">Google Reklam Ayarları (Ads Settings)</a> sayfasını ziyaret ederek kişiselleştirilmiş reklamcılığı diledikleri zaman devre dışı bırakabilirler.
            </li>
            <li>
              Alternatif olarak kullanıcılar, <a href="https://www.aboutads.info/choices/" target="_blank" rel="noopener noreferrer" className="text-[var(--primary)] font-bold underline">www.aboutads.info</a> adresini ziyaret ederek üçüncü taraf satıcıların kişiselleştirilmiş reklamcılık için çerez kullanımını kapatabilirler.
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-[var(--primary)]">4. Çerezlerin Yönetimi ve Tarayıcı Ayarları</h2>
          <p className="text-[var(--on-surface-variant)]">
            Tarayıcınızın ayarlarını değiştirerek çerezlerin kaydedilmesini engelleyebilir, mevcut çerezleri silebilir veya bir çerez gönderildiğinde uyarı alabilirsiniz. Ancak temel oturum çerezlerinin kapatılması, platformumuzdaki soru sorma ve yanıtlama gibi bazı üyelik fonksiyonlarının düzgün çalışmasını engelleyebilir.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-[var(--primary)]">5. Veri Paylaşımı ve Güvenlik</h2>
          <p className="text-[var(--on-surface-variant)]">
            Kişisel verileriniz hiçbir koşulda ticari amaçla üçüncü taraflara satılmaz, kiralanmaz veya izniniz dışında paylaşılmaz. Verileriniz endüstri standardı güvenlik duvarları ve şifreleme yöntemleri ile korunmaktadır.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-[var(--primary)]">6. Veri Sahibi Hakları (KVKK 11. Madde)</h2>
          <p className="text-[var(--on-surface-variant)]">
            KVKK'nın 11. maddesi uyarınca kullanıcılarımız; kişisel verilerinin işlenip işlenmediğini öğrenme, işlenmişse bilgi talep etme, yanlış veya eksik verilerin düzeltilmesini isteme ve verilerinin silinmesini talep etme hakkına sahiptir. Talepleriniz için <Link href="/iletisim" className="text-[var(--primary)] font-bold underline">İletişim Sayfamız</Link> üzerinden bize her zaman ulaşabilirsiniz.
          </p>
        </section>

        <div className="pt-4 border-t border-[var(--outline-variant)]/60 text-[11px] text-[var(--on-surface-variant)] flex items-center justify-between">
          <span>Son Güncelleme: 16 Ağustos 2026</span>
          <Link href="/" className="font-bold text-[var(--primary)] hover:underline">
            Ana Sayfaya Dön ➔
          </Link>
        </div>
      </div>
    </div>
  );
}
