import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";
import { auth } from "@/auth";

import { getActiveFeedAds } from "@/lib/services/adService";
import FeedAdCard from "@/components/shared/FeedAdCard";

export const dynamic = "force-dynamic";

export default async function PublicProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { id } = await params;
  const resolvedSearchParams = await searchParams;
  const tab = resolvedSearchParams.tab || "questions";
  const session = await auth();

  const isOwner = session?.user?.id === id;
  const isAdmin = session?.user?.role === "ADMIN";

  const [user, unansweredCount, pendingCount, feedAds] = await Promise.all([
    prisma.user.findUnique({
      where: { id },
      include: {
        _count: {
          select: { answers: true, questions: true }
        }
      }
    }),
    prisma.question.count({
      where: { userId: id, answers: { none: {} } }
    }),
    prisma.question.count({
      where: { userId: id, status: "PENDING_APPROVAL" }
    }),
    getActiveFeedAds()
  ]);

  if (!user) {
    notFound();
  }

  const activeTab = tab === "answers" ? "answers" : tab === "unanswered" ? "unanswered" : tab === "pending" ? "pending" : "questions";

  // Tab İçerikleri Sorgusu
  let userQuestions: any[] = [];
  let userAnswers: any[] = [];
  let userUnansweredQuestions: any[] = [];
  let userPendingQuestions: any[] = [];

  if (activeTab === "questions") {
    userQuestions = await prisma.question.findMany({
      where: {
        userId: id,
        ...(isOwner || isAdmin ? {} : { status: { in: ["OPEN", "ANSWERED", "CLOSED"] } })
      },
      orderBy: { createdAt: "desc" },
      include: {
        category: { select: { name: true } },
        _count: { select: { answers: true } },
        images: { orderBy: { order: "asc" }, take: 1 }
      }
    });
  } else if (activeTab === "pending") {
    userPendingQuestions = await prisma.question.findMany({
      where: {
        userId: id,
        status: "PENDING_APPROVAL"
      },
      orderBy: { createdAt: "desc" },
      include: {
        category: { select: { name: true } },
        _count: { select: { answers: true } },
        images: { orderBy: { order: "asc" }, take: 1 }
      }
    });
  } else if (activeTab === "unanswered") {
    userUnansweredQuestions = await prisma.question.findMany({
      where: {
        userId: id,
        answers: { none: {} },
        ...(isOwner || isAdmin ? {} : { status: { in: ["OPEN", "ANSWERED", "CLOSED"] } })
      },
      orderBy: { createdAt: "desc" },
      include: {
        category: { select: { name: true } },
        _count: { select: { answers: true } },
        images: { orderBy: { order: "asc" }, take: 1 }
      }
    });
  } else {
    userAnswers = await prisma.answer.findMany({
      where: { userId: id },
      orderBy: [
        { isAccepted: "desc" },
        { likeCount: "desc" },
        { createdAt: "desc" }
      ],
      include: {
        question: {
          select: { id: true, title: true }
        }
      }
    });
  }

  return (
    <div className="container max-w-4xl py-8">
      {/* Üst Kart: Profil Özeti */}
      <div className="card p-6 md:p-8 mb-8 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          <div className="w-24 h-24 rounded-full bg-[var(--primary)] text-[var(--on-primary)] text-3xl font-bold flex items-center justify-center flex-shrink-0 shadow-lg overflow-hidden border-4 border-[var(--primary)]/20">
            {user.avatarUrl || user.image ? (
              <img src={user.avatarUrl || user.image!} alt={user.name || "Avatar"} className="w-full h-full object-cover" />
            ) : (
              user.name?.charAt(0).toUpperCase() || "U"
            )}
          </div>

          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
              <h1 className="text-2xl font-bold">{user.name}</h1>
              <span className={`text-xs px-2.5 py-1 rounded-full font-semibold inline-block w-max mx-auto md:mx-0 ${
                user.role === "ADMIN" ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300" :
                user.role === "EXPERT" ? "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300" :
                "bg-[var(--surface-variant)] text-[var(--on-surface-variant)]"
              }`}>
                {user.role === "ADMIN" ? "Yönetici / Admin" : user.role === "EXPERT" ? "Tarımsal Danışman" : "Üye"}
              </span>
            </div>

            {/* Slogan / Biyografi */}
            {user.bio ? (
              <p className="text-[var(--on-surface-variant)] text-sm mb-4 italic bg-[var(--surface-container-low)] p-3 rounded-md border border-[var(--outline-variant)]">
                "{user.bio}"
              </p>
            ) : (
              <p className="text-[var(--on-surface-variant)] text-sm mb-4 italic text-gray-400">
                Henüz bir biyografi eklenmemiş.
              </p>
            )}

            {/* Konum & İstatistikler */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs text-[var(--on-surface-variant)]">
              {(user.city || user.district) && (
                <div className="flex items-center gap-1 font-semibold">
                  📍 {user.city} {user.district && `, ${user.district}`} {user.village && `(${user.village})`}
                </div>
              )}
              <div>💬 <strong>{user._count.answers}</strong> Cevap Verildi</div>
              <div>❓ <strong>{user._count.questions}</strong> Soru Soruldu</div>
              <div className="text-amber-700 dark:text-amber-300 font-bold">
                ⏳ <strong>{pendingCount > 0 ? pendingCount : "-"}</strong> Onay Bekleyen
              </div>
              <div>⏳ <strong>{unansweredCount}</strong> Cevapsız Soru</div>
              <div className="bg-[var(--primary-container)] text-[var(--on-primary-container)] px-2.5 py-1 rounded font-bold">
                🪙 {user.credits} Kredi
              </div>
            </div>

            {/* Sosyal Medya Bağlantıları */}
            {(user.website || user.youtube || user.twitter || user.instagram || user.linkedin || user.facebook) && (
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-4 pt-4 border-t border-[var(--outline-variant)] text-sm">
                {user.website && (
                  <a href={user.website} target="_blank" rel="noopener noreferrer" className="btn btn-ghost py-1 px-2 text-xs flex items-center gap-1">
                    🌐 Web Sitesi
                  </a>
                )}
                {user.youtube && (
                  <a href={user.youtube} target="_blank" rel="noopener noreferrer" className="btn btn-ghost py-1 px-2 text-xs flex items-center gap-1 text-red-600">
                    📺 YouTube
                  </a>
                )}
                {user.twitter && (
                  <a href={user.twitter} target="_blank" rel="noopener noreferrer" className="btn btn-ghost py-1 px-2 text-xs flex items-center gap-1 text-blue-400">
                    🐦 Twitter / X
                  </a>
                )}
                {user.instagram && (
                  <a href={user.instagram} target="_blank" rel="noopener noreferrer" className="btn btn-ghost py-1 px-2 text-xs flex items-center gap-1 text-pink-500">
                    📷 Instagram
                  </a>
                )}
                {user.linkedin && (
                  <a href={user.linkedin} target="_blank" rel="noopener noreferrer" className="btn btn-ghost py-1 px-2 text-xs flex items-center gap-1 text-blue-600">
                    💼 LinkedIn
                  </a>
                )}
                {user.facebook && (
                  <a href={user.facebook} target="_blank" rel="noopener noreferrer" className="btn btn-ghost py-1 px-2 text-xs flex items-center gap-1 text-blue-500">
                    📘 Facebook
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tab Navigasyonu */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[var(--outline-variant)] mb-6 text-xs font-bold">
        <Link 
          href={`/kullanici/${id}?tab=questions`}
          className={`px-4 py-3 rounded-t-xl transition-all border-b-2 flex items-center gap-1.5 ${
            activeTab === "questions" 
              ? "border-[var(--primary)] text-[var(--primary)] bg-[var(--primary)]/10 font-extrabold" 
              : "border-transparent text-[var(--on-surface-variant)] hover:bg-[var(--surface-variant)]"
          }`}
        >
          <span>❓ Sorularım</span>
          <span className="bg-[var(--primary)]/20 text-[var(--primary)] px-2 py-0.5 rounded-full text-[10px] font-extrabold">
            {user._count.questions}
          </span>
        </Link>

        {(isOwner || isAdmin || pendingCount > 0) && (
          <Link 
            href={`/kullanici/${id}?tab=pending`}
            className={`px-4 py-3 rounded-t-xl transition-all border-b-2 flex items-center gap-1.5 ${
              activeTab === "pending" 
                ? "border-amber-500 text-amber-700 dark:text-amber-400 bg-amber-500/10 font-extrabold" 
                : "border-transparent text-[var(--on-surface-variant)] hover:bg-[var(--surface-variant)]"
            }`}
          >
            <span>⏳ Onay Bekleyenler</span>
            <span className="bg-amber-500/20 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full text-[10px] font-extrabold">
              {pendingCount > 0 ? pendingCount : "-"}
            </span>
          </Link>
        )}

        <Link 
          href={`/kullanici/${id}?tab=answers`}
          className={`px-4 py-3 rounded-t-xl transition-all border-b-2 flex items-center gap-1.5 ${
            activeTab === "answers" 
              ? "border-[var(--primary)] text-[var(--primary)] bg-[var(--primary)]/10 font-extrabold" 
              : "border-transparent text-[var(--on-surface-variant)] hover:bg-[var(--surface-variant)]"
          }`}
        >
          <span>💬 Verdiği Cevaplar</span>
          <span className="bg-[var(--primary)]/20 text-[var(--primary)] px-2 py-0.5 rounded-full text-[10px] font-extrabold">
            {user._count.answers}
          </span>
        </Link>

        <Link 
          href={`/kullanici/${id}?tab=unanswered`}
          className={`px-4 py-3 rounded-t-xl transition-all border-b-2 flex items-center gap-1.5 ${
            activeTab === "unanswered" 
              ? "border-amber-500 text-amber-700 dark:text-amber-400 bg-amber-500/10 font-extrabold" 
              : "border-transparent text-[var(--on-surface-variant)] hover:bg-[var(--surface-variant)]"
          }`}
        >
          <span>⏳ Cevapsız Soruları</span>
          <span className="bg-amber-500/20 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full text-[10px] font-extrabold">
            {unansweredCount}
          </span>
        </Link>
      </div>

      {/* TAB 1: Sorduğu Sorular */}
      {activeTab === "questions" && (
        <div className="space-y-4">
          {userQuestions.length === 0 ? (
            <div className="card p-8 text-center text-[var(--on-surface-variant)]">
              Bu üye henüz yayınlanmış bir soru sormamış.
            </div>
          ) : (
            userQuestions.map((q: any) => (
              <div key={q.id} className="card p-5 hover:border-[var(--primary)] transition-all space-y-3">
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="text-[11px] text-[var(--on-surface-variant)] font-semibold" suppressHydrationWarning>
                    {formatDistanceToNow(new Date(q.createdAt), { addSuffix: true, locale: tr })}
                  </span>
                </div>

                <Link href={`/soru/${q.id}`} className="block group">
                  <h3 className="font-extrabold text-base text-[var(--on-surface)] group-hover:text-[var(--primary)] transition-colors leading-snug">
                    {q.title}
                  </h3>
                </Link>

                <p className="text-xs text-[var(--on-surface-variant)] line-clamp-2 leading-relaxed">
                  {q.body}
                </p>

                {/* Metin Altı: Satır 1 -> Kategori, Satır 2 -> Bitki/Ürün Türü */}
                <div className="pt-2 space-y-1.5 border-t border-[var(--outline-variant)]/50 mt-2">
                  <div className="flex items-center gap-2">
                    <span className="bg-[var(--primary)]/10 text-[var(--primary)] text-xs font-bold px-2.5 py-1 rounded-md">
                      📁 {q.category.name}
                    </span>
                    {q.status === "PENDING_APPROVAL" && (
                      <span className="bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200 px-2 py-0.5 rounded-md font-bold text-[10px]">
                        ⏳ Onay Bekliyor
                      </span>
                    )}
                  </div>
                  {q.cropType && (
                    <div className="flex items-center gap-2">
                      <span className="bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs font-semibold px-2.5 py-1 rounded-md">
                        🌱 {q.cropType}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs text-[var(--on-surface-variant)] pt-3 border-t border-[var(--outline-variant)]">
                  <div className="flex items-center gap-3">
                    <span>💬 <strong>{q._count.answers}</strong> Yanıt</span>
                    <span>👁️ <strong>{q.viewCount || 0}</strong> Okunma</span>
                  </div>
                  <Link href={`/soru/${q.id}`} className="text-[var(--primary)] font-bold hover:underline">
                    Soruyu İncele ➔
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 2: Onay Bekleyen Soruları */}
      {activeTab === "pending" && (
        <div className="space-y-4">
          {userPendingQuestions.length === 0 ? (
            <div className="card p-8 text-center text-[var(--on-surface-variant)]">
              Şu anda onay bekleyen herhangi bir sorunuz bulunmuyor.
            </div>
          ) : (
            userPendingQuestions.map((q: any) => (
              <div key={q.id} className="card p-5 border-l-4 border-amber-500 bg-amber-500/5 space-y-3">
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="bg-amber-500/20 text-amber-800 dark:text-amber-300 px-2.5 py-0.5 rounded-md font-bold text-[11px]">
                    ⏳ Yönetici Onayında
                  </span>
                  <span className="text-[11px] text-[var(--on-surface-variant)] font-semibold" suppressHydrationWarning>
                    {formatDistanceToNow(new Date(q.createdAt), { addSuffix: true, locale: tr })}
                  </span>
                </div>

                <Link href={`/soru/${q.id}`} className="block group">
                  <h3 className="font-extrabold text-base text-[var(--on-surface)] group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors leading-snug">
                    {q.title}
                  </h3>
                </Link>

                <p className="text-xs text-[var(--on-surface-variant)] line-clamp-2 leading-relaxed">
                  {q.body}
                </p>

                {/* Metin Altı: Satır 1 -> Kategori, Satır 2 -> Bitki/Ürün Türü */}
                <div className="pt-2 space-y-1.5 border-t border-amber-500/20 mt-2">
                  <div className="flex items-center gap-2">
                    <span className="bg-[var(--primary)]/10 text-[var(--primary)] text-xs font-bold px-2.5 py-1 rounded-md">
                      📁 {q.category.name}
                    </span>
                  </div>
                  {q.cropType && (
                    <div className="flex items-center gap-2">
                      <span className="bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs font-semibold px-2.5 py-1 rounded-md">
                        🌱 {q.cropType}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs text-[var(--on-surface-variant)] pt-3 border-t border-[var(--outline-variant)]">
                  <span className="text-amber-700 dark:text-amber-300 font-bold">ℹ️ İnceleme aşamasında (Ön izleme aktif)</span>
                  <Link href={`/soru/${q.id}`} className="text-amber-700 dark:text-amber-400 font-bold hover:underline">
                    Ön İzle ➔
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 3: Verdiği Cevaplar */}
      {activeTab === "answers" && (
        <div className="space-y-4">
          {userAnswers.length === 0 ? (
            <div className="card p-8 text-center text-[var(--on-surface-variant)]">
              Bu üye henüz hiçbir soruya cevap yazmamış.
            </div>
          ) : (
            userAnswers.map((ans: any) => (
              <div key={ans.id} className={`card p-5 border-l-4 ${ans.isAccepted ? 'border-l-yellow-500 bg-yellow-50/5' : 'border-l-[var(--primary)]'}`}>
                <div className="flex justify-between items-start mb-2">
                  <Link href={`/soru/${ans.question.id}`} className="font-bold text-base hover:text-[var(--primary)] transition-colors">
                    ❓ {ans.question.title}
                  </Link>
                  {ans.isAccepted && (
                    <span className="text-xs bg-yellow-100 text-yellow-800 font-bold px-2 py-0.5 rounded flex items-center gap-1">
                      ⭐ En İyi Cevap
                    </span>
                  )}
                </div>

                <p className="text-sm text-[var(--on-surface)] line-clamp-3 mb-3 whitespace-pre-wrap">
                  {ans.body}
                </p>

                <div className="flex items-center justify-between text-xs text-[var(--on-surface-variant)] pt-3 border-t border-[var(--outline-variant)]">
                  <div>👍 <strong>{ans.likeCount}</strong> Beğeni</div>
                  <div suppressHydrationWarning>{formatDistanceToNow(new Date(ans.createdAt), { addSuffix: true, locale: tr })}</div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 4: Cevapsız Soruları */}
      {activeTab === "unanswered" && (
        <div className="space-y-4">
          {userUnansweredQuestions.length === 0 ? (
            <div className="card p-8 text-center text-[var(--on-surface-variant)]">
              Bu üyenin cevap bekleyen hiç sorusu bulunmuyor. Tüm soruları yanıtlanmış! 🎉
            </div>
          ) : (
            userUnansweredQuestions.map((q: any) => (
              <div key={q.id} className="card p-5 border-l-4 border-amber-500 space-y-3">
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="text-[11px] text-[var(--on-surface-variant)] font-semibold" suppressHydrationWarning>
                    {formatDistanceToNow(new Date(q.createdAt), { addSuffix: true, locale: tr })}
                  </span>
                </div>

                <Link href={`/soru/${q.id}`} className="block group">
                  <h3 className="font-extrabold text-base text-[var(--on-surface)] group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors leading-snug">
                    ❓ {q.title}
                  </h3>
                </Link>

                <p className="text-xs text-[var(--on-surface-variant)] line-clamp-2 leading-relaxed">
                  {q.body}
                </p>

                {/* Metin Altı: Satır 1 -> Kategori, Satır 2 -> Bitki/Ürün Türü */}
                <div className="pt-2 space-y-1.5 border-t border-amber-500/20 mt-2">
                  <div className="flex items-center gap-2">
                    <span className="bg-[var(--primary)]/10 text-[var(--primary)] text-xs font-bold px-2.5 py-1 rounded-md">
                      📁 {q.category.name}
                    </span>
                  </div>
                  {q.cropType && (
                    <div className="flex items-center gap-2">
                      <span className="bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs font-semibold px-2.5 py-1 rounded-md">
                        🌱 {q.cropType}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs text-[var(--on-surface-variant)] pt-3 border-t border-[var(--outline-variant)]">
                  <span className="text-amber-600 dark:text-amber-400 font-bold">⏳ Henüz cevap yazılmadı</span>
                  <Link href={`/soru/${q.id}`} className="text-amber-700 dark:text-amber-400 font-bold hover:underline">
                    Cevap Yaz ➔
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Profil Altı Sponsorlu Reklam */}
      {feedAds.length > 0 && (
        <div className="mt-8">
          <FeedAdCard ad={feedAds[0]} />
        </div>
      )}
    </div>
  );
}
