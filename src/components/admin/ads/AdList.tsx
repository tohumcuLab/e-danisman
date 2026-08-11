"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";

export interface AdItem {
  id: string;
  type: string;
  placement: string;
  title: string;
  networkCode?: string | null;
  imageUrl?: string | null;
  destinationUrl?: string | null;
  videoUrl?: string | null;
  startDate?: Date | string | null;
  endDate?: Date | string | null;
  impressionLimit?: number | null;
  impressionCount: number;
  clickCount: number;
  creditReward?: number | null;
  order?: number | null;
  isActive: boolean;
  createdAt: Date | string;
}

interface AdListProps {
  ads: AdItem[];
  onEdit: (ad: AdItem) => void;
}

export default function AdList({ ads, onEdit }: AdListProps) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`"${title}" başlıklı reklamı silmek istediğinize emin misiniz?`)) {
      return;
    }

    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/ads/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Silinemedi");
      }

      router.refresh();
    } catch (err: any) {
      alert("Hata: " + err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleActive = async (ad: AdItem) => {
    setTogglingId(ad.id);
    try {
      const res = await fetch(`/api/admin/ads/${ad.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !ad.isActive }),
      });

      if (!res.ok) {
        throw new Error("Durum değiştirilemedi");
      }

      router.refresh();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setTogglingId(null);
    }
  };

  if (ads.length === 0) {
    return (
      <div className="card p-12 text-center text-[var(--on-surface-variant)] border border-dashed border-[var(--outline-variant)] rounded-xl">
        <div className="text-4xl mb-3">📢</div>
        <p className="font-semibold text-lg">Bu kategoride henüz reklam bulunmuyor.</p>
        <p className="text-sm mt-1 text-[var(--on-surface-variant)]">
          Yukarıdaki "Yeni Reklam Ekle" butonuna tıklayarak ilk reklamı ekleyebilirsiniz.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {ads.map((ad) => {
        const isGoogle = ad.type === "GOOGLE";
        const createdDate = new Date(ad.createdAt);
        const startDateFormatted = ad.startDate
          ? new Date(ad.startDate).toLocaleDateString("tr-TR")
          : "Hemen";
        const endDateFormatted = ad.endDate
          ? new Date(ad.endDate).toLocaleDateString("tr-TR")
          : "Süresiz";

        return (
          <div
            key={ad.id}
            className={`card p-5 border rounded-xl flex flex-col justify-between transition-all ${
              ad.isActive
                ? "border-[var(--outline-variant)] bg-[var(--surface)] shadow-sm hover:shadow-md"
                : "border-gray-300 bg-gray-50/60 dark:bg-gray-900/40 opacity-75"
            }`}
          >
            <div>
              {/* Header: Badge & Status & Actions */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wide ${
                      isGoogle
                        ? "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300"
                        : "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
                    }`}
                  >
                    {isGoogle ? "🌐 Google Ads" : "🖼️ Manuel Reklam"}
                  </span>
                  
                  <span className="text-xs px-2 py-1 rounded border border-gray-300 bg-gray-50 text-gray-700 font-medium tracking-wide">
                    {ad.placement === "REWARD" ? "🏆 Kredi Sayfası" : "📰 Akış İçi"}
                  </span>

                  <span className="text-xs px-2 py-1 rounded border border-blue-200 bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 font-bold tracking-wide">
                    📌 Sıra No: {ad.order && ad.order > 0 ? ad.order : "Karışık (0)"}
                  </span>

                  <button
                    onClick={() => handleToggleActive(ad)}
                    disabled={togglingId === ad.id}
                    className={`text-xs px-2.5 py-0.5 rounded-full font-medium transition cursor-pointer ${
                      ad.isActive
                        ? "bg-green-100 text-green-700 hover:bg-green-200"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    {togglingId === ad.id
                      ? "..."
                      : ad.isActive
                      ? "● Aktif"
                      : "○ Pasif"}
                  </button>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onEdit(ad)}
                    className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg text-xs font-semibold transition flex items-center gap-1 border border-gray-200"
                    title="Reklamı Düzenle"
                  >
                    ✏️ Düzenle
                  </button>
                  <button
                    onClick={() => handleDelete(ad.id, ad.title)}
                    disabled={deletingId === ad.id}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg text-xs font-semibold transition border border-red-200"
                    title="Reklamı Sil"
                  >
                    {deletingId === ad.id ? "..." : "🗑️ Sil"}
                  </button>
                </div>
              </div>

              {/* Title */}
              <h3 className="font-bold text-base text-[var(--on-surface)] mb-3 line-clamp-2">
                {ad.title}
              </h3>

              {/* Preview Box / Content */}
              <div className="mb-4 bg-[var(--surface-variant)]/60 p-3 rounded-lg border border-[var(--outline-variant)]">
                {isGoogle ? (
                  <div>
                    <div className="text-[11px] font-semibold text-[var(--on-surface-variant)] mb-1">
                      Reklam Kodu (HTML / Script):
                    </div>
                    <div className="bg-slate-900 text-green-400 p-2.5 rounded font-mono text-[11px] max-h-24 overflow-y-auto break-all">
                      {ad.networkCode || "Kod bulunmuyor"}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {ad.imageUrl || ad.videoUrl ? (
                      <div className="flex gap-3 items-center">
                        {(() => {
                          const mediaUrl = (ad.imageUrl || ad.videoUrl)!;
                          const isVideo = mediaUrl.match(/\.(mp4|webm|ogg)$/i) || mediaUrl.includes("video");
                          return (
                            <>
                              <div className="w-24 h-18 rounded-md overflow-hidden bg-white border border-gray-200 shrink-0 flex items-center justify-center">
                                {isVideo ? (
                                  <video
                                    src={mediaUrl}
                                    className="max-w-full max-h-full object-cover"
                                  />
                                ) : (
                                  <img
                                    src={mediaUrl}
                                    alt={ad.title}
                                    className="max-w-full max-h-full object-contain"
                                  />
                                )}
                              </div>
                              <div className="text-xs overflow-hidden flex-1">
                                <div className="font-medium text-gray-600 mb-0.5 truncate">
                                  Medya ({isVideo ? "Video" : "Görsel"}):
                                </div>
                                <a
                                  href={mediaUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline truncate block"
                                >
                                  {mediaUrl}
                                </a>
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    ) : (
                      <div className="text-xs text-gray-500 italic">Medya yüklenmemiş</div>
                    )}

                    {ad.destinationUrl && (
                      <div className="text-xs border-t border-gray-200 pt-1.5 flex items-center gap-1.5 truncate">
                        <span className="font-bold text-gray-700 shrink-0">Hedef Link:</span>
                        <a
                          href={ad.destinationUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 font-medium hover:underline truncate"
                        >
                          {ad.destinationUrl}
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Footer Stats & Meta */}
            <div className="pt-3 border-t border-[var(--outline-variant)] text-xs text-[var(--on-surface-variant)] space-y-2">
              <div className="flex justify-between items-center bg-gray-100 dark:bg-gray-800 p-2 rounded-lg font-medium">
                <div>
                  👁️ Gösterim: <strong className="text-[var(--on-surface)]">{ad.impressionCount}</strong>
                  {ad.impressionLimit ? ` / ${ad.impressionLimit}` : ""}
                </div>
                <div>
                  🎯 Tıklama: <strong className="text-amber-600 dark:text-amber-400">{ad.clickCount}</strong>
                </div>
              </div>

              <div className="flex justify-between items-center text-[11px] text-gray-500">
                <span>
                  📅 Yayın: {startDateFormatted} - {endDateFormatted}
                </span>
                <span>
                  Eklenme: {formatDistanceToNow(createdDate, { addSuffix: true, locale: tr })}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
