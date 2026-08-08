"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export type NotificationItem = {
  id: string;
  type: string;
  message: string;
  createdAt: string;
};

type Props = {
  userId: string;
  isBanned: boolean;
  bannedUntil: string | null;
  banReason: string | null;
  notifications: NotificationItem[];
};

export function UserModerationControls({ userId, isBanned, bannedUntil, banReason, notifications }: Props) {
  const [loading, setLoading] = useState(false);
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleAction = async (actionType: "WARN" | "BAN_15_DAYS" | "BAN_PERMANENT" | "UNBAN") => {
    let confirmMsg = "";
    if (actionType === "WARN") confirmMsg = "Kullanıcıya resmi uyarı bildirimi göndermek istiyor musunuz?";
    if (actionType === "BAN_15_DAYS") confirmMsg = "Kullanıcıyı 15 GÜN süreyle banlamak istediğinizden emin misiniz?";
    if (actionType === "BAN_PERMANENT") confirmMsg = "Kullanıcıyı SÜRESİZ olarak sistemden uzaklaştırmak istediğinizden emin misiniz?";
    if (actionType === "UNBAN") confirmMsg = "Kullanıcının ban cezasını kaldırmak istiyor musunuz?";

    if (!confirm(confirmMsg)) return;

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(`/api/admin/users/${userId}/moderate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: actionType, reason }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage(data.message || "İşlem tamamlandı.");
        setReason("");
        router.refresh();
      } else {
        alert(data.error || "İşlem sırasında bir hata oluştu.");
      }
    } catch (err) {
      alert("Bağlantı hatası.");
    } finally {
      setLoading(false);
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "ADMIN_WARNING":
        return <span className="bg-amber-500/20 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded text-[10px] font-bold">⚠️ ADMİN UYARISI</span>;
      case "ADMIN_BAN_15":
        return <span className="bg-orange-500/20 text-orange-800 dark:text-orange-300 px-2 py-0.5 rounded text-[10px] font-bold">⏳ 15 GÜN BAN</span>;
      case "ADMIN_BAN_PERMANENT":
        return <span className="bg-red-500/20 text-red-800 dark:text-red-300 px-2 py-0.5 rounded text-[10px] font-bold">⛔ SÜRESİZ BAN</span>;
      case "ADMIN_UNBAN":
        return <span className="bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded text-[10px] font-bold">🔓 BAN KALDIRILDI</span>;
      default:
        return <span className="bg-blue-500/20 text-blue-800 dark:text-blue-300 px-2 py-0.5 rounded text-[10px] font-bold">📢 {type}</span>;
    }
  };

  const now = new Date();
  const isCurrentlyBanned = isBanned && (!bannedUntil || new Date(bannedUntil) > now);

  return (
    <div className="card p-6 space-y-6 border-l-4 border-amber-500 bg-amber-50/10 shadow-md">
      <div className="flex items-center justify-between">
        <h3 className="font-extrabold text-base text-[var(--on-surface)] flex items-center gap-2">
          <span>⚖️ Moderasyon & Cezalandırma Paneli</span>
        </h3>
        {isCurrentlyBanned ? (
          <span className="bg-red-600 text-white font-extrabold text-xs px-3 py-1.5 rounded-xl shadow">
            ⛔ Şu An Banlı ({bannedUntil ? `Bitiş: ${new Date(bannedUntil).toLocaleDateString('tr-TR')}` : 'Süresiz Ban'})
          </span>
        ) : (
          <span className="bg-emerald-600 text-white font-extrabold text-xs px-3 py-1.5 rounded-xl shadow">
            ✅ Hesap Aktif
          </span>
        )}
      </div>

      {isCurrentlyBanned && banReason && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-900 dark:text-red-200 p-3 rounded-xl text-xs space-y-1">
          <div className="font-bold">Aktif Ban Nedeni:</div>
          <p>{banReason}</p>
        </div>
      )}

      {message && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-900 dark:text-emerald-200 p-3 rounded-xl text-xs font-bold">
          {message}
        </div>
      )}

      {/* Ceza Sebebi Açıklama Girdisi */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-[var(--on-surface-variant)] uppercase tracking-wider block">
          Ceza veya Uyarı Açıklaması (Kullanıcıya İletilecek Sebep)
        </label>
        <input
          type="text"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Örn: Hakaret içerikli yorum paylaşımı sebebiyle..."
          className="w-full bg-[var(--surface-container-lowest)] border border-[var(--outline-variant)] rounded-xl p-3.5 text-xs text-[var(--on-surface)] focus:border-[var(--primary)] outline-none"
        />
      </div>

      {/* Aksiyon Butonları */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Uyarı Gönder */}
        <button
          type="button"
          disabled={loading}
          onClick={() => handleAction("WARN")}
          className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs py-3 px-4 rounded-xl shadow transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
        >
          <span>📩 Uyarı Gönder</span>
        </button>

        {/* 15 Gün Süreli Ban */}
        <button
          type="button"
          disabled={loading}
          onClick={() => handleAction("BAN_15_DAYS")}
          className="bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs py-3 px-4 rounded-xl shadow transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
        >
          <span>⏳ 15 Gün Ban Ver</span>
        </button>

        {/* Süresiz Ban */}
        <button
          type="button"
          disabled={loading}
          onClick={() => handleAction("BAN_PERMANENT")}
          className="bg-red-700 hover:bg-red-800 text-white font-bold text-xs py-3 px-4 rounded-xl shadow transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
        >
          <span>⛔ Süresiz Ban Ver</span>
        </button>

        {/* Ban Kaldır */}
        <button
          type="button"
          disabled={loading}
          onClick={() => handleAction("UNBAN")}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3 px-4 rounded-xl shadow transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
        >
          <span>🔓 Banı/Cezayı Kaldır</span>
        </button>
      </div>

      {/* 📜 GÖNDERİLEN GEÇMİŞ BİLDİRİMLER VE UYARILAR KAYDI (Kutunun Altında) */}
      <div className="pt-4 border-t border-[var(--outline-variant)] space-y-3">
        <h4 className="font-extrabold text-xs text-[var(--on-surface)] uppercase tracking-wider flex items-center justify-between">
          <span>📜 Kullanıcıya Gönderilen Geçmiş Bildirimler ve Uyarılar ({notifications.length})</span>
          <span className="text-[10px] text-[var(--on-surface-variant)] normal-case">Tarih & Tür Sıralı</span>
        </h4>

        {notifications.length === 0 ? (
          <div className="bg-[var(--surface-container-lowest)] p-4 rounded-xl text-center text-xs text-[var(--on-surface-variant)] border border-[var(--outline-variant)]">
            Bu kullanıcıya daha önce gönderilmiş herhangi bir bildirim veya uyarı kaydı bulunmuyor.
          </div>
        ) : (
          <div className="max-h-60 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
            {notifications.map((item) => (
              <div
                key={item.id}
                className="bg-[var(--surface-container-lowest)] border border-[var(--outline-variant)] p-3 rounded-xl space-y-1.5 text-xs shadow-xs"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {getTypeBadge(item.type)}
                  </div>
                  <span className="text-[10px] font-mono text-[var(--on-surface-variant)] shrink-0">
                    🕒 {new Date(item.createdAt).toLocaleString('tr-TR')}
                  </span>
                </div>
                <p className="text-[var(--on-surface)] leading-relaxed font-medium pt-0.5">
                  {item.message}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
