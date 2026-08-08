import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const userCount = await prisma.user.count();
  const questionCount = await prisma.question.count();
  const answerCount = await prisma.answer.count();
  const pendingQuestionApprovals = await prisma.question.count({
    where: { status: "PENDING_APPROVAL" }
  });
  const pendingAnswerApprovals = await prisma.answer.count({
    where: { status: "PENDING_APPROVAL" }
  });
  const pendingReports = await prisma.report.count({
    where: { status: "PENDING" }
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Genel Bakış (Dashboard)</h1>
      
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
        <div className="card p-4 text-center">
          <div className="text-3xl font-bold text-[var(--primary)] mb-1">{userCount}</div>
          <div className="text-sm text-[var(--on-surface-variant)] font-medium uppercase tracking-wide">Kullanıcı</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-3xl font-bold text-green-600 mb-1">{questionCount}</div>
          <div className="text-sm text-[var(--on-surface-variant)] font-medium uppercase tracking-wide">Toplam Soru</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-3xl font-bold text-blue-600 mb-1">{answerCount}</div>
          <div className="text-sm text-[var(--on-surface-variant)] font-medium uppercase tracking-wide">Cevap</div>
        </div>
        <div className="card p-4 text-center border-l-4 border-l-amber-500 bg-amber-500/5">
          <div className="text-3xl font-bold text-amber-600 mb-1">{pendingQuestionApprovals}</div>
          <div className="text-xs text-[var(--on-surface-variant)] font-bold uppercase tracking-wide">Soru Onay Bekleyen</div>
        </div>
        <div className="card p-4 text-center border-l-4 border-l-purple-500 bg-purple-500/5">
          <div className="text-3xl font-bold text-purple-600 mb-1">{pendingAnswerApprovals}</div>
          <div className="text-xs text-[var(--on-surface-variant)] font-bold uppercase tracking-wide">Uzman Cevap Onay Bekleyen</div>
        </div>
        <div className="card p-4 text-center border-l-4 border-l-red-500">
          <div className="text-3xl font-bold text-red-600 mb-1">{pendingReports}</div>
          <div className="text-xs text-[var(--on-surface-variant)] font-bold uppercase tracking-wide">Bekleyen Şikayet</div>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="text-xl font-bold mb-4">Sistem Durumu</h2>
        <p className="text-[var(--on-surface-variant)]">
          Tarımsal e-Danışman sistemi şu anda aktif olarak çalışmaktadır. Sol taraftaki menüyü kullanarak kullanıcıları yönetebilir veya gelen şikayetleri (raporları) inceleyip aksiyon alabilirsiniz.
        </p>
      </div>
    </div>
  );
}
