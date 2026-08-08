"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

interface ExpertScoreDetailModalProps {
  expertId: string;
  expertName: string;
  totalScore: number;
}

export default function ExpertScoreDetailModal({
  expertId,
  expertName,
  totalScore,
}: ExpertScoreDetailModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      setError(null);
      fetch(`/api/admin/experts/${expertId}/score-logs`)
        .then((res) => res.json())
        .then((json) => {
          if (json.error) {
            setError(json.error);
          } else {
            setLogs(json.logs || []);
          }
        })
        .catch(() => setError("Puan hareketleri yüklenirken hata oluştu."))
        .finally(() => setLoading(false));
    }
  }, [isOpen, expertId]);

  const actionMap: Record<string, { label: string; icon: string }> = {
    ANSWER: { label: "Soru Yanıtlama", icon: "✍️" },
    LIKE: { label: "Yanıt Beğenisi", icon: "❤️" },
    BEST_ANSWER: { label: "En İyi Cevap Seçimi", icon: "🌟" },
    ADMIN_HIGHLIGHT: { label: "Admin Tarafından Öne Çıkarılma", icon: "📌" },
    SPAM: { label: "Spam İçerik Cezası", icon: "⚠️" },
    WRONG_INFO: { label: "Hatalı Bilgi Cezası", icon: "❌" },
    ANSWER_REVERT: { label: "Silinen Yanıt (İptal)", icon: "🔄" },
    LIKE_REVERT: { label: "Geri Çekilen Beğeni (İptal)", icon: "🔄" },
    BEST_ANSWER_REVERT: { label: "Kaldırılan En İyi Cevap (İptal)", icon: "🔄" },
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-3 py-1.5 bg-[var(--surface-container-high)] hover:bg-[var(--primary)]/10 text-[var(--primary)] font-bold text-xs rounded-xl border border-[var(--primary)]/30 shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
      >
        <span>🔍 Puan Detayı</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[var(--surface)] border border-[var(--outline-variant)] rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Modal Başlık */}
            <div className="p-5 border-b border-[var(--outline-variant)] flex items-center justify-between bg-[var(--surface-container-low)]">
              <div>
                <h3 className="text-lg font-extrabold text-[var(--on-surface)] flex items-center gap-2">
                  <span>👨‍🌾</span> {expertName} — Puan Hareketleri & Detay Tablosu
                </h3>
                <p className="text-xs text-[var(--on-surface-variant)] mt-0.5">
                  Uzmanın hangi sorudan ne zaman ve ne sebeple kaç puan kazandığının detay dökümü.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-black bg-[var(--primary)]/10 text-[var(--primary)] px-3 py-1 rounded-xl border border-[var(--primary)]/30">
                  Toplam: {totalScore} Puan
                </span>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 rounded-full bg-[var(--surface-container-high)] hover:bg-[var(--outline-variant)] text-[var(--on-surface)] font-bold flex items-center justify-center transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Gövde */}
            <div className="p-5 overflow-y-auto flex-1 space-y-4">
              {loading ? (
                <div className="py-12 text-center space-y-3">
                  <div className="inline-block w-8 h-8 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-xs text-[var(--on-surface-variant)] font-bold">
                    Puan detayları yükleniyor...
                  </p>
                </div>
              ) : error ? (
                <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-700 dark:text-red-300 rounded-xl text-xs font-bold text-center">
                  ❌ {error}
                </div>
              ) : logs.length === 0 ? (
                <div className="py-12 text-center text-xs text-[var(--on-surface-variant)]">
                  Bu uzmana ait henüz puan hareketi kaydı bulunmuyor.
                </div>
              ) : (
                <div className="overflow-x-auto border border-[var(--outline-variant)] rounded-xl">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[var(--surface-container-low)] border-b border-[var(--outline-variant)] uppercase text-[var(--on-surface-variant)] font-bold">
                        <th className="py-3 px-4">Tarih & Saat</th>
                        <th className="py-3 px-4">Neden / Eylem</th>
                        <th className="py-3 px-4">İlişkili Soru / İçerik</th>
                        <th className="py-3 px-4 text-right">Puan Değişimi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--outline-variant)]">
                      {logs.map((log) => {
                        const actionInfo = actionMap[log.action] || {
                          label: log.action,
                          icon: "⚡",
                        };
                        const isPositive = log.points > 0;

                        return (
                          <tr
                            key={log.id}
                            className="hover:bg-[var(--surface-container-low)] transition-colors"
                          >
                            <td className="py-3 px-4 font-medium text-[var(--on-surface-variant)] whitespace-nowrap">
                              {format(new Date(log.createdAt), "dd MMMM yyyy, HH:mm", {
                                locale: tr,
                              })}
                            </td>

                            <td className="py-3 px-4 font-semibold text-[var(--on-surface)]">
                              <span className="flex items-center gap-1.5">
                                <span>{actionInfo.icon}</span>
                                <span>{actionInfo.label}</span>
                              </span>
                            </td>

                            <td className="py-3 px-4">
                              {log.questionInfo ? (
                                <Link
                                  href={`/soru/${log.questionInfo.id}`}
                                  target="_blank"
                                  className="text-[var(--primary)] font-bold hover:underline flex flex-col gap-0.5 group"
                                >
                                  <span className="flex items-center gap-1">
                                    <span>🔗</span>
                                    <span>{log.questionInfo.title}</span>
                                  </span>
                                  {log.questionInfo.answerSnippet && (
                                    <span className="text-[11px] font-normal text-[var(--on-surface-variant)] group-hover:text-[var(--on-surface)] italic">
                                      "{log.questionInfo.answerSnippet}"
                                    </span>
                                  )}
                                </Link>
                              ) : (
                                <span className="text-[var(--on-surface-variant)] italic">
                                  -
                                </span>
                              )}
                            </td>

                            <td className="py-3 px-4 text-right font-black text-sm whitespace-nowrap">
                              <span
                                className={
                                  isPositive
                                    ? "text-green-600 dark:text-green-400"
                                    : "text-red-600 dark:text-red-400"
                                }
                              >
                                {isPositive ? "+" : ""}
                                {log.points} Puan
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Modal Altlık */}
            <div className="p-4 border-t border-[var(--outline-variant)] bg-[var(--surface-container-low)] flex justify-end">
              <button
                onClick={() => setIsOpen(false)}
                className="btn btn-secondary px-5 py-2 text-xs font-bold rounded-xl cursor-pointer"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
