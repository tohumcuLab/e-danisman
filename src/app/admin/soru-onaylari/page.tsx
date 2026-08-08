import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";
import QuestionApprovalActions from "./QuestionApprovalActions";

export const dynamic = "force-dynamic";

export default async function AdminSoruOnaylariPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab = "pending" } = await searchParams;

  // İstatistik sayıları
  const [pendingCount, approvedCount, rejectedCount] = await Promise.all([
    prisma.question.count({ where: { status: "PENDING_APPROVAL" } }),
    prisma.question.count({ where: { status: { in: ["OPEN", "ANSWERED", "CLOSED"] } } }),
    prisma.question.count({ where: { status: "REJECTED" } }),
  ]);

  // Duruma göre filtrele
  let statusFilter: any = { status: "PENDING_APPROVAL" };
  if (tab === "approved") {
    statusFilter = { status: { in: ["OPEN", "ANSWERED", "CLOSED"] } };
  } else if (tab === "rejected") {
    statusFilter = { status: "REJECTED" };
  }

  const questions = await prisma.question.findMany({
    where: statusFilter,
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, name: true, email: true, image: true } },
      category: { select: { name: true } },
      images: { orderBy: { order: "asc" } },
      _count: { select: { answers: true } },
    },
  });

  return (
    <div className="space-y-6">
      {/* Üst Başlık & Açıklama */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[var(--on-surface)] flex items-center gap-2">
            <span>🛡️ Soru Onay Yönetimi</span>
          </h1>
          <p className="text-xs text-[var(--on-surface-variant)] mt-1">
            Kullanıcılar tarafından sorulan sorular admin onayından geçtikten sonra tüm sitede yayına alınır.
          </p>
        </div>
      </div>

      {/* İstatistik Kartları */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href="/admin/soru-onaylari?tab=pending"
          className={`card p-4 flex items-center justify-between border-l-4 transition-all ${
            tab === "pending" ? "border-amber-500 bg-amber-500/10 shadow-md" : "border-amber-500/50 hover:bg-[var(--surface-variant)]"
          }`}
        >
          <div>
            <div className="text-2xl font-black text-amber-600 dark:text-amber-400">{pendingCount}</div>
            <div className="text-xs font-bold text-[var(--on-surface-variant)]">Onay Bekleyen Sorular</div>
          </div>
          <span className="text-2xl">⏳</span>
        </Link>

        <Link
          href="/admin/soru-onaylari?tab=approved"
          className={`card p-4 flex items-center justify-between border-l-4 transition-all ${
            tab === "approved" ? "border-emerald-500 bg-emerald-500/10 shadow-md" : "border-emerald-500/50 hover:bg-[var(--surface-variant)]"
          }`}
        >
          <div>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{approvedCount}</div>
            <div className="text-xs font-bold text-[var(--on-surface-variant)]">Yayındaki (Onaylı) Sorular</div>
          </div>
          <span className="text-2xl">✅</span>
        </Link>

        <Link
          href="/admin/soru-onaylari?tab=rejected"
          className={`card p-4 flex items-center justify-between border-l-4 transition-all ${
            tab === "rejected" ? "border-red-500 bg-red-500/10 shadow-md" : "border-red-500/50 hover:bg-[var(--surface-variant)]"
          }`}
        >
          <div>
            <div className="text-2xl font-black text-red-600 dark:text-red-400">{rejectedCount}</div>
            <div className="text-xs font-bold text-[var(--on-surface-variant)]">Reddedilen Sorular</div>
          </div>
          <span className="text-2xl">❌</span>
        </Link>
      </div>

      {/* Tab Navigasyon */}
      <div className="flex items-center gap-2 border-b border-[var(--outline-variant)] pb-2 text-xs font-bold">
        <Link
          href="/admin/soru-onaylari?tab=pending"
          className={`px-4 py-2 rounded-t-lg transition-colors ${
            tab === "pending" ? "bg-amber-600 text-white" : "text-[var(--on-surface-variant)] hover:bg-[var(--surface-variant)]"
          }`}
        >
          ⏳ Onay Bekleyenler ({pendingCount})
        </Link>
        <Link
          href="/admin/soru-onaylari?tab=approved"
          className={`px-4 py-2 rounded-t-lg transition-colors ${
            tab === "approved" ? "bg-emerald-600 text-white" : "text-[var(--on-surface-variant)] hover:bg-[var(--surface-variant)]"
          }`}
        >
          ✅ Yayındakiler ({approvedCount})
        </Link>
        <Link
          href="/admin/soru-onaylari?tab=rejected"
          className={`px-4 py-2 rounded-t-lg transition-colors ${
            tab === "rejected" ? "bg-red-600 text-white" : "text-[var(--on-surface-variant)] hover:bg-[var(--surface-variant)]"
          }`}
        >
          ❌ Reddedilenler ({rejectedCount})
        </Link>
      </div>

      {/* Soru Listesi */}
      <div className="space-y-4">
        {questions.length === 0 ? (
          <div className="card p-12 text-center text-[var(--on-surface-variant)] font-medium">
            {tab === "pending" && "🎉 Şul anda onay bekleyen yeni soru bulunmuyor."}
            {tab === "approved" && "Henüz yayınlanmış bir soru yok."}
            {tab === "rejected" && "Reddedilmiş bir soru bulunmuyor."}
          </div>
        ) : (
          questions.map((q) => (
            <div
              key={q.id}
              className={`card p-5 border-l-4 space-y-4 transition-all ${
                q.status === "PENDING_APPROVAL"
                  ? "border-amber-500 bg-amber-500/5"
                  : q.status === "REJECTED"
                  ? "border-red-500 bg-red-500/5 opacity-80"
                  : "border-emerald-500"
              }`}
            >
              {/* Üst Bilgi Satırı: Kullanıcı, Kategori, Tarih */}
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs border-b border-[var(--outline-variant)] pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[var(--primary)]/20 text-[var(--primary)] font-bold flex items-center justify-center text-xs shrink-0">
                    {q.user.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <div>
                    <div className="font-bold text-[var(--on-surface)] flex items-center gap-2">
                      <span>{q.user.name}</span>
                      <span className="text-[10px] text-[var(--on-surface-variant)] font-normal">({q.user.email})</span>
                    </div>
                    {(q.city || q.district) && (
                      <div className="text-[10px] text-[var(--on-surface-variant)]">
                        📍 {q.city} {q.district ? `/ ${q.district}` : ""} {q.village ? `/ ${q.village}` : ""}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="px-2 py-1 rounded-md bg-purple-500/10 text-purple-700 dark:text-purple-400 font-bold text-[11px]">
                    🪙 {q.creditCost} Kredi
                  </span>
                  <span className="text-[11px] text-[var(--on-surface-variant)]">
                    {formatDistanceToNow(new Date(q.createdAt), { addSuffix: true, locale: tr })}
                  </span>
                </div>
              </div>

              {/* Soru Başlığı & İçeriği */}
              <div className="space-y-2">
                <h3 className="text-base font-extrabold text-[var(--on-surface)] leading-snug">
                  {q.title}
                </h3>
                <p className="text-xs text-[var(--on-surface-variant)] whitespace-pre-wrap leading-relaxed">
                  {q.body}
                </p>

                {/* Metin Altı: Satır 1 -> Kategori, Satır 2 -> Bitki/Ürün Türü */}
                <div className="pt-2 space-y-1.5 border-t border-[var(--outline-variant)]/50 mt-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-md bg-[var(--primary)]/10 text-[var(--primary)] font-bold text-[11px]">
                      📁 {q.category.name}
                    </span>
                  </div>
                  {q.cropType && (
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold text-[11px]">
                        🌱 {q.cropType}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Yüklenen Resimler Galerisi (Varsa) */}
              {q.images.length > 0 && (
                <div className="pt-2">
                  <div className="text-[11px] font-bold text-[var(--on-surface-variant)] mb-2">
                    📸 Yüklenen Medya ({q.images.length} Adet Görsel):
                  </div>
                  <div className="flex gap-3 overflow-x-auto pb-2">
                    {q.images.map((img) => (
                      <a
                        key={img.id}
                        href={img.url}
                        target="_blank"
                        rel="noreferrer"
                        className="shrink-0 w-24 h-24 rounded-xl overflow-hidden border border-[var(--outline-variant)] bg-[var(--surface-container-high)] hover:scale-105 transition-transform"
                      >
                        <img src={img.url} alt="Soru görseli" className="w-full h-full object-cover" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Alt Satır: Durum Rozeti ve Aksiyon Butonları */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[var(--outline-variant)]">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-black ${
                      q.status === "PENDING_APPROVAL"
                        ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200"
                        : q.status === "REJECTED"
                        ? "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200"
                        : "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200"
                    }`}
                  >
                    {q.status === "PENDING_APPROVAL" && "⏳ ONAY BEKLİYOR"}
                    {q.status === "REJECTED" && "❌ REDDEDİLDİ"}
                    {q.status !== "PENDING_APPROVAL" && q.status !== "REJECTED" && "✅ YAYINDA (ONAYLI)"}
                  </span>

                  <Link
                    href={`/soru/${q.id}`}
                    target="_blank"
                    className="text-xs text-[var(--primary)] font-bold hover:underline flex items-center gap-1"
                  >
                    <span>Sayfada İncele</span>
                    <span>↗</span>
                  </Link>
                </div>

                <QuestionApprovalActions questionId={q.id} status={q.status} creditCost={q.creditCost} />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
