import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { getActiveFeedAds } from "@/lib/services/adService";
import LeftSidebarWidgets from "@/components/layout/LeftSidebarWidgets";
import RightSidebarWidgets from "@/components/layout/RightSidebarWidgets";
import CategoryQuestionFeed from "@/components/home/CategoryQuestionFeed";

// Next.js sayfanın her ziyaretinde yeniden render edilmesini sağlamak için (ISR / Dinamik)
export const dynamic = "force-dynamic";

export default async function Home() {
  const session = await auth();

  // 1. Kategorileri veritabanından çek (Order sırasına göre)
  let categories = await prisma.category.findMany({
    orderBy: { order: "asc" }
  });

  // Varsayılan kategoriler henüz yoksa otomatik oluştur
  if (categories.length === 0) {
    const defaultCategories = [
      { name: "Hastalıklar", slug: "hastaliklar", description: "Bitkilerdeki mantar, bakteri ve virüs hastalıkları", icon: "🍂", order: 1 },
      { name: "Zararlılar", slug: "zararlilar", description: "Böcek, akar ve diğer zararlılar", icon: "🐛", order: 2 },
      { name: "Beslenme Eksikliği", slug: "beslenme-eksikligi", description: "Makro ve mikro besin elementi eksiklikleri", icon: "🌾", order: 3 },
      { name: "Yabancı Otlar", slug: "yabanci-otlar", description: "İstenmeyen otlar ve mücadele yöntemleri", icon: "🌿", order: 4 },
      { name: "Emin Değilim", slug: "emin-degilim", description: "Hastalık veya zararlı türünden emin olamadığınız durumlar", icon: "❓", order: 5 },
      { name: "Diğer", slug: "diger", description: "Diğer tarımsal sorunlar", icon: "📁", order: 99 }
    ];

    await prisma.category.createMany({
      data: defaultCategories
    });

    categories = await prisma.category.findMany({
      orderBy: { order: "asc" }
    });
  }

  // "Diğer" kategorisini her zaman listenin sonuna yerleştir
  categories = [...categories].sort((a, b) => {
    if (a.name === "Diğer" || a.slug === "diger") return 1;
    if (b.name === "Diğer" || b.slug === "diger") return -1;
    return (a.order || 0) - (b.order || 0);
  });

  // 2. Onaylanmış soruları getir
  const questions = await prisma.question.findMany({
    where: { status: { in: ["OPEN", "ANSWERED", "CLOSED"] } },
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, image: true, id: true } },
      category: { select: { id: true, name: true, slug: true, icon: true } },
      tags: { include: { tag: true } },
      _count: { select: { answers: true } },
      images: { select: { url: true }, orderBy: { order: "asc" } }
    }
  });

  // 3. FEED Reklamlarını getir
  const validAds = await getActiveFeedAds();

  return (
    <div className="container py-6">
      <div className="grid grid-cols-12 gap-6">
        
        {/* Sol Kolon (Masaüstü): Hoş Geldiniz & Hava Durumu & Etiketler */}
        <LeftSidebarWidgets />

        {/* Orta Kolon: Soru Sor Butonu, Banner ve Ana Soru Akışı */}
        <section className="col-span-12 lg:col-span-6 space-y-6">
          {/* Premium / Kredi Banner */}
          <div className="bg-gradient-to-r from-[var(--primary)] to-[var(--primary-container)] rounded-2xl p-6 text-white shadow-lg flex items-center justify-between relative overflow-hidden">
            <div className="z-10 max-w-[70%]">
              <h3 className="font-bold text-lg mb-1">🎁 Ücretsiz Kredi Kazan!</h3>
              <p className="text-xs opacity-90">Kısa reklam videoları izleyerek soru sorma kredisi kazanın.</p>
            </div>
            <Link 
              href="/kredi-kazan" 
              className="z-10 bg-white text-[var(--primary)] font-bold px-4 py-2 rounded-xl text-xs shadow hover:bg-gray-100 transition-colors shrink-0"
            >
              KREDİ KAZAN
            </Link>
          </div>

          {/* Soru Sor Kısa Yolu - Çarpıcı #d26e4b Kutusu */}
          <Link href="/soru/sor" className="block group">
            <div className="bg-[#d26e4b] hover:bg-[#c05d3b] transition-all rounded-2xl p-5 md:p-6 text-white shadow-lg hover:shadow-xl border border-[#b85b3a] relative overflow-hidden">
              {/* Arka plan dekoratif filigran ikon */}
              <div className="absolute -right-4 -bottom-4 text-white/10 text-8xl font-black pointer-events-none select-none">
                📸
              </div>

              <div className="relative z-10 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="bg-white/20 p-2 rounded-xl text-xl shrink-0 shadow-inner">🌱</span>
                    <h3 className="font-extrabold text-base md:text-lg text-white">Uzmana Danışın</h3>
                  </div>
                  <span className="bg-white text-[#d26e4b] font-extrabold text-xs px-3.5 py-1.5 rounded-full shadow group-hover:scale-105 transition-transform flex items-center gap-1">
                    <span>Soru Sor</span>
                    <span>➔</span>
                  </span>
                </div>

                <div className="bg-white/15 hover:bg-white/25 border border-white/30 rounded-xl p-3.5 flex items-center gap-3 transition-colors">
                  <span className="text-xl shrink-0">📸</span>
                  <p className="text-xs md:text-sm font-medium text-white/95 leading-snug">
                    Tarlanızda, bahçenizde gördüğünüz sorunları birkaç fotoğraf ile buradan paylaşın.
                  </p>
                </div>
              </div>
            </div>
          </Link>

          {/* Soru Sorma Kutusunun Hemen Altında: Yatay Kategori Slider'ı & Dinamik Soru Akışı */}
          <CategoryQuestionFeed 
            categories={categories} 
            initialQuestions={questions as any} 
            ads={validAds as any} 
          />
        </section>

        {/* Sağ Kolon: En Çok Okunanlar & Cevap Bekleyenler */}
        <RightSidebarWidgets />

      </div>

      {/* Footer Öncesi Geniş Hava Durumu & Ekim Tavsiye Barları */}
      <div className="mt-8 card p-6 border-l-4 border-amber-500 bg-amber-50/20 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
        <div className="flex items-center gap-4">
          <span className="text-5xl shrink-0">☀️</span>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-xs font-extrabold text-[var(--on-surface-variant)] uppercase tracking-wider">CANLI HAVA DURUMU</p>
              <span className="text-[10px] bg-amber-500 text-white font-bold px-2 py-0.5 rounded-full">BUGÜN</span>
            </div>
            <h3 className="text-3xl font-extrabold text-[var(--on-surface)] mt-0.5">24°C <span className="text-sm font-normal text-[var(--on-surface-variant)]">/ Güneşli</span></h3>
            <p className="text-xs text-[var(--on-surface-variant)] mt-1">Nem: %45 • Rüzgar: 12 km/s • Toprak Sıcaklığı: 18°C</p>
          </div>
        </div>

        <div className="bg-[var(--surface-container-lowest)] p-4 rounded-xl border border-[var(--outline-variant)] shadow-sm max-w-md w-full">
          <div className="text-xs font-bold text-[var(--primary)] flex items-center gap-1.5 mb-1">
            <span>🌱 GÜNÜN TARIMSAL TAVSİYESİ</span>
          </div>
          <p className="text-xs text-[var(--on-surface)] font-medium leading-relaxed">
            Hava sıcaklığı domates, biber ve patlıcan fidelerinin tarlaya aktarılması için ideal seviyededir. Akşam üzeri sulama yapılması tavsiye edilir.
          </p>
        </div>
      </div>
    </div>
  );
}
