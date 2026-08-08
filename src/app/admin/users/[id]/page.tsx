import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";
import { UserModerationControls } from "@/components/admin/UserModerationControls";
import { RoleChangeDropdown } from "@/components/admin/RoleChangeDropdown";
import { UserPremiumCreditControls } from "@/components/admin/UserPremiumCreditControls";

export const dynamic = "force-dynamic";

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      questions: {
        select: { id: true, title: true, createdAt: true },
        take: 10,
        orderBy: { createdAt: "desc" },
      },
      answers: {
        select: { id: true, body: true, questionId: true, createdAt: true },
        take: 10,
        orderBy: { createdAt: "desc" },
      },
      notifications: {
        select: { id: true, type: true, message: true, createdAt: true },
        orderBy: { createdAt: "desc" },
      },
      _count: { select: { questions: true, answers: true } },
    },
  });

  if (!user) {
    notFound();
  }

  // Bu kullanıcının oluşturduğu soruların ve cevapların ID'leri
  const userQuestionIds = user.questions.map((q) => q.id);
  const userAnswerIds = user.answers.map((a) => a.id);

  // Bu kullanıcı hakkındaki veya sorularına/cevaplarına yapılan şikayetler
  const complaints = await prisma.report.findMany({
    where: {
      OR: [
        { targetId: user.id },
        { targetId: { in: [...userQuestionIds, ...userAnswerIds] } },
      ],
    },
    include: {
      reporter: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const formattedNotifications = user.notifications.map((n) => ({
    id: n.id,
    type: n.type,
    message: n.message,
    createdAt: n.createdAt.toISOString(),
  }));

  return (
    <div className="space-y-6">
      {/* Üst Geri Butonu & Başlık */}
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin/users" className="text-xs font-bold text-[var(--primary)] hover:underline flex items-center gap-1 mb-1">
            ← Tüm Kullanıcılara Dön
          </Link>
          <h1 className="text-2xl font-bold text-[var(--on-surface)]">
            Kullanıcı Detay & Moderasyon Profili
          </h1>
        </div>
      </div>

      {/* 1. Kullanıcı Temel Profil Kartı */}
      <div className="card p-6 shadow-md border-t-4 border-[var(--primary)] space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-[var(--outline-variant)]">
          <div className="flex items-center gap-4">
            {user.image || user.avatarUrl ? (
              <img
                src={user.image || user.avatarUrl || ""}
                alt={user.name || "Kullanıcı"}
                className="w-16 h-16 rounded-full object-cover border-2 border-[var(--primary)]/30 shrink-0 shadow"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-[var(--primary)] text-white font-extrabold flex items-center justify-center text-2xl shrink-0 shadow">
                {user.name?.charAt(0).toUpperCase() || "U"}
              </div>
            )}
            <div>
              <h2 className="text-xl font-extrabold text-[var(--on-surface)] flex items-center gap-2">
                <span>{user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.name || "İsimsiz"}</span>
              </h2>
              <p className="text-xs text-[var(--primary)] font-bold">
                @{user.username || user.name || "rumuzsuz"}
              </p>
              <p className="text-[11px] text-[var(--on-surface-variant)] mt-1">
                Kayıt Tarihi: {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true, locale: tr })} ({new Date(user.createdAt).toLocaleDateString('tr-TR')})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <RoleChangeDropdown userId={user.id} currentRole={user.role} />
            <div className="bg-[var(--primary)]/10 text-[var(--primary)] font-extrabold px-4 py-2 rounded-xl text-sm border border-[var(--primary)]/20 shadow-sm">
              {user.credits} 🪙 Kredi
            </div>
          </div>
        </div>

        {/* Detaylı İletişim & Kimlik Bilgileri Tablosu */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="bg-[var(--surface-container-low)] p-3.5 rounded-xl border border-[var(--outline-variant)]">
            <span className="text-[10px] text-[var(--on-surface-variant)] uppercase font-bold tracking-wider block mb-1">🆔 T.C. Kimlik No</span>
            <span className="font-mono font-bold text-sm text-[var(--on-surface)]">{user.tcNo || "Girilmedi"}</span>
          </div>

          <div className="bg-[var(--surface-container-low)] p-3.5 rounded-xl border border-[var(--outline-variant)]">
            <span className="text-[10px] text-[var(--on-surface-variant)] uppercase font-bold tracking-wider block mb-1">📞 Telefon Numarası</span>
            <span className="font-mono font-bold text-sm text-[var(--on-surface)]">{user.phone ? `+90 ${user.phone}` : "Girilmedi"}</span>
          </div>

          <div className="bg-[var(--surface-container-low)] p-3.5 rounded-xl border border-[var(--outline-variant)]">
            <span className="text-[10px] text-[var(--on-surface-variant)] uppercase font-bold tracking-wider block mb-1">✉️ E-posta Adresi</span>
            <span className="font-bold text-sm text-[var(--on-surface)] truncate block">{user.email}</span>
          </div>

          <div className="bg-[var(--surface-container-low)] p-3.5 rounded-xl border border-[var(--outline-variant)]">
            <span className="text-[10px] text-[var(--on-surface-variant)] uppercase font-bold tracking-wider block mb-1">📍 İkamet Adresi</span>
            <span className="font-bold text-sm text-[var(--on-surface)]">
              {user.city || user.district ? `${user.city || ''} ${user.district ? `, ${user.district}` : ''}` : "Belirtilmedi"}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Satış ve Premium Yönetimi */}
      <UserPremiumCreditControls
        userId={user.id}
        currentPremiumUntil={user.premiumUntil ? user.premiumUntil.toISOString() : null}
      />

      {/* 3. Moderasyon & Cezalandırma Kontrol Paneli */}
      <UserModerationControls
        userId={user.id}
        isBanned={user.isBanned}
        bannedUntil={user.bannedUntil ? user.bannedUntil.toISOString() : null}
        banReason={user.banReason}
        notifications={formattedNotifications}
      />

      {/* 3. Kullanıcı Hakkındaki Gelen Şikayetler (Complaints List) */}
      <div className="card p-6 shadow-md space-y-4">
        <div className="flex items-center justify-between border-b border-[var(--outline-variant)] pb-3">
          <h3 className="font-extrabold text-base text-[var(--on-surface)] flex items-center gap-2">
            <span>🚩 Bu Kullanıcı Hakkındaki Şikayetler ({complaints.length})</span>
          </h3>
        </div>

        {complaints.length === 0 ? (
          <div className="text-center py-8 text-xs text-[var(--on-surface-variant)]">
            🎉 Bu kullanıcı hakkında henüz hiç şikayet yapılmamış.
          </div>
        ) : (
          <div className="space-y-3">
            {complaints.map((complaint) => (
              <div key={complaint.id} className="bg-[var(--surface-container-lowest)] border border-[var(--outline-variant)] p-4 rounded-xl space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[var(--on-surface)] flex items-center gap-1.5">
                    <span>👤 Şikayet Eden:</span>
                    <span className="text-[var(--primary)]">{complaint.reporter.name || complaint.reporter.email}</span>
                  </span>
                  <span className="text-[10px] text-[var(--on-surface-variant)]">
                    {formatDistanceToNow(new Date(complaint.createdAt), { addSuffix: true, locale: tr })}
                  </span>
                </div>
                <div className="bg-red-500/10 text-red-900 dark:text-red-300 p-2.5 rounded-lg border border-red-500/20 font-medium">
                  <strong>Şikayet Nedeni:</strong> {complaint.reason}
                </div>
                <div className="text-[11px] text-[var(--on-surface-variant)] flex items-center justify-between pt-1">
                  <span>Hedef Türü: {complaint.targetType}</span>
                  <span className="font-bold uppercase tracking-wider text-[10px] bg-amber-500/10 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded">
                    {complaint.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
