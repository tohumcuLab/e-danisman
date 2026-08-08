"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AnswerForm({ 
  questionId, 
  userRole 
}: { 
  questionId: string; 
  userRole?: string; 
}) {
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      const res = await fetch("/api/answers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body, questionId }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Cevap eklenemedi.");
      }

      setBody("");
      if (data.pendingApproval) {
        setSuccessMessage(data.message || "Cevabınız yönetici onayına gönderilmiştir.");
      } else {
        setSuccessMessage("Cevabınız başarıyla yayınlandı.");
      }
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card p-6 mt-8">
      <h3 className="text-xl font-bold mb-4">Cevap Yaz</h3>

      {/* Uzman / Yanıt Yanıtlama Rehberi & Dikkat Edilmesi Gerekenler Kutusu */}
      <div className="mb-5 p-4 bg-amber-50/80 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/60 rounded-2xl shadow-sm space-y-2.5">
        <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-extrabold text-sm border-b border-amber-200 dark:border-amber-800/60 pb-2">
          <span className="text-lg">🎓</span>
          <span>Uzman Danışman Yanıt Rehberi & Dikkat Edilmesi Gerekenler</span>
        </div>
        
        <ul className="text-xs text-amber-950 dark:text-amber-300 space-y-1.5 font-medium leading-relaxed">
          <li className="flex items-start gap-2">
            <span className="shrink-0 text-amber-700 dark:text-amber-400 font-bold">•</span>
            <span><strong>Detaylı Açıklama:</strong> Cevaplar çok kısa ve yetersiz olmamalıdır. Üreticinin sorununu tam olarak çözecek kapsamlı açıklamalar yazınız (Karakter sayısına dikkat ediniz).</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="shrink-0 text-amber-700 dark:text-amber-400 font-bold">•</span>
            <span><strong>Üslup Kuralları:</strong> Cevap içerisinde küfür, hakaret, aşağılama veya topluluk kurallarına aykırı ifadelere kesinlikle yer verilmemelidir.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="shrink-0 text-amber-700 dark:text-amber-400 font-bold">•</span>
            <span><strong>Ticari Marka/İlaç Yasağı:</strong> Cevap içerisinde doğrudan ticari marka, ticari ilaç ve gübre marka isimleri bulunmamalıdır. Sadece <em>aktif etken maddeler</em> ve <em>garanti edilen içerikler</em> (örneğin NPK, iz element vb.) belirtilmelidir.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="shrink-0 text-amber-700 dark:text-amber-400 font-bold">•</span>
            <span><strong>Kişisel İletişim Bilgisi Yasağı:</strong> Cevap metninde kendi sosyal medya hesaplarınız, telefon numaranız, e-posta adresiniz veya harici iletişim bilgileri paylaşılmamalıdır.</span>
          </li>
        </ul>
      </div>

      {successMessage && (
        <div className="bg-emerald-500/10 border-2 border-emerald-500/40 text-emerald-800 dark:text-emerald-300 p-4 rounded-xl mb-4 text-xs md:text-sm font-bold flex items-center gap-3">
          <span className="text-xl">⏳</span>
          <div>{successMessage}</div>
        </div>
      )}

      {error && (
        <div className="bg-[var(--error-container)] text-[var(--on-error-container)] p-3 rounded-md mb-4 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <textarea
          required
          rows={5}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Çözüm önerinizi veya tavsiyenizi detaylı şekilde buraya yazın..."
          className="p-3 border border-[var(--outline-variant)] rounded-xl bg-[var(--surface)] text-[var(--on-surface)] focus:ring-2 focus:ring-[var(--primary)] focus:outline-none transition-all"
        />
        
        <div className="flex items-center justify-between">
          <span className="text-xs text-[var(--on-surface-variant)] font-semibold">
            Karakter Sayısı: <strong className="text-[var(--on-surface)]">{body.length}</strong>
          </span>

          <button
            type="submit"
            disabled={loading || !body.trim()}
            className="bg-[#006537] hover:bg-[#74db98] text-white hover:text-[#00391d] font-extrabold text-sm px-6 py-3 rounded-xl transition-all shadow-md cursor-pointer disabled:opacity-50"
          >
            {loading ? "Gönderiliyor..." : "Cevabı Gönder"}
          </button>
        </div>
      </form>
    </div>
  );
}
