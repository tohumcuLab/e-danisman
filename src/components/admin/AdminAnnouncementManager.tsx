"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";

type AuthorType = {
  id: string;
  name: string | null;
  image?: string | null;
  avatarUrl?: string | null;
  role?: string;
};

export type AnnouncementItemType = {
  id: string;
  title: string;
  content: string;
  isPinned: boolean;
  createdAt: Date | string;
  author: AuthorType;
};

type AdminAnnouncementManagerProps = {
  initialAnnouncements: AnnouncementItemType[];
};

export default function AdminAnnouncementManager({
  initialAnnouncements,
}: AdminAnnouncementManagerProps) {
  const [announcements, setAnnouncements] = useState<AnnouncementItemType[]>(initialAnnouncements);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isPinned, setIsPinned] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleOpenCreate = () => {
    setEditingId(null);
    setTitle("");
    setContent("");
    setIsPinned(false);
    setShowForm(true);
    setError("");
  };

  const handleOpenEdit = (item: AnnouncementItemType) => {
    setEditingId(item.id);
    setTitle(item.title);
    setContent(item.content);
    setIsPinned(item.isPinned);
    setShowForm(true);
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setLoading(true);
    setError("");

    try {
      if (editingId) {
        // Düzenleme API İsteği
        const res = await fetch(`/api/announcements/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, content, isPinned }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Güncelleme başarısız.");
        }

        const data = await res.json();
        setAnnouncements((prev) =>
          prev.map((item) => (item.id === editingId ? data.announcement : item))
        );
      } else {
        // Yeni Oluşturma API İsteği
        const res = await fetch("/api/announcements", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, content, isPinned }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Duyuru yayınlanamadı.");
        }

        const data = await res.json();
        setAnnouncements((prev) => [data.announcement, ...prev]);
      }

      setShowForm(false);
      setTitle("");
      setContent("");
      setIsPinned(false);
      setEditingId(null);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu duyuruyu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.")) return;

    try {
      const res = await fetch(`/api/announcements/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setAnnouncements((prev) => prev.filter((item) => item.id !== id));
        router.refresh();
      } else {
        alert("Silme işlemi başarısız oldu.");
      }
    } catch (err) {
      console.error("Duyuru silme hatası:", err);
      alert("Bir sistem hatası oluştu.");
    }
  };

  const filteredAnnouncements = announcements.filter(
    (item) =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pinnedCount = announcements.filter((item) => item.isPinned).length;

  return (
    <div className="space-y-6">
      {/* Üst Başlık ve Özet Metrikleri */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[var(--surface-container-lowest)] p-5 rounded-2xl border border-[var(--outline-variant)] shadow-sm">
        <div>
          <h1 className="text-xl font-extrabold text-[var(--on-surface)] flex items-center gap-2">
            <span>📢</span> Duyuru Yönetimi
          </h1>
          <p className="text-xs text-[var(--on-surface-variant)] mt-1">
            Platform kullanıcılarına gösterilecek duyuruları, sistem yeniliklerini ve blog tarzı haberleri buradan yayınlayın.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/duyurular"
            target="_blank"
            className="btn btn-ghost text-xs px-3 py-2 border border-[var(--outline-variant)] hover:bg-[var(--surface-variant)] rounded-xl flex items-center gap-1 font-semibold"
          >
            <span>👁️ Canlı Sayfayı Gör</span>
          </Link>

          <button
            onClick={showForm ? () => setShowForm(false) : handleOpenCreate}
            className="btn btn-primary text-xs px-4 py-2 flex items-center gap-2 rounded-xl shadow cursor-pointer font-bold"
          >
            <span>{showForm ? "✕ Formu Kapat" : "➕ Yeni Duyuru Ekle"}</span>
          </button>
        </div>
      </div>

      {/* İstatistikler */}
      <div className="grid grid-cols-2 sm:grid-cols-2 gap-4">
        <div className="card p-4 border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)] flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center font-bold text-lg">
            📢
          </div>
          <div>
            <div className="text-xs text-[var(--on-surface-variant)] font-medium">Toplam Duyuru</div>
            <div className="text-lg font-extrabold text-[var(--on-surface)]">{announcements.length}</div>
          </div>
        </div>

        <div className="card p-4 border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)] flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-amber-600 flex items-center justify-center font-bold text-lg">
            📌
          </div>
          <div>
            <div className="text-xs text-[var(--on-surface-variant)] font-medium">Önemli / İğneli Duyuru</div>
            <div className="text-lg font-extrabold text-[var(--on-surface)]">{pinnedCount}</div>
          </div>
        </div>
      </div>

      {/* Duyuru Ekleme / Düzenleme Formu */}
      {showForm && (
        <form onSubmit={handleSubmit} className="card p-6 border-2 border-[var(--primary)] space-y-4 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between border-b border-[var(--outline-variant)]/60 pb-3">
            <h3 className="font-extrabold text-base text-[var(--primary)] flex items-center gap-2">
              <span>{editingId ? "✏️" : "📝"}</span>
              <span>{editingId ? "Duyuruyu Düzenle" : "Yeni Duyuru Yayınla"}</span>
            </h3>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-xs text-[var(--on-surface-variant)] hover:text-red-600 font-bold"
            >
              ✕ Kapat
            </button>
          </div>

          {error && (
            <div className="p-3 text-xs text-red-700 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800/40">
              ⚠️ {error}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold text-[var(--on-surface)]">Duyuru Başlığı</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Örn: 2026 Üretim Sezonu Gübre Desteği Güncellendi"
              className="w-full p-3 text-xs bg-[var(--surface-container-lowest)] border border-[var(--outline-variant)] rounded-xl outline-none focus:border-[var(--primary)] font-medium"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[var(--on-surface)]">Duyuru İçeriği / Metin</label>
            <textarea
              required
              rows={6}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Duyuru detaylarını ve metnini buraya girin..."
              className="w-full p-3 text-xs bg-[var(--surface-container-lowest)] border border-[var(--outline-variant)] rounded-xl outline-none focus:border-[var(--primary)] font-normal leading-relaxed"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="adminIsPinned"
              checked={isPinned}
              onChange={(e) => setIsPinned(e.target.checked)}
              className="w-4 h-4 accent-[var(--primary)] cursor-pointer rounded"
            />
            <label htmlFor="adminIsPinned" className="text-xs font-bold text-[var(--on-surface)] cursor-pointer select-none">
              📌 En üste sabitle (Önemli Duyuru olarak öne çıkarılsın)
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[var(--outline-variant)]/40">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="btn btn-ghost text-xs px-4 py-2 rounded-xl"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={loading || !title.trim() || !content.trim()}
              className="btn btn-primary text-xs px-6 py-2 rounded-xl font-bold"
            >
              {loading ? "Kaydediliyor..." : editingId ? "Güncelle" : "Yayınla"}
            </button>
          </div>
        </form>
      )}

      {/* Arama / Filtreleme Çubuğu */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Duyurularda başlık veya içerik ara..."
            className="w-full pl-9 pr-4 py-2.5 text-xs bg-[var(--surface-container-lowest)] border border-[var(--outline-variant)] rounded-xl outline-none focus:border-[var(--primary)]"
          />
          <span className="absolute left-3 top-2.5 text-xs text-[var(--on-surface-variant)]">🔍</span>
        </div>
      </div>

      {/* Duyurular Listesi */}
      {filteredAnnouncements.length === 0 ? (
        <div className="card p-10 text-center space-y-2 border border-[var(--outline-variant)]">
          <span className="text-3xl">📭</span>
          <h3 className="text-sm font-bold text-[var(--on-surface)]">
            {searchTerm ? "Aramanıza uygun duyuru bulunamadı." : "Henüz yayınlanmış bir duyuru yok."}
          </h3>
          <p className="text-xs text-[var(--on-surface-variant)]">
            {searchTerm ? "Farklı kelimeler aramayı deneyin." : "Yukarıdaki 'Yeni Duyuru Ekle' butonundan ilk duyuruyu oluşturabilirsiniz."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAnnouncements.map((item) => (
            <div
              key={item.id}
              className={`card p-5 space-y-3 transition-all border ${
                item.isPinned
                  ? "border-l-4 border-amber-500 bg-amber-50/10"
                  : "border-[var(--outline-variant)] bg-[var(--surface-container-lowest)]"
              }`}
            >
              {/* Üst Etiketler & İşlem Butonları */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  {item.isPinned && (
                    <span className="text-[10px] font-extrabold bg-amber-500 text-white px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1">
                      📌 ÖNEMLİ DUYURU
                    </span>
                  )}
                  <span className="text-[11px] text-[var(--on-surface-variant)]">
                    📅 {new Date(item.createdAt).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })}
                    {" • "}
                    {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true, locale: tr })}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEdit(item)}
                    className="text-xs bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 hover:bg-blue-100 px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer"
                  >
                    ✏️ Düzenle
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="text-xs bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400 hover:bg-red-100 px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer"
                  >
                    🗑️ Sil
                  </button>
                </div>
              </div>

              {/* Duyuru Başlığı */}
              <h2 className="text-base font-extrabold text-[var(--on-surface)] leading-snug">
                {item.title}
              </h2>

              {/* Duyuru Metni */}
              <div className="text-xs text-[var(--on-surface)] leading-relaxed whitespace-pre-wrap bg-[var(--surface-container-low)] p-3.5 rounded-xl font-normal">
                {item.content}
              </div>

              {/* Yazar Bilgisi Alt Satırı */}
              <div className="pt-2 border-t border-[var(--outline-variant)]/40 flex items-center gap-2 text-xs text-[var(--on-surface-variant)]">
                {item.author.image || item.author.avatarUrl ? (
                  <img
                    src={item.author.image || item.author.avatarUrl || ""}
                    alt={item.author.name || "Yönetici"}
                    className="w-6 h-6 rounded-full object-cover shrink-0 border border-[var(--primary)]/30"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-[var(--primary)] text-white font-bold flex items-center justify-center text-[10px] shrink-0">
                    {item.author.name?.charAt(0).toUpperCase() || "A"}
                  </div>
                )}
                <span className="font-bold text-[var(--on-surface)]">{item.author.name || "Yönetici"}</span>
                <span className="bg-amber-100 text-amber-900 text-[9px] font-extrabold px-1.5 py-0.2 rounded-md">
                  Yönetici
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
