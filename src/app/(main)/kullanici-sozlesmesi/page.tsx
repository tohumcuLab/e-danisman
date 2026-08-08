import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Kullanıcı Sözleşmesi | Tarımsal e-Danışman",
  description: "Tarımsal e-Danışman üyelik ve hizmet şartları sözleşmesi, kullanıcı hak ve sorumlulukları.",
};

export default function KullaniciSozlesmesiPage() {
  return (
    <div className="container max-w-4xl py-8 space-y-8">
      {/* Header */}
      <div className="card p-6 border-l-4 border-[var(--primary)] bg-[var(--primary)]/5 space-y-2">
        <div className="flex items-center gap-3">
          <span className="text-3xl">⚖️</span>
          <div>
            <h1 className="text-2xl font-extrabold text-[var(--on-surface)]">Kullanıcı Sözleşmesi ve Üyelik Şartları</h1>
            <p className="text-xs text-[var(--on-surface-variant)]">
              Son Güncelleme: 30 Temmuz 2026 • Hobitohum.com Topluluk Platformu
            </p>
          </div>
        </div>
      </div>

      {/* Vurgulu Yasal Uyarı Kutusu */}
      <div className="p-5 bg-red-50 dark:bg-red-950/40 border-2 border-red-400 dark:border-red-800 rounded-2xl space-y-3 shadow-sm">
        <h2 className="text-sm font-extrabold text-red-900 dark:text-red-200 flex items-center gap-2">
          <span>🛑 KULLANICI SORUMLULUĞU VE SORUMSUZLUK BEYANI</span>
        </h2>
        <div className="text-xs text-red-950 dark:text-red-200 space-y-2 leading-relaxed font-semibold">
          <p>
            <strong>PAYLAŞIM SORUMLULUĞU:</strong> Platforma yüklenen tüm yazılı içeriklerin, soruların ve fotoğrafların hukuki, idari ve cezai sorumluluğu doğrudan içeriği oluşturan kullanıcıya aittir. <strong>Tarımsal e-Danışman ve Hobitohum.com, kullanıcılar tarafından paylaşılan içeriklerden hiçbir koşulda sorumlu tutulamaz.</strong>
          </p>
          <p>
            <strong>TAVSİYE NİTELİĞİ VE VERİM KAYIPLARI:</strong> Bu platformda ziraat uzmanları veya diğer çiftçiler tarafından verilen tüm yanıtlar, görüşler ve tedavi önerileri <strong>yalnızca tavsiye niteliğindedir</strong>. Uygulanan tavsiyeler neticesinde ortaya çıkabilecek ürün kayıpları, kuruma, verim düşüklüğü veya her türlü doğrudan/dolaylı zararlardan Tarımsal e-Danışman platformu ve yetkilileri <u>hiçbir hukuki ve mali sorumluluk kabul etmez</u>.
          </p>
        </div>
      </div>

      {/* Maddeler */}
      <div className="card p-6 space-y-6 text-xs text-[var(--on-surface)] leading-relaxed">
        <section className="space-y-2">
          <h3 className="text-sm font-bold text-[var(--primary)]">1. Taraflar ve Amaç</h3>
          <p className="text-[var(--on-surface-variant)]">
            Bu sözleşme, Tarımsal e-Danışman (Hobitohum.com) platformu ile platforma üye olan veya platformu ziyaret eden kullanıcılar arasında, sitenin kullanımına dair şartları belirlemek amacıyla akdedilmiştir.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="text-sm font-bold text-[var(--primary)]">2. Üyelik ve Hesap Güvenliği</h3>
          <p className="text-[var(--on-surface-variant)]">
            Kullanıcı, kayıt olurken doğru ve güncel bilgiler vermekle yükümlüdür. Hesap şifresinin güvenliğinden ve hesap üzerinden gerçekleştirilen tüm eylemlerden kullanıcı bizzat sorumludur.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="text-sm font-bold text-[var(--primary)]">3. İçerik, Telif ve Fikri Mülkiyet Hakları (5846 Sayılı FSEK & 6769 Sayılı SMK)</h3>
          <p className="text-[var(--on-surface-variant)]">
            Platformda yayınlanan tüm metinler, uzman yanıtları, hastalık verileri, fotoğraflar ve görseller <strong>5846 Sayılı Fikir ve Sanat Eserleri Kanunu (FSEK)</strong> uyarınca Tarımsal e-Danışman (Hobitohum.com) bünyesinde koruma altındadır. Sitedeki hiçbir içerik izinsiz kopyalanamaz, çoğaltılamaz, bot veya web scraping yöntemleriyle çekilemez. Kullanıcı, platforma yüklediği görsellerin hukuki sorumluluğunun kendisine ait olduğunu ve yayın hakkını platforma sunduğunu kabul eder. Detaylı bilgi için <Link href="/telif-ve-yasal-uyari" className="text-[var(--primary)] font-bold underline">Telif Hakları ve Yasal Uyarı</Link> sayfamızı inceleyebilirsiniz.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="text-sm font-bold text-[var(--primary)]">4. Hizmetin Sürekliliği ve Değişiklik Hakları</h3>
          <p className="text-[var(--on-surface-variant)]">
            Tarımsal e-Danışman; platform üzerindeki kredi sistemini, üyelik haklarını, sayfa tasarımlarını veya işleyiş mekanizmasını önceden haber vermeksizin değiştirme, kısıtlama veya sonlandırma hakkına sahiptir.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="text-sm font-bold text-[var(--primary)]">5. Uyuşmazlıkların Çözümü</h3>
          <p className="text-[var(--on-surface-variant)]">
            İşbu sözleşmeden doğabilecek tüm uyuşmazlıklarda Türkiye Cumhuriyeti Mahkemeleri ve İcra Daireleri yetkilidir.
          </p>
        </section>
      </div>
    </div>
  );
}
