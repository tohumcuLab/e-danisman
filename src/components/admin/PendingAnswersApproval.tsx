"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface PendingAnswer {
  id: string;
  body: string;
  createdAt: string | Date;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
  question: {
    id: string;
    title: string;
  };
}

export default function PendingAnswersApproval({
  initialAnswers,
}: {
  initialAnswers: PendingAnswer[];
}) {
  const [answers, setAnswers] = useState<PendingAnswer[]>(initialAnswers);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const router = useRouter();

  const handleApprove = async (id: string) => {
    if (!confirm("Bu cevabı onaylayıp yayına almak ve uzmana puan tanımlamak istiyor musunuz?")) return;

    setLoadingId(id);
    try {
      const res = await fetch(`/api/admin/answers/${id}/approve`, {
        method: "POST",
      });

      if (!res.ok) throw new Error("Onaylama işlemi başarısız.");

      alert("Cevap onaylandı, yayına alındı ve uzmana puanı eklendi!");
      setAnswers((prev) => prev.filter((a) => a.id !== id));
      router.refresh();
    } catch (err: any) {
      alert(err.message || "Bir hata oluştu.");
    } finally {
      setLoadingId(null);
    }
  };

  const handleReject = async (id: string) => {
    if (!confirm("Bu cevabı reddetmek ve silmek istediğinize emin misiniz?")) return;

    setLoadingId(id);
    try {
      const res = await fetch(`/api/admin/answers/${id}/reject`, {
        method: "POST",
      });

      if (!res.ok) throw new Error("Reddetme işlemi başarısız.");

      alert("Cevap reddedildi ve silindi.");
      setAnswers((prev) => prev.filter((a) => a.id !== id));
      router.refresh();
    } catch (err: any) {
      alert(err.message || "Bir hata oluştu.");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="card p-6 space-y-5 border-2 border-amber-300/60 dark:border-amber-700/60 shadow-md">
      {/* Admin Hatırlatma Kutusu */}
      <div className="p-4 bg-amber-50/90 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/70 rounded-2xl space-y-2">
        <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-black text-sm border-b border-amber-200 dark:border-amber-800/60 pb-2">
          <span className="text-xl">⚠️</span>
          <span>Admin Onay Hatırlatması — Cevap Onaylarken Dikkat Edilecek Hususlar</span>
        </div>

        <ul className="text-xs text-amber-950 dark:text-amber-300 space-y-1.5 font-medium leading-relaxed">
          <li className="flex items-start gap-2">
            <span className="shrink-0 text-amber-700 dark:text-amber-400 font-bold">•</span>
            <span><strong>Cevap Uzunluğu:</strong> Cevaplar çok kısa olmamalıdır. Karakter sayısına dikkat ediniz.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="shrink-0 text-amber-700 dark:text-amber-400 font-bold">•</span>
            <span><strong>Üslup & İhlal Kontrolü:</strong> Cevabın içerisinde küfür, hakaret veya kurallara aykırı söylem olmamalıdır.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="shrink-0 text-amber-700 dark:text-amber-400 font-bold">•</span>
            <span><strong>Ticari Ürün Yasağı:</strong> Cevapta doğrudan ticari ilaç ve gübre marka adları bulunmamalıdır (Sadece aktif etken madde ve garanti edilen içerikler).</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="shrink-0 text-amber-700 dark:text-amber-400 font-bold">•</span>
            <span><strong>Kişisel Bilgi Yasağı:</strong> Cevapta sosyal medya hesapları, telefon numarası veya mail adresi olmamalıdır.</span>
          </li>
        </ul>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-extrabold text-[var(--on-surface)] flex items-center gap-2">
            <span>⏳ Onay Bekleyen Uzman Cevapları</span>
            <span className="text-xs bg-amber-500 text-white font-extrabold px-2.5 py-0.5 rounded-full">
              {answers.length} Onay Bekliyor
            </span>
          </h2>
          <p className="text-xs text-[var(--on-surface-variant)] mt-0.5">
            Uzmanların sorulara yazdığı ve yönetici onayı bekleyen cevaplar.
          </p>
        </div>
      </div>

      {answers.length === 0 ? (
        <div className="p-8 text-center text-sm text-[var(--on-surface-variant)] bg-[var(--surface-container-low)] rounded-xl border border-[var(--outline-variant)]">
          ✨ Onay bekleyen herhangi bir uzman cevabı bulunmuyor.
        </div>
      ) : (
        <div className="space-y-4">
          {answers.map((ans) => (
            <div
              key={ans.id}
              className="p-4 rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)] space-y-3 shadow-sm hover:border-[var(--primary)] transition-all"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[var(--outline-variant)] text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[var(--primary)]">👨‍🌾 {ans.user.name || ans.user.email}</span>
                  <span className="text-[var(--on-surface-variant)]">•</span>
                  <Link
                    href={`/soru/${ans.question.id}`}
                    target="_blank"
                    className="font-semibold text-[var(--on-surface)] hover:underline truncate max-w-md"
                  >
                    ❓ Soru: {ans.question.title} ↗
                  </Link>
                </div>

                <div className="flex items-center gap-3 text-[11px] text-[var(--on-surface-variant)]">
                  <span>Karakter: <strong className="text-[var(--on-surface)]">{ans.body.length}</strong></span>
                  <span>•</span>
                  <span>{new Date(ans.createdAt).toLocaleString("tr-TR")}</span>
                </div>
              </div>

              <div className="text-xs md:text-sm text-[var(--on-surface)] leading-relaxed whitespace-pre-wrap bg-[var(--surface-container-low)] p-3 rounded-lg border border-[var(--outline-variant)]/60">
                {ans.body}
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  onClick={() => handleReject(ans.id)}
                  disabled={loadingId === ans.id}
                  className="px-3.5 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-700 dark:text-red-400 font-bold text-xs rounded-lg transition-colors border border-red-500/30 disabled:opacity-50"
                >
                  ❌ Reddet & Sil
                </button>
                <button
                  onClick={() => handleApprove(ans.id)}
                  disabled={loadingId === ans.id}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-lg shadow-sm transition-all disabled:opacity-50"
                >
                  {loadingId === ans.id ? "İşleniyor..." : "✅ Onayla & Puan Ver"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
