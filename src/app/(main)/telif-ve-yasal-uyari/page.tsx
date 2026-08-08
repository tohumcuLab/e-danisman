import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Fikri Mülkiyet, Telif Hakları ve Yasal Uyarı | Tarımsal e-Danışman",
  description: "Tarımsal e-Danışman platformundaki metin, fotoğraf, video ve medya içeriklerinin 5846 sayılı FSEK kapsamındaki telif ve koruma şartları.",
};

export default function TelifVeYasalUyariPage() {
  return (
    <div className="container max-w-4xl py-8 space-y-8">
      {/* Header */}
      <div className="card p-6 border-l-4 border-[var(--primary)] bg-[var(--primary)]/5 space-y-2">
        <div className="flex items-center gap-3">
          <span className="text-3xl">⚖️</span>
          <div>
            <h1 className="text-2xl font-extrabold text-[var(--on-surface)]">
              Fikri Mülkiyet, Telif Hakları ve Yasal Koruma
            </h1>
            <p className="text-xs text-[var(--on-surface-variant)]">
              5846 Sayılı Fikir ve Sanat Eserleri Kanunu (FSEK) ve 6769 Sayılı Sınai Mülkiyet Kanunu (SMK) Uyarınca Yasal Bildirim
            </p>
          </div>
        </div>
      </div>

      {/* Kırmızı Vurgulu Telif İhlali Uyarısı */}
      <div className="p-5 bg-red-50 dark:bg-red-950/40 border-2 border-red-400 dark:border-red-800 rounded-2xl space-y-3 shadow-sm">
        <h2 className="text-sm font-extrabold text-red-900 dark:text-red-200 flex items-center gap-2">
          <span>🛑 İZİNSİZ KULLANIM VE KOPYALAMA YASAĞI UYARISI</span>
        </h2>
        <div className="text-xs text-red-950 dark:text-red-200 space-y-2 leading-relaxed font-semibold">
          <p>
            <strong>Telif Hakkı Koruması:</strong> <strong>Tarımsal e-Danışman (Hobitohum.com)</strong> üzerinde yayınlanan tüm makaleler, sorular, uzman teşhis ve tedavi yanıtları, kullanıcı fotoğrafları, videolar, özgün arayüz tasarımları, grafikler ve yazılım kodları <strong>5846 Sayılı Fikir ve Sanat Eserleri Kanunu (FSEK)</strong> hükümlerince koruma altındadır.
          </p>
          <p>
            <strong>Yasal Yaptırımlar:</strong> Sitemizdeki hiçbir içerik veya medya dosyası; yazılı izin alınmaksızın başka bir web sitesinde, mobil uygulamada, sosyal medya hesabında veya basılı yayında kopyalanamaz, çoğaltılamaz, dağıtılamaz veya yayınlanamaz. <strong>FSEK 71. Maddesi uyarınca izinsiz eser kullanımı gerçekleştiren şahıs ve kurumlar hakkında 1 yıldan 5 yıla kadar hapis veya adli para cezası talebiyle hukuki ve cezai süreç başlatılır.</strong>
          </p>
        </div>
      </div>

      {/* Detaylı Yasal Maddeler */}
      <div className="card p-6 space-y-6 text-xs text-[var(--on-surface)] leading-relaxed">
        
        {/* Maddeler 1 */}
        <section className="space-y-2">
          <h3 className="text-sm font-bold text-[var(--primary)] flex items-center gap-2">
            <span>1. Yasal Dayanaklar ve Eser Niteliği</span>
          </h3>
          <p className="text-[var(--on-surface-variant)]">
            Platformumuzda sunulan ziraat uzmanı yanıtları, bitki hastalıkları veri tabanı, soru-cevap arşivleri ve yüklenen tüm medya içerikleri; derleme, bilgi işleme ve özgün içerik oluşturma süreçlerinden geçtiği için 5846 Sayılı FSEK uyarınca "İlim ve Edebiyat Eseri" ile "İşleme ve Derlemeler" kapsamında değerlendirilir.
          </p>
        </section>

        {/* Maddeler 2 */}
        <section className="space-y-2">
          <h3 className="text-sm font-bold text-[var(--primary)] flex items-center gap-2">
            <span>2. Görsel ve Medya Dosyalarının Korunması (Fotoğraf & Video)</span>
          </h3>
          <p className="text-[var(--on-surface-variant)]">
            Çiftçilerimiz ve ziraat uzmanlarımız tarafından platforma yüklenen bitki hastalığı fotoğrafları ve teşhis görselleri platform bünyesinde lisanslanmıştır. Fotoğrafların filigranlı (watermark) veya filigransız hallerinin indirilip başka mecralarda izinsiz kullanılması, taranması veya veri seti (AI/ML eğitimi vb.) oluşturmak amacıyla çekilmesi yasaktır.
          </p>
        </section>

        {/* Maddeler 3 */}
        <section className="space-y-2">
          <h3 className="text-sm font-bold text-[var(--primary)] flex items-center gap-2">
            <span>3. Bot, Web Scraping ve Otomatik Veri Çekme Yasağı</span>
          </h3>
          <p className="text-[var(--on-surface-variant)]">
            Arama motorlarının indeksleme botları (Googlebot vb.) haricinde; üçüncü taraf botlar, veri kazıma (scraping) yazılımları, veri çekme botları veya yapay zeka eğitim araçlarıyla sitemizden otomatik veri çekilmesi kesinlikle yasalara aykırıdır. Tespiti durumunda IP engelleme, erişim kısıtlama ve sunucu loglarıyla Cumhuriyet Başsavcılıklarına erişim engelleme ve suç duyurusunda bulunulur.
          </p>
        </section>

        {/* Maddeler 4 */}
        <section className="space-y-2">
          <h3 className="text-sm font-bold text-[var(--primary)] flex items-center gap-2">
            <span>4. Alıntı Yapma ve Kaynak Gösterme Kuralları</span>
          </h3>
          <p className="text-[var(--on-surface-variant)]">
            Sitemizdeki sorulardan veya uzman yanıtlarından ticari olmayan amaçlarla alıntı yapılması yalnızca aşağıdaki şartların eksiksiz yerine getirilmesi halinde mümkündür:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-[var(--on-surface-variant)]">
            <li>Alıntı yapılan metin orijinal içeriğin %10'unu geçemez.</li>
            <li>Alıntının hemen altında veya sonunda tıklanabilir şekilde <code>https://www.hobitohum.com</code> veya ilgili soru sayfasının tam adresi (URL) kaynak olarak belirtilmek zorundadır.</li>
            <li>Görsel ve fotoğraflar hiçbir şart altında kaynak gösterilse dahi başka sitede doğrudan yayınlanamaz (doğrudan bağlantı embed hariç).</li>
          </ul>
        </section>

        {/* Maddeler 5 */}
        <section className="space-y-2">
          <h3 className="text-sm font-bold text-[var(--primary)] flex items-center gap-2">
            <span>5. Marka Koruması (6769 Sayılı SMK)</span>
          </h3>
          <p className="text-[var(--on-surface-variant)]">
            "Tarımsal e-Danışman" ismi, logosu, kurumsal renk kombinasyonları ve sloganı 6769 Sayılı Sınai Mülkiyet Kanunu uyarınca korunmaktadır. Üçüncü şahıslar iltisaklı veya taklit isimlerle benzer hizmet veremez, markamızı zedeleyici veya karıştırılmaya yol açacak şekilde kullanamaz.
          </p>
        </section>

        {/* Maddeler 6 */}
        <section className="space-y-2">
          <h3 className="text-sm font-bold text-[var(--primary)] flex items-center gap-2">
            <span>6. Telif İhlali Bildirimi (Uyar-Kaldır / Take-Down Notice)</span>
          </h3>
          <p className="text-[var(--on-surface-variant)]">
            Telif hakkı sahibi olduğunuz bir içeriğin sitemizde izinsiz paylaşıldığını düşünüyorsanız, hak sahipliği belgelerinizle birlikte hak ihlali bildirimini <Link href="/iletisim" className="text-[var(--primary)] font-bold underline">İletişim Sayfamız</Link> üzerinden iletebilirsiniz. Bildirimleriniz en geç 3 iş günü içerisinde değerlendirilip yasal gereği yapılır.
          </p>
        </section>

      </div>
    </div>
  );
}
