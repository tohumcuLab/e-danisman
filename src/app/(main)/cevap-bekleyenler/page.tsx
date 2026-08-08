import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";
import type { Metadata } from "next";
import LeftSidebarWidgets from "@/components/layout/LeftSidebarWidgets";
import RightSidebarWidgets from "@/components/layout/RightSidebarWidgets";
import { getActiveFeedAds, generateRandomAdPositions } from "@/lib/services/adService";
import FeedAdCard from "@/components/shared/FeedAdCard";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Cevap Bekleyen Sorular | Tarımsal e-Danışman",
  description: "Henüz yanıtlanmamış ve ziraat uzmanlarının cevabını bekleyen çiftçi soruları.",
};

export default async function CevapBekleyenlerPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const resolvedParams = await searchParams;
  const page = parseInt(resolvedParams.page || "1", 10);
  const pageSize = 15;
  const skip = (page - 1) * pageSize;

  const [questions, totalCount, feedAds] = await Promise.all([
    prisma.question.findMany({
      where: {
        status: "OPEN",
        answers: { none: {} }
      },
      skip,
      take: pageSize,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, image: true, id: true } },
        category: { select: { name: true } },
        images: { orderBy: { order: "asc" } },
        _count: { select: { answers: true } }
      }
    }),
    prisma.question.count({
      where: {
        status: "OPEN",
        answers: { none: {} }
      }
    }),
    getActiveFeedAds()
  ]);

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="container max-w-7xl py-6">
      <div className="grid grid-cols-12 gap-6">
        
        {/* Sol Kolon: Hoş Geldiniz & Etiketler */}
        <LeftSidebarWidgets />

        {/* Orta Kolon: Cevap Bekleyen Sorular Ana İçeriği */}
        <section className="col-span-12 lg:col-span-6 space-y-6">
          {/* Header */}
          <div className="card p-6 border-l-4 border-amber-500 bg-amber-50/20">
            <div className="flex items-center gap-3">
              <span className="text-3xl">⏳</span>
              <div>
                <h1 className="text-2xl font-extrabold text-[var(--on-surface)]">Cevap Bekleyen Sorular</h1>
                <p className="text-xs text-[var(--on-surface-variant)] mt-0.5">
                  Üreticilerimizin sorduğu ancak henüz ziraat uzmanı veya yanıt almamış sorular.
                </p>
              </div>
            </div>
          </div>

          {/* Soru Akışı */}
          {questions.length === 0 ? (
            <div className="card p-12 text-center text-sm text-[var(--on-surface-variant)]">
              🎉 Harika! Şu anda yanıt bekleyen cevapsız soru bulunmamaktadır.
            </div>
          ) : (
            <div className="space-y-4">
              {(() => {
                const adPositions = generateRandomAdPositions(questions.length, 3, 5);
                let adCounter = 0;

                return questions.map((q, index) => {
                  const isAdPosition = adPositions.has(index + 1);
                  const adToShow = isAdPosition && feedAds.length > 0
                    ? feedAds[adCounter++ % feedAds.length]
                    : null;

                  return (
                    <div key={q.id} className="space-y-4">
                    <article className="card p-5 hover:border-[var(--primary)] transition-all shadow-sm group">
                      <div className="flex items-center justify-between mb-3">
                        <Link href={`/kullanici/${q.user.id}`} className="flex items-center gap-3 group/user">
                          <div className="w-10 h-10 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/30 font-bold flex items-center justify-center text-sm shrink-0">
                            {q.user.name?.charAt(0).toUpperCase() || "U"}
                          </div>
                          <div>
                            <h4 className="font-bold text-sm text-[var(--on-surface)] group-hover/user:text-[var(--primary)] transition-colors">
                              {q.user.name}
                            </h4>
                            <p className="text-[11px] text-[var(--on-surface-variant)]">
                              {formatDistanceToNow(new Date(q.createdAt), { addSuffix: true, locale: tr })}
                            </p>
                          </div>
                        </Link>
                      </div>

                      <Link href={`/soru/${q.id}`} className="block space-y-2">
                        <h3 className="text-lg font-bold text-[var(--on-surface)] group-hover:text-[var(--primary)] transition-colors truncate w-full">
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
                          {q.cropType && (
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs font-semibold px-2.5 py-1 rounded-md">
                                🌱 {q.cropType}
                              </span>
                            </div>
                          )}
                        </div>
                      </Link>

                      <div className="mt-4 pt-3 border-t border-[var(--outline-variant)] flex items-center justify-between text-xs text-[var(--on-surface-variant)]">
                        <div className="flex items-center gap-3">
                          <Link href={`/soru/${q.id}`} className="font-bold text-[var(--primary)] bg-[var(--primary)]/10 px-3 py-1.5 rounded-xl hover:bg-[#006537] hover:text-white transition-all flex items-center gap-1">
                            İlk Cevabı Sen Ver ➔
                          </Link>
                          {(q.city || q.district) && (
                            <span className="flex items-center gap-1 font-medium bg-[var(--surface-container-high)] px-2.5 py-1 rounded-md">
                              📍 {q.city} {q.district && `, ${q.district}`}
                            </span>
                          )}
                        </div>

                        {/* EN SAĞDA SADECE ÇİFT BALONLU İKON */}
                        <svg 
                          className="w-5 h-5 text-gray-800 dark:text-white shrink-0 ml-auto" 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          stroke="currentColor" 
                          strokeWidth="1.8" 
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                        >
                          <title>Cevap Bekliyor</title>
                          <path d="M7.5 15.5L4.5 16.5L5.2 13.8C4.2 12.9 3.5 11.5 3.5 10C3.5 7.2 5.7 5 8.5 5C11.3 5 13.5 7.2 13.5 10C13.5 12.8 11.3 15 8.5 15C8.1 15 7.8 15 7.5 15.5Z" />
                          <line x1="6.5" y1="8.5" x2="10.5" y2="8.5" />
                          <line x1="6.5" y1="11" x2="10.5" y2="11" />
                          <path d="M13.5 8.2C14.1 8 14.8 7.9 15.5 7.9C18.5 7.9 21 10.1 21 12.9C21 14.3 20.2 15.6 19 16.5L19.6 19.2L16.8 18.3C16.4 18.4 15.9 18.5 15.5 18.5C12.5 18.5 10 16.3 10 13.5" />
                          <path d="M14.8 11.2C14.8 10.4 15.5 9.7 16.3 9.7C17.1 9.7 17.8 10.4 17.8 11.2C17.8 12.2 16.3 12.4 16.3 13.7" />
                          <circle cx="16.3" cy="15.8" r="0.5" fill="currentColor" />
                        </svg>
                      </div>
                    </article>

                    {adToShow && <FeedAdCard ad={adToShow} />}
                  </div>
                );
              });
            })()}
            </div>
          )}

          {/* Sayfalama / Lazyload (Pagination) */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              {page > 1 && (
                <Link
                  href={`/cevap-bekleyenler?page=${page - 1}`}
                  className="btn bg-[var(--surface-container-high)] text-xs font-bold px-4 py-2 rounded-xl border border-[var(--outline-variant)] hover:bg-[var(--primary)] hover:text-white transition-colors"
                >
                  ← Önceki Sayfa
                </Link>
              )}

              <span className="text-xs font-bold px-4 py-2 bg-[var(--surface-container)] rounded-xl border border-[var(--outline-variant)]">
                Sayfa {page} / {totalPages}
              </span>

              {page < totalPages && (
                <Link
                  href={`/cevap-bekleyenler?page=${page + 1}`}
                  className="btn bg-[var(--surface-container-high)] text-xs font-bold px-4 py-2 rounded-xl border border-[var(--outline-variant)] hover:bg-[var(--primary)] hover:text-white transition-colors"
                >
                  Sonraki Sayfa →
                </Link>
              )}
            </div>
          )}
        </section>

        {/* Sağ Kolon: 3 Yan Bar Kutusu */}
        <RightSidebarWidgets />
      </div>
    </div>
  );
}
