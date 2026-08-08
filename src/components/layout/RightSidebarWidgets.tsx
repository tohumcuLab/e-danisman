import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function RightSidebarWidgets() {
  const [popularQuestions, unansweredQuestions] = await Promise.all([
    prisma.question.findMany({
      take: 5,
      where: { status: { in: ["OPEN", "ANSWERED", "CLOSED"] } },
      orderBy: [
        { viewCount: "desc" },
        { answers: { _count: "desc" } }
      ],
      select: {
        id: true,
        title: true,
        _count: { select: { answers: true } }
      }
    }),
    prisma.question.findMany({
      take: 5,
      where: { status: "OPEN", answers: { none: {} } },
      orderBy: { createdAt: "desc" },
      select: { id: true, title: true }
    })
  ]);

  return (
    <section className="col-span-12 lg:col-span-3 space-y-6 lg:sticky lg:top-20 lg:self-start">
      {/* 1. En Popüler Sorular Kutusu */}
      <div className="card p-5 flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-sm mb-3 flex items-center gap-1.5 text-[var(--primary)]">
            🔥 En Çok Okunanlar
          </h3>
          {popularQuestions.length === 0 ? (
            <p className="text-xs text-[var(--on-surface-variant)]">Henüz soru yok.</p>
          ) : (
            <div className="space-y-2">
              {popularQuestions.map((pq) => (
                <Link key={pq.id} href={`/soru/${pq.id}`} className="block group">
                  <div className="flex items-center justify-between gap-2 text-xs border-b border-[var(--outline-variant)] last:border-0 pb-1.5 last:pb-0">
                    <h4 className="font-medium text-xs group-hover:text-[var(--primary)] transition-colors truncate min-w-0 flex-1" title={pq.title}>
                      {pq.title}
                    </h4>
                    <span className="text-[10px] text-[var(--on-surface-variant)] font-semibold shrink-0 ml-auto">
                      💬 {pq._count.answers}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* EN ALTTA TÜMÜNÜ GÖR LİNKİ */}
        <div className="mt-3 pt-2.5 border-t border-[var(--outline-variant)] flex justify-end">
          <Link 
            href="/en-cok-okunanlar" 
            className="text-xs font-bold text-[var(--primary)] hover:underline transition-colors flex items-center gap-1 group"
          >
            <span>Tümünü Gör</span>
            <span className="group-hover:translate-x-1 transition-transform">➔</span>
          </Link>
        </div>
      </div>

      {/* 2. Cevap Bekleyen Sorular Kutusu */}
      <div className="card p-5 border-l-4 border-amber-500 flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-sm mb-3 flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
            ❓ Cevap Bekleyenler
          </h3>
          {unansweredQuestions.length === 0 ? (
            <p className="text-xs text-[var(--on-surface-variant)]">Cevap bekleyen soru yok.</p>
          ) : (
            <div className="space-y-2">
              {unansweredQuestions.map((uq) => (
                <Link key={uq.id} href={`/soru/${uq.id}`} className="block group">
                  <div className="flex items-center justify-between gap-2 text-xs border-b border-[var(--outline-variant)] last:border-0 pb-1.5 last:pb-0">
                    <h4 className="font-medium text-xs group-hover:text-[var(--primary)] transition-colors truncate min-w-0 flex-1" title={uq.title}>
                      {uq.title}
                    </h4>
                    {/* EN SAĞDA SADECE ÇİFT BALONLU İKON (Light Mode Siyah, Dark Mode Beyaz) */}
                    <svg 
                      className="w-4.5 h-4.5 text-gray-800 dark:text-white shrink-0 ml-auto" 
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
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* EN ALTTA TÜMÜNÜ GÖR LİNKİ */}
        <div className="mt-3 pt-2.5 border-t border-[var(--outline-variant)] flex justify-end">
          <Link 
            href="/cevap-bekleyenler" 
            className="text-xs font-bold text-amber-700 dark:text-amber-400 hover:text-amber-900 dark:hover:text-amber-200 transition-colors flex items-center gap-1 group"
          >
            <span>Tümünü Gör</span>
            <span className="group-hover:translate-x-1 transition-transform">➔</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
