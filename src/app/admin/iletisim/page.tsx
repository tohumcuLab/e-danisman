import { prisma } from "@/lib/prisma";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";

export default async function AdminIletisimPage() {
  const messages = await prisma.contactMessage.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">İletişim & Danışman Başvuruları</h1>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-[var(--surface-variant)] text-[var(--on-surface-variant)]">
              <tr>
                <th className="px-4 py-3">Tür</th>
                <th className="px-4 py-3">Ad Soyad</th>
                <th className="px-4 py-3">İletişim</th>
                <th className="px-4 py-3">Tarih</th>
                <th className="px-4 py-3">Durum</th>
                <th className="px-4 py-3">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {messages.map((msg: any) => (
                <tr key={msg.id} className="border-b border-[var(--outline-variant)] hover:bg-[var(--surface-container-low)]">
                  <td className="px-4 py-3 font-semibold">
                    {msg.type === "CONSULTANT_APP" ? (
                      <span className="text-[var(--primary)]">👨‍🌾 Uzman Başvurusu</span>
                    ) : (
                      <span className="text-gray-500">💬 Genel Mesaj</span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-medium">{msg.name}</td>
                  <td className="px-4 py-3">
                    <div>{msg.email}</div>
                    {msg.phone && <div className="text-xs text-[var(--on-surface-variant)]">{msg.phone}</div>}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true, locale: tr })}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${msg.status === 'UNREAD' ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'}`}>
                      {msg.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <details className="cursor-pointer relative">
                      <summary className="text-[var(--primary)] text-xs font-bold hover:underline">İçeriği Gör</summary>
                      <div className="absolute right-0 top-6 z-10 bg-white dark:bg-zinc-800 p-4 border border-[var(--outline-variant)] shadow-xl rounded-xl w-64 md:w-96 text-xs text-[var(--on-surface)]">
                        {msg.subject && <div className="font-bold border-b pb-1 mb-2">{msg.subject}</div>}
                        <p className="whitespace-pre-wrap leading-relaxed">{msg.message}</p>
                      </div>
                    </details>
                  </td>
                </tr>
              ))}
              {messages.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-[var(--on-surface-variant)]">
                    Henüz iletişim mesajı bulunmuyor.
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
