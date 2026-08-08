import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";
import { auth } from "@/auth";
import StickyFooterBar from "@/components/layout/StickyFooterBar";
import { getActiveFeedAds, generateRandomAdPositions } from "@/lib/services/adService";
import FeedAdCard from "@/components/shared/FeedAdCard";
import LeftSidebarWidgets from "@/components/layout/LeftSidebarWidgets";
import RightSidebarWidgets from "@/components/layout/RightSidebarWidgets";

// Next.js sayfanın her ziyaretinde yeniden render edilmesini sağlamak için (ISR / Dinamik)
export const dynamic = "force-dynamic";

export default async function Home() {
  const session = await auth();

  // 1. Onaylanmış soruları getir
  const questions = await prisma.question.findMany({
    where: { status: { in: ["OPEN", "ANSWERED", "CLOSED"] } },
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, image: true, id: true } },
      category: { select: { name: true } },
      tags: { include: { tag: true } },
      _count: { select: { answers: true } },
      images: { select: { url: true } }
    }
  });

  // FEED Reklamlarını getir
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

          {/* Sorular Listesi */}
          {questions.length === 0 ? (
            <div className="card text-center p-12 text-[var(--on-surface-variant)]">
              Henüz soru sorulmamış. İlk soruyu sen sor!
            </div>
          ) : (() => {
            const adPositions = generateRandomAdPositions(questions.length, 3, 5);
            let adCounter = 0;

            return questions.map((q, index) => {
              const isAdPosition = adPositions.has(index + 1);
              const adToShow = isAdPosition && validAds.length > 0 
                ? validAds[adCounter++ % validAds.length] 
                : null;

              return (
                <div key={q.id} className="space-y-6">
                  {/* Soru Kartı */}
                  <article className="card p-5 hover:border-[var(--primary)] transition-all shadow-sm hover:shadow-md group">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/30 font-bold flex items-center justify-center text-sm shrink-0">
                          {q.user.name?.charAt(0).toUpperCase() || "U"}
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-[var(--on-surface)] group-hover:text-[var(--primary)] transition-colors">
                            {q.user.name}
                          </h4>
                          <p className="text-[11px] text-[var(--on-surface-variant)]">
                            {formatDistanceToNow(new Date(q.createdAt), { addSuffix: true, locale: tr })}
                          </p>
                        </div>
                      </div>
                    </div>

                    <Link href={`/soru/${q.id}`} className="block space-y-2">
                      <h3 className="text-lg font-bold text-[var(--on-surface)] group-hover:text-[var(--primary)] transition-colors line-clamp-2">
                        {q.title}
                      </h3>
                      <p className="text-sm text-[var(--on-surface-variant)] line-clamp-3 leading-relaxed">
                        {q.body}
                      </p>

                      {/* Soru Görselleri (Tek Görsel / Çoklu Görsel Slider) */}
                      {q.images.length === 1 && (
                        <div className="w-full h-60 rounded-xl overflow-hidden bg-[var(--surface-container-high)] mt-3">
                          <img 
                            src={q.images[0].url} 
                            alt={q.title} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                          />
                        </div>
                      )}

                      {q.images.length > 1 && (
                        <div className="mt-3 space-y-1.5">
                          <div className="flex gap-2.5 overflow-x-auto snap-x snap-mandatory scrollbar-thin py-1">
                            {q.images.map((img, imgIdx) => (
                              <div 
                                key={imgIdx} 
                                className="snap-start shrink-0 w-[85%] sm:w-[75%] h-56 rounded-xl overflow-hidden bg-[var(--surface-container-high)] border border-[var(--outline-variant)] relative group/img shadow-sm"
                              >
                                <img 
                                  src={img.url} 
                                  alt={`${q.title} - Görsel ${imgIdx + 1}`} 
                                  className="w-full h-full object-cover" 
                                />
                                <span className="absolute bottom-2.5 right-2.5 bg-black/75 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full backdrop-blur-md shadow">
                                  {imgIdx + 1} / {q.images.length} 📸
                                </span>
                              </div>
                            ))}
                          </div>
                          <div className="text-[11px] text-[var(--primary)] font-bold text-right flex items-center justify-end gap-1">
                            <span>↔️ Sağa kaydırarak tüm fotoğrafları görün ({q.images.length} Fotoğraf)</span>
                          </div>
                        </div>
                      )}

                      {/* Metin Altı: Satır 1 -> Kategori, Satır 2 -> Bitki/Ürün Türü ve Etiketler */}
                      <div className="pt-3 space-y-1.5 border-t border-[var(--outline-variant)]/50 mt-3">
                        {/* Satır 1: Kategori */}
                        <div className="flex items-center gap-2">
                          <span className="bg-[var(--primary)]/10 text-[var(--primary)] text-xs font-bold px-2.5 py-1 rounded-md">
                            📁 {q.category.name}
                          </span>
                        </div>

                        {/* Satır 2: Bitki / Ürün Türü */}
                        {(q.cropType || (q.tags && q.tags.length > 0)) && (
                          <div className="flex flex-wrap items-center gap-1.5">
                            {q.cropType && (
                              <span className="bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs font-semibold px-2.5 py-1 rounded-md">
                                🌱 {q.cropType}
                              </span>
                            )}
                            {q.tags && q.tags.map((t: any, idx: number) => (
                              <span key={idx} className="bg-[var(--surface-container-high)] text-[var(--on-surface-variant)] text-[11px] font-medium px-2 py-0.5 rounded-md border border-[var(--outline-variant)]">
                                #{t.tag?.name || t.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </Link>

                    {/* Kart Altı Bilgiler & Butonlar */}
                    <div className="mt-4 pt-3 border-t border-[var(--outline-variant)] flex items-center justify-between text-xs text-[var(--on-surface-variant)]">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1 font-semibold text-[var(--primary)]">
                          💬 {q._count.answers} Yanıt
                        </span>
                        {(q.city || q.district) && (
                          <span className="flex items-center gap-1">
                            📍 {q.city} {q.district && `, ${q.district}`}
                          </span>
                        )}
                      </div>

                      <Link href={`/soru/${q.id}`} className="font-bold text-[var(--primary)] hover:underline flex items-center gap-1">
                        Cevapla & İncele ➔
                      </Link>
                    </div>
                  </article>

                  {/* Sponsorlu Reklam Kartı */}
                  {adToShow && <FeedAdCard ad={adToShow} />}
                </div>
              );
            });
          })()}
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
