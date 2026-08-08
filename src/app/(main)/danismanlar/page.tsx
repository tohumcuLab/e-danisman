import { prisma } from "@/lib/prisma";
import Link from "next/link";
import type { Metadata } from "next";
import LeftSidebarWidgets from "@/components/layout/LeftSidebarWidgets";
import RightSidebarWidgets from "@/components/layout/RightSidebarWidgets";
import { getActiveFeedAds, generateRandomAdPositions } from "@/lib/services/adService";
import FeedAdCard from "@/components/shared/FeedAdCard";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "En Aktif Danışmanlar | Tarımsal e-Danışman",
  description: "Topluluğumuzun en aktif, en çok katkı sağlayan ziraat danışmanları ve kullanıcıları.",
};

export default async function DanismanlarPage() {
  const [topUsers, feedAds] = await Promise.all([
    prisma.user.findMany({
      take: 100,
      orderBy: [
        { credits: "desc" },
        { createdAt: "asc" }
      ],
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        avatarUrl: true,
        role: true,
        credits: true,
        bio: true,
        _count: {
          select: {
            questions: true,
            answers: true
          }
        }
      }
    }),
    getActiveFeedAds()
  ]);

  return (
    <div className="container max-w-7xl py-6">
      <div className="grid grid-cols-12 gap-6">
        
        {/* Sol Kolon: Hoş Geldiniz & Etiketler */}
        <LeftSidebarWidgets />

        {/* Orta Kolon: En Aktif Danışmanlar Ana İçeriği */}
        <section className="col-span-12 lg:col-span-6 space-y-6">
          {/* Header */}
          <div className="card p-6 border-l-4 border-[var(--primary)] bg-gradient-to-r from-[var(--primary)]/10 to-transparent">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">🏆</span>
              <div>
                <h1 className="text-2xl font-extrabold text-[var(--on-surface)]">En Aktif Danışmanlar (İlk 100)</h1>
                <p className="text-xs text-[var(--on-surface-variant)] mt-0.5">
                  Tarımsal e-Danışman topluluğuna en çok katkı sağlayan uzmanlarımız ve üreticilerimiz.
                </p>
              </div>
            </div>
          </div>

          {/* Liderlik Tablosu Listesi */}
          <div className="space-y-3">
            {(() => {
              const adPositions = generateRandomAdPositions(topUsers.length, 3, 5);
              let adCounter = 0;

              return topUsers.map((user, index) => {
                const rank = index + 1;
                const isTop3 = rank <= 3;
                const crown = rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : null;
                const isAdPosition = adPositions.has(index + 1);
                const adToShow = isAdPosition && feedAds.length > 0
                  ? feedAds[adCounter++ % feedAds.length]
                  : null;

                return (
                  <div key={user.id} className="space-y-3">
                  <Link href={`/kullanici/${user.id}`} className="block group">
                    <div className={`card p-4 flex items-center justify-between gap-4 transition-all hover:border-[var(--primary)] ${
                      isTop3 ? 'bg-[var(--primary)]/5 border-2 border-[var(--primary)]/40 shadow-sm' : ''
                    }`}>
                      {/* Sıra & Profil Bilgisi */}
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className={`w-8 text-center font-extrabold text-sm shrink-0 ${
                          rank === 1 ? 'text-amber-500 text-lg' : rank === 2 ? 'text-gray-400 text-base' : rank === 3 ? 'text-amber-700 text-base' : 'text-[var(--on-surface-variant)]'
                        }`}>
                          {crown || `#${rank}`}
                        </div>

                        {user.image || user.avatarUrl ? (
                          <img 
                            src={user.image || user.avatarUrl || ''} 
                            alt={user.name || "Kullanıcı"} 
                            className="w-12 h-12 rounded-full object-cover border-2 border-[var(--primary)]/30 shrink-0" 
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-[var(--primary)] text-white font-extrabold flex items-center justify-center text-lg shrink-0 shadow">
                            {user.name?.charAt(0).toUpperCase() || "U"}
                          </div>
                        )}

                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-bold text-sm text-[var(--on-surface)] group-hover:text-[var(--primary)] transition-colors truncate">
                              {user.name}
                            </h3>
                            {user.role === "EXPERT" && (
                              <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                🎓 Uzman
                              </span>
                            )}
                          </div>
                          
                          <p className="text-xs text-[var(--on-surface-variant)] truncate mt-0.5">
                            💬 {user._count.answers} Yanıt • ❓ {user._count.questions} Soru
                          </p>
                        </div>
                      </div>

                      {/* Kredi Rozeti */}
                      <div className="bg-[var(--primary)]/10 text-[var(--primary)] font-extrabold px-3.5 py-1.5 rounded-xl text-xs sm:text-sm shrink-0 border border-[var(--primary)]/20">
                        {user.credits} 🪙
                      </div>
                    </div>
                  </Link>

                  {adToShow && <FeedAdCard ad={adToShow} />}
                </div>
              );
            });
          })()}
          </div>
        </section>

        {/* Sağ Kolon: 3 Yan Bar Kutusu */}
        <RightSidebarWidgets />
      </div>
    </div>
  );
}
