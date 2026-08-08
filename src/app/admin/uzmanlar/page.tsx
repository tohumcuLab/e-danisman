import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { PaymentButton } from "@/components/admin/PaymentButton";
import ExpertScoreSettingsForm from "@/components/admin/ExpertScoreSettingsForm";
import ExpertScoreDetailModal from "@/components/admin/ExpertScoreDetailModal";
import PendingAnswersApproval from "@/components/admin/PendingAnswersApproval";

export const dynamic = "force-dynamic";

export default async function AdminUzmanlarPage() {
  const experts = await prisma.user.findMany({
    where: { role: "EXPERT" },
    include: {
      expertScoreLogs: true,
      expertPayments: true,
    },
  });

  // Onay bekleyen tüm uzman cevaplarını getir
  const pendingAnswers = await prisma.answer.findMany({
    where: { status: "PENDING_APPROVAL" },
    orderBy: { createdAt: "asc" },
    include: {
      user: { select: { id: true, name: true, email: true } },
      question: { select: { id: true, title: true } },
    },
  });

  const now = new Date();
  const startOfWeek = new Date(now);
  const day = startOfWeek.getDay();
  const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
  startOfWeek.setDate(diff);
  startOfWeek.setHours(0, 0, 0, 0);

  const allSettings = await prisma.systemSetting.findMany();
  const settingsMap = allSettings.reduce((acc, curr) => {
    acc[curr.key] = curr.value;
    return acc;
  }, {} as Record<string, string>);

  const tlMultiplier = parseFloat(settingsMap["EXPERT_POINT_TL_VALUE"] || "2.0");

  const initialSettings = {
    tlValue: settingsMap["EXPERT_POINT_TL_VALUE"] || "2.0",
    answerPoint: settingsMap["EXPERT_SCORE_ANSWER"] || settingsMap["EXPERT_ANSWER_POINT_VALUE"] || "10",
    likePoint: settingsMap["EXPERT_SCORE_LIKE"] || "3",
    bestAnswerPoint: settingsMap["EXPERT_SCORE_BEST_ANSWER"] || "20",
    adminHighlightPoint: settingsMap["EXPERT_SCORE_ADMIN_HIGHLIGHT"] || "15",
    spamPoint: settingsMap["EXPERT_SCORE_SPAM"] || "-20",
    wrongInfoPoint: settingsMap["EXPERT_SCORE_WRONG_INFO"] || "-50",
  };

  const expertStats = experts
    .map((expert) => {
      let weeklyScore = 0;
      let totalScore = 0;

      expert.expertScoreLogs.forEach((log) => {
        totalScore += log.points;
        if (log.createdAt >= startOfWeek) {
          weeklyScore += log.points;
        }
      });

      // Toplam ödenen puanlar ve TL
      const totalPaidPoints = expert.expertPayments.reduce((sum, p) => sum + p.totalPoints, 0);

      // Henüz ödenmemiş birikmiş puan ve toplam alacak bakiyesi (TL)
      const unpaidPoints = Math.max(0, totalScore - totalPaidPoints);
      const totalBalanceTL = unpaidPoints * tlMultiplier;
      const weeklyPayment = weeklyScore * tlMultiplier;

      // Ödeme durumu (Ödenmemiş bakiye var mı?)
      const isPaidThisWeek = expert.expertPayments.some(
        (p) => p.weekStartDate.getTime() === startOfWeek.getTime()
      );
      const isFullyPaid = unpaidPoints === 0;

      return {
        id: expert.id,
        name: expert.name,
        email: expert.email,
        weeklyScore,
        totalScore,
        unpaidPoints,
        weeklyPayment,
        totalBalanceTL,
        isPaidThisWeek,
        isFullyPaid,
        startOfWeek,
      };
    })
    .sort((a, b) => b.totalBalanceTL - a.totalBalanceTL || b.totalScore - a.totalScore);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-[var(--on-surface)]">Uzman Yönetimi & Hak Ediş Sistemi</h1>
          <p className="text-xs text-[var(--on-surface-variant)] mt-1">
            Uzmanların performans puanlarını, birikmiş alacak bakiyelerini ve puan katsayılarını tek ekrandan yönetin.
          </p>
        </div>
      </div>

      {/* Dinamik Puanlama ve Katsayı Ayarları Formu */}
      <ExpertScoreSettingsForm initialSettings={initialSettings} />

      {/* Onay Bekleyen Uzman Cevapları ve Admin Hatırlatma Kutusu */}
      <PendingAnswersApproval initialAnswers={pendingAnswers} />

      {/* Haftalık & Birikmiş Performans Tablosu */}
      <div className="card p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[var(--outline-variant)]">
          <div>
            <h2 className="text-lg font-extrabold text-[var(--on-surface)]">Uzman Performans & Toplam Alacak Bakiyesi Tablosu</h2>
            <p className="text-xs text-[var(--on-surface-variant)]">
              Uzmanların kazanılan puanları, bu haftaki performansları ve ödenmeyi bekleyen toplam alacak bakiyeleri.
            </p>
          </div>
          <span className="text-xs font-extrabold bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/30 px-3.5 py-1.5 rounded-xl self-start sm:self-auto">
            ⚡ Güncel Çarpan: 1 Puan = {tlMultiplier} TL
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-[var(--outline-variant)] text-xs uppercase text-[var(--on-surface-variant)] bg-[var(--surface-container-low)]">
                <th className="py-3 px-4 font-bold">Uzman</th>
                <th className="py-3 px-4 font-bold">Toplam Puan</th>
                <th className="py-3 px-4 font-bold">Haftalık Puan</th>
                <th className="py-3 px-4 font-bold">Haftalık Hak Ediş</th>
                <th className="py-3 px-4 font-bold text-green-700 dark:text-green-400">Toplam Alacak Bakiyesi</th>
                <th className="py-3 px-4 font-bold">Durum</th>
                <th className="py-3 px-4 font-bold text-right">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {expertStats.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-500">
                    Kayıtlı uzman bulunmuyor.
                  </td>
                </tr>
              ) : (
                expertStats.map((stat) => (
                  <tr
                    key={stat.id}
                    className="border-b border-[var(--outline-variant)] hover:bg-[var(--surface-variant)]/50 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-semibold">
                      <Link
                        href={`/kullanici/${stat.id}`}
                        className="hover:underline text-[var(--primary)] flex items-center gap-2"
                      >
                        <span className="w-7 h-7 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-xs font-bold flex items-center justify-center border border-[var(--primary)]/30">
                          👨‍🌾
                        </span>
                        <span>{stat.name || stat.email}</span>
                      </Link>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-[var(--on-surface)]">
                      {stat.totalScore} Puan
                    </td>
                    <td className="py-3.5 px-4 font-extrabold text-blue-600 dark:text-blue-400">
                      +{stat.weeklyScore} Puan
                    </td>
                    <td className="py-3.5 px-4 font-medium text-[var(--on-surface-variant)]">
                      {stat.weeklyPayment.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} TL
                    </td>
                    <td className="py-3.5 px-4 font-black text-base text-green-700 dark:text-green-400">
                      {stat.totalBalanceTL.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} TL
                      {stat.unpaidPoints > 0 && (
                        <span className="block text-[11px] font-normal text-[var(--on-surface-variant)]">
                          ({stat.unpaidPoints} ödenmemiş puan)
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      {stat.isFullyPaid ? (
                        <span className="inline-block px-3 py-1 text-xs font-extrabold text-green-800 bg-green-100 rounded-xl dark:bg-green-900/30 dark:text-green-400 border border-green-300 dark:border-green-800">
                          Tümü Ödendi
                        </span>
                      ) : (
                        <span className="inline-block px-3 py-1 text-xs font-extrabold text-amber-800 bg-amber-100 rounded-xl dark:bg-amber-900/30 dark:text-amber-400 border border-amber-300 dark:border-amber-800">
                          Ödeme Bekliyor
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <ExpertScoreDetailModal
                          expertId={stat.id}
                          expertName={stat.name || stat.email}
                          totalScore={stat.totalScore}
                        />
                        {!stat.isFullyPaid && stat.totalBalanceTL > 0 && (
                          <PaymentButton
                            expertId={stat.id}
                            amountTl={stat.totalBalanceTL}
                            points={stat.unpaidPoints}
                            weekStartDate={stat.startOfWeek.toISOString()}
                          />
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
