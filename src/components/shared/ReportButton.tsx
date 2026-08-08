"use client";

import { useState } from "react";

export default function ReportButton({
  targetType,
  targetId
}: {
  targetType: "QUESTION" | "ANSWER" | "USER";
  targetId: string;
}) {
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [reason, setReason] = useState("");

  const handleReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim() || loading) return;

    setLoading(true);
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetType, targetId, reason }),
      });

      if (res.ok) {
        alert("Şikayetiniz yönetime iletilmiştir. Teşekkür ederiz.");
        setShowModal(false);
        setReason("");
      } else {
        const data = await res.json();
        alert(data.error || "Şikayet iletilirken bir hata oluştu.");
      }
    } catch (err) {
      alert("Bağlantı hatası.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 border border-gray-300 dark:border-gray-700 flex items-center justify-center font-bold text-xs transition-colors shrink-0"
        title="Şikayet Et"
      >
        !
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--surface-container)] p-6 rounded-md w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">İçeriği Şikayet Et</h3>
            <p className="text-sm text-[var(--on-surface-variant)] mb-4">
              Lütfen bu içeriği neden şikayet ettiğinizi kısaca açıklayın.
            </p>
            <form onSubmit={handleReport} className="flex flex-col gap-4">
              <textarea
                required
                rows={4}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Spam, hakaret, yanlış bilgi vs..."
                className="p-3 border border-[var(--outline-variant)] rounded-md bg-[var(--surface)] text-[var(--on-surface)]"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn bg-[var(--surface-variant)] text-[var(--on-surface-variant)]"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={loading || !reason.trim()}
                  className="btn bg-red-600 text-white hover:bg-red-700"
                >
                  {loading ? "Gönderiliyor..." : "Şikayet Et"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
