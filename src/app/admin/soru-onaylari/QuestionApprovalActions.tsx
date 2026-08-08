"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { approveQuestion, rejectQuestion, deleteQuestion } from "@/app/actions/questionApproval";

interface QuestionApprovalActionsProps {
  questionId: string;
  status: string;
  creditCost: number;
}

export default function QuestionApprovalActions({ questionId, status, creditCost }: QuestionApprovalActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleApprove = async () => {
    if (!confirm("Bu soruyu onaylayıp tüm sitede yayına almak istediğinize emin misiniz?")) return;
    setLoading(true);
    setErrorMsg("");

    const res = await approveQuestion(questionId);
    if (res.success) {
      router.refresh();
    } else {
      setErrorMsg(res.error || "Onaylama hatası.");
    }
    setLoading(false);
  };

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    const res = await rejectQuestion(questionId, rejectReason);
    if (res.success) {
      setShowRejectModal(false);
      router.refresh();
    } else {
      setErrorMsg(res.error || "Reddetme hatası.");
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!confirm("Bu soruyu KALICI OLARAK silmek istediğinize emin misiniz? Bu işlem geri alınamaz.")) return;
    setLoading(true);
    setErrorMsg("");

    const res = await deleteQuestion(questionId);
    if (res.success) {
      router.refresh();
    } else {
      setErrorMsg(res.error || "Silme hatası.");
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col gap-2">
      {errorMsg && (
        <div className="text-[11px] text-red-600 dark:text-red-400 font-semibold bg-red-50 dark:bg-red-950/40 p-2 rounded-lg">
          {errorMsg}
        </div>
      )}

      <div className="flex items-center gap-2 flex-wrap">
        {status !== "OPEN" && (
          <button
            onClick={handleApprove}
            disabled={loading}
            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
          >
            <span>✅ Onayla & Yayına Al</span>
          </button>
        )}

        {status !== "REJECTED" && (
          <button
            onClick={() => setShowRejectModal(true)}
            disabled={loading}
            className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
          >
            <span>❌ Reddet & Kredi İade ({creditCost} Kredi)</span>
          </button>
        )}

        <button
          onClick={handleDelete}
          disabled={loading}
          className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
        >
          <span>🗑️ Sil</span>
        </button>
      </div>

      {/* Reddetme Nedeni Modalı */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[var(--surface)] text-[var(--on-surface)] border border-[var(--outline-variant)] w-full max-w-md p-6 rounded-2xl shadow-2xl space-y-4 animate-in zoom-in-95">
            <h3 className="font-bold text-base text-amber-600 flex items-center gap-2">
              <span>❌ Soruyu Reddet</span>
            </h3>
            <p className="text-xs text-[var(--on-surface-variant)] leading-relaxed">
              Soruyu reddettiğinizde kullanıcıya harcadığı <strong>{creditCost} Kredi</strong> otomatik olarak iade edilecek ve bilgilendirme bildirimi gönderilecektir.
            </p>

            <form onSubmit={handleReject} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1 text-[var(--on-surface-variant)]">
                  Red Nedeni (Opsiyonel):
                </label>
                <input
                  type="text"
                  placeholder="Örn: Uygunsuz görsel / yetersiz açıklama / reklam içerikli metin"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="input w-full text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRejectModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[var(--surface-container-high)] text-[var(--on-surface)] hover:bg-[var(--surface-variant)]"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-600 text-white hover:bg-amber-700 shadow"
                >
                  {loading ? "İşleniyor..." : "Reddet & Krediyi İade Et"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
