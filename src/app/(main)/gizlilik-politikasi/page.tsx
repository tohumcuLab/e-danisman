import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Gizlilik Politikası ve KVKK | Tarımsal e-Danışman",
  description: "Tarımsal e-Danışman kişisel verilerin korunması (KVKK), çerez politikası ve gizlilik ilkeleri.",
};

export default function GizlilikPolitikasiPage() {
  return (
    <div className="container max-w-4xl py-8 space-y-8">
      {/* Header */}
      <div className="card p-6 border-l-4 border-emerald-500 bg-emerald-50/20 space-y-2">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🔒</span>
          <div>
            <h1 className="text-2xl font-extrabold text-[var(--on-surface)]">Gizlilik Politikası ve KVKK Aydınlatma Metni</h1>
            <p className="text-xs text-[var(--on-surface-variant)]">
              Kişisel verilerinizin güvenliği ve gizliliği bizim için önemlidir.
            </p>
          </div>
        </div>
      </div>

      {/* Maddeler */}
      <div className="card p-6 space-y-6 text-xs text-[var(--on-surface)] leading-relaxed">
        <section className="space-y-2">
          <h3 className="text-sm font-bold text-[var(--primary)]">1. Toplanan Kişisel Veriler</h3>
          <p className="text-[var(--on-surface-variant)]">
            Tarımsal e-Danışman platformuna üye olurken veya soru sorarken sağladığınız ad-soyad, e-posta adresi, profil fotoğrafı, il/ilçe bilgisi ile yüklediğiniz ürün görselleri güvenli sunucularımızda işlenmektedir.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="text-sm font-bold text-[var(--primary)]">2. Verilerin Kullanım Amacı</h3>
          <p className="text-[var(--on-surface-variant)]">
            Toplanan veriler; tarlanızdaki ve bahçenizdeki sorunlara doğru bölgesel ziraat çözümleri sunmak, uzman yanıtları iletmek, platform güvenliğini sağlamak ve üye profili oluşturmak amacıyla kullanılır.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="text-sm font-bold text-[var(--primary)]">3. Veri Paylaşımı ve Üçüncü Taraflar</h3>
          <p className="text-[var(--on-surface-variant)]">
            Kişisel verileriniz hiçbir şekilde üçüncü taraf pazarlama şirketlerine satılmaz veya devredilmez. Yasal zorunluluklar gereği resmi makamlarca talep edilmesi hali müstesnadır.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="text-sm font-bold text-[var(--primary)]">4. Çerezler (Cookies)</h3>
          <p className="text-[var(--on-surface-variant)]">
            Sitede oturum açmanızı sağlamak ve kullanıcı deneyimini iyileştirmek amacıyla temel düzeyde çerezler kullanılmaktadır.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="text-sm font-bold text-[var(--primary)]">5. Veri Sahibi Olarak Haklarınız (KVKK)</h3>
          <p className="text-[var(--on-surface-variant)]">
            Kullanıcılar; KVKK 11. maddesi kapsamında kişisel verilerine erişme, düzeltme veya verilerinin silinmesini (hesabını kapatma) talep etme hakkına sahiptir.
          </p>
        </section>
      </div>
    </div>
  );
}
