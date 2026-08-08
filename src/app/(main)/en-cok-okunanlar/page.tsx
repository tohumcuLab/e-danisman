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
  title: "En Çok Okunan Sorular | Tarımsal e-Danışman",
  description: "Tarımsal e-Danışman platformundaki en çok okunan ve ilgi gören çiftçi soruları.",
};

export default async function EnCokOkunanlarPage({
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
      where: { status: { in: ["OPEN", "ANSWERED", "CLOSED"] } },
      skip,
      take: pageSize,
      orderBy: [
        { viewCount: "desc" },
        { answers: { _count: "desc" } },
        { createdAt: "desc" }
      ],
      include: {
        user: { select: { name: true, image: true, id: true } },
        category: { select: { name: true } },
        images: { orderBy: { order: "asc" } },
        _count: { select: { answers: true } }
      }
    }),
    prisma.question.count({ where: { status: { in: ["OPEN", "ANSWERED", "CLOSED"] } } }),
    getActiveFeedAds()
  ]);

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="container max-w-7xl py-6">
      <div className="grid grid-cols-12 gap-6">
        
        {/* Sol Kolon: Hoş Geldiniz & Etiketler */}
        <LeftSidebarWidgets />

        {/* Orta Kolon: En Çok Okunanlar Ana İçeriği */}
        <section className="col-span-12 lg:col-span-6 space-y-6">
          {/* Header */}
          <div className="card p-6 border-l-4 border-amber-500 bg-amber-50/20">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🔥</span>
              <div>
                <h1 className="text-2xl font-extrabold text-[var(--on-surface)]">En Çok Okunan Sorular</h1>
                <p className="text-xs text-[var(--on-surface-variant)] mt-0.5">
                  Üreticiler ve ziraat mühendisleri tarafından en çok incelenen ve tartışılan konular.
                </p>
              </div>
            </div>
          </div>

          {/* Soru Akışı */}
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
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1 font-semibold text-[var(--primary)]">
                            💬 {q._count.answers} Yanıt
                          </span>
                          <span className="flex items-center gap-1 font-medium text-amber-600 dark:text-amber-400">
                            👁️ {q.viewCount} Okunma
                          </span>
                        </div>

                        <Link href={`/soru/${q.id}`} className="font-bold text-[var(--primary)] hover:underline flex items-center gap-1">
                          İncele & Cevapla ➔
                        </Link>
                      </div>
                    </article>

                    {adToShow && <FeedAdCard ad={adToShow} />}
                  </div>
                );
              });
            })()}
          </div>

          {/* Sayfalama / Lazyload (Pagination) */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              {page > 1 && (
                <Link
                  href={`/en-cok-okunanlar?page=${page - 1}`}
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
                  href={`/en-cok-okunanlar?page=${page + 1}`}
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
