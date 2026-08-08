import { prisma } from "@/lib/prisma";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";
import ReportActions from "@/components/admin/ReportActions";

export const dynamic = "force-dynamic";

export default async function AdminReportsPage() {
  const reports = await prisma.report.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      reporter: { select: { name: true, email: true } }
    }
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Şikayetler ve Raporlar</h1>
      
      {reports.length === 0 ? (
        <div className="card p-12 text-center text-[var(--on-surface-variant)]">
          Harika! Şu an bekleyen veya çözülmüş bir şikayet yok.
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map(report => (
            <div key={report.id} className="card p-5 border-l-4 border-l-red-500">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-1 text-xs font-bold rounded-sm ${
                    report.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                    report.status === 'RESOLVED' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {report.status}
                  </span>
                  <span className="font-semibold text-sm">
                    Hedef Tipi: {report.targetType}
                  </span>
                  <span className="text-xs text-[var(--on-surface-variant)] font-mono flex items-center gap-2">
                    (ID: {report.targetId})
                    {report.targetType === 'QUESTION' && (
                      <a href={`/soru/${report.targetId}`} target="_blank" className="text-[var(--primary)] hover:underline flex items-center gap-1">
                        İçeriğe Git ↗
                      </a>
                    )}
                    {report.targetType === 'USER' && (
                      <a href={`/kullanici/${report.targetId}`} target="_blank" className="text-[var(--primary)] hover:underline flex items-center gap-1">
                        Profili Gör ↗
                      </a>
                    )}
                    {/* For answers, we might not have a direct link unless we know the question ID, so we skip it or just let admin search */}
                  </span>
                </div>
                <div className="text-xs text-[var(--on-surface-variant)]">
                  {formatDistanceToNow(new Date(report.createdAt), { addSuffix: true, locale: tr })}
                </div>
              </div>
              
              <div className="bg-[var(--surface-variant)] p-3 rounded-md text-sm mb-4">
                <strong>Şikayet Nedeni:</strong> {report.reason}
              </div>
              
              <div className="flex justify-between items-center text-xs text-[var(--on-surface-variant)]">
                <div>Bildiren: <strong>{report.reporter.name}</strong> ({report.reporter.email})</div>
                
                {report.status === 'PENDING' && (
                  <ReportActions reportId={report.id} />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
