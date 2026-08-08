import { prisma } from "@/lib/prisma";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";
import ApproveAdButton from "./ApproveAdButton";

export default async function AdminReklamBasvurulariPage() {
  const requests = await prisma.adRequest.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Reklam & Sponsorluk Başvuruları</h1>
      </div>

      <div className="bg-blue-500/10 border border-blue-500/30 p-4 rounded-xl text-sm text-blue-800 dark:text-blue-300 mb-4">
        ℹ️ <strong>İşleyiş:</strong> Kullanıcı siteden formu doldurur ve PENDING_PAYMENT olarak buraya düşer. Sistem kullanıcıyı İyzico linkine yönlendirir. İyzico panelinizden ödemenin başarıyla geldiğini teyit ettiğinizde, buradan "Ödemeyi Onayla ve Yayına Al" butonuna basarak reklamı aktifleştirebilirsiniz.
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-[var(--surface-variant)] text-[var(--on-surface-variant)]">
              <tr>
                <th className="px-4 py-3">Paket & Fiyat</th>
                <th className="px-4 py-3">Müşteri Bilgisi</th>
                <th className="px-4 py-3">Reklam Detayı</th>
                <th className="px-4 py-3">Tarih</th>
                <th className="px-4 py-3">Durum</th>
                <th className="px-4 py-3 text-right">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req: any) => (
                <tr key={req.id} className="border-b border-[var(--outline-variant)] hover:bg-[var(--surface-container-low)]">
                  <td className="px-4 py-3">
                    <div className="font-bold text-[var(--primary)] text-base">{req.packageId}</div>
                    <div className="text-xs font-semibold">{req.price.toLocaleString("tr-TR")} ₺</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-semibold">{req.name} {req.companyName ? `(${req.companyName})` : ''}</div>
                    <div className="text-xs text-[var(--on-surface-variant)]">{req.email}</div>
                    <div className="text-xs text-[var(--on-surface-variant)]">{req.phone}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-semibold max-w-[200px] truncate" title={req.adTitle}>{req.adTitle}</div>
                    <div className="text-xs">
                      <a href={req.destinationUrl} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">Linke Git ↗</a>
                    </div>
                    {req.imageUrl && (
                      <div className="text-xs mt-1">
                        <a href={req.imageUrl} target="_blank" rel="noreferrer" className="text-purple-500 hover:underline">Görseli İncele 📸</a>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {formatDistanceToNow(new Date(req.createdAt), { addSuffix: true, locale: tr })}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      req.status === 'PENDING_PAYMENT' ? 'bg-amber-100 text-amber-800' : 
                      req.status === 'APPROVED' ? 'bg-green-100 text-green-800' : 
                      'bg-red-100 text-red-800'
                    }`}>
                      {req.status === 'PENDING_PAYMENT' ? 'ÖDEME BEKLİYOR' : 
                       req.status === 'APPROVED' ? 'YAYINDA' : req.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {req.status === 'PENDING_PAYMENT' && (
                      <ApproveAdButton requestId={req.id} packageId={req.packageId} />
                    )}
                    {req.status === 'APPROVED' && (
                      <span className="text-xs text-green-600 font-bold">✅ Onaylandı</span>
                    )}
                  </td>
                </tr>
              ))}
              {requests.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-[var(--on-surface-variant)]">
                    Henüz reklam başvurusu bulunmuyor.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
