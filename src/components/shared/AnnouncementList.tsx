"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";

type AuthorType = {
  id: string;
  name: string | null;
  image?: string | null;
  avatarUrl?: string | null;
  role?: string;
};

type AnnouncementType = {
  id: string;
  title: string;
  content: string;
  isPinned: boolean;
  createdAt: Date | string;
  author: AuthorType;
};

type AnnouncementListProps = {
  initialAnnouncements: AnnouncementType[];
  isAdmin: boolean;
};

export default function AnnouncementList({
  initialAnnouncements,
  isAdmin,
}: AnnouncementListProps) {
  const [announcements, setAnnouncements] = useState<AnnouncementType[]>(initialAnnouncements);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isPinned, setIsPinned] = useState(false);
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

  const handleOpenEdit = (item: AnnouncementType) => {
    setEditingId(item.id);
    setTitle(item.title);
    setContent(item.content);
    setIsPinned(item.isPinned);
    setShowForm(true);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setLoading(true);
    setError("");

    try {
      if (editingId) {
        // Güncelle
        const res = await fetch(`/api/announcements/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, content, isPinned }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Güncelleme başarısız.");
        }
      } else {
        // Yeni ekle
        const res = await fetch("/api/announcements", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, content, isPinned }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Duyuru eklenemedi.");
        }
      }

      setShowForm(false);
      setTitle("");
      setContent("");
      setIsPinned(false);
      setEditingId(null);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu duyuruyu silmek istediğinizden emin misiniz?")) return;

    try {
      const res = await fetch(`/api/announcements/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setAnnouncements((prev) => prev.filter((item) => item.id !== id));
        router.refresh();
      } else {
        alert("Silme işlemi başarısız.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Yönetici Duyuru Ekleme Butonu */}
      {isAdmin && (
        <div className="flex justify-end">
          <button
            onClick={showForm ? () => setShowForm(false) : handleOpenCreate}
            className="btn btn-primary text-xs px-4 py-2 flex items-center gap-2 shadow cursor-pointer"
          >
            <span>{showForm ? "✕ Formu Kapat" : "📢 + Yeni Duyuru Yayınla"}</span>
          </button>
        </div>
      )}

      {/* Duyuru Ekleme / Düzenleme Formu (Sadece Admin) */}
      {isAdmin && showForm && (
        <form onSubmit={handleSubmit} className="card p-6 border-2 border-[var(--primary)] space-y-4 animate-fadeIn">
          <h3 className="font-extrabold text-base text-[var(--primary)]">
            {editingId ? "✏️ Duyuruyu Düzenle" : "📢 Yeni Duyuru Yayınla"}
          </h3>

          {error && (
            <div className="p-3 text-xs text-red-700 bg-red-50 rounded-xl border border-red-200">
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
              placeholder="Örn: Soru Cevap Sisteminde Yeni Düzenlemeler"
              className="w-full p-3 text-xs bg-[var(--surface-container-lowest)] border border-[var(--outline-variant)] rounded-xl outline-none focus:border-[var(--primary)]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[var(--on-surface)]">Duyuru Metni / İçerik</label>
            <textarea
              required
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Duyurunuzu ve detayları buraya yazın..."
              className="w-full p-3 text-xs bg-[var(--surface-container-lowest)] border border-[var(--outline-variant)] rounded-xl outline-none focus:border-[var(--primary)]"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isPinned"
              checked={isPinned}
              onChange={(e) => setIsPinned(e.target.checked)}
              className="w-4 h-4 accent-[var(--primary)] cursor-pointer"
            />
            <label htmlFor="isPinned" className="text-xs font-bold text-[var(--on-surface)] cursor-pointer">
              📌 En üste iğnele (Önemli Duyuru)
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="btn btn-ghost text-xs px-4 py-2"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={loading || !title.trim() || !content.trim()}
              className="btn btn-primary text-xs px-6 py-2"
            >
              {loading ? "Kaydediliyor..." : editingId ? "Güncelle" : "Yayınla"}
            </button>
          </div>
        </form>
      )}

      {/* Duyurular Listesi */}
      {announcements.length === 0 ? (
        <div className="card p-12 text-center space-y-3">
          <span className="text-4xl">📭</span>
          <h3 className="text-base font-bold text-[var(--on-surface)]">Henüz bir duyuru yayınlanmadı.</h3>
          <p className="text-xs text-[var(--on-surface-variant)]">
            Platform yönetimi tarafından yayınlanan genel bilgilendirmeler burada listelenecektir.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((item) => (
            <article
              key={item.id}
              className={`card p-6 space-y-4 transition-all ${
                item.isPinned
                  ? "border-l-4 border-amber-500 bg-amber-50/10 shadow-sm"
                  : ""
              }`}
            >
              {/* İğneli Rozet */}
              {item.isPinned && (
                <span className="inline-flex items-center gap-1 text-[10px] font-extrabold bg-amber-500 text-white px-2.5 py-0.5 rounded-full shadow-sm">
                  📌 ÖNEMLİ DUYURU
                </span>
              )}

              {/* Başlık */}
              <h2 className="text-lg font-extrabold text-[var(--on-surface)] leading-snug">
                {item.title}
              </h2>

              {/* Paragraf İçeriği */}
              <div className="text-xs text-[var(--on-surface)] leading-relaxed whitespace-pre-wrap">
                {item.content}
              </div>

              {/* Yazar ve Tarih Bilgisi Alt Satırı */}
              <div className="pt-3 border-t border-[var(--outline-variant)] flex flex-wrap items-center justify-between gap-3 text-xs text-[var(--on-surface-variant)]">
                <div className="flex items-center gap-2.5">
                  {item.author.image || item.author.avatarUrl ? (
                    <img
                      src={item.author.image || item.author.avatarUrl || ""}
                      alt={item.author.name || "Yönetici"}
                      className="w-7 h-7 rounded-full object-cover shrink-0 border border-[var(--primary)]/30"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-[var(--primary)] text-white font-bold flex items-center justify-center text-[10px] shrink-0">
                      {item.author.name?.charAt(0).toUpperCase() || "A"}
                    </div>
                  )}
                  <div>
                    <span className="font-bold text-[var(--on-surface)]">{item.author.name || "Yönetici"}</span>
                    <span className="bg-amber-100 text-amber-900 text-[9px] font-extrabold px-1.5 py-0.2 rounded-md ml-1.5">
                      Yönetici
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 ml-auto">
                  <span className="text-[11px] text-[var(--on-surface-variant)] font-medium">
                    📅 {new Date(item.createdAt).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })}
                    {" • "}
                    {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true, locale: tr })}
                  </span>

                  {/* Admin Düzenle / Sil Butonları */}
                  {isAdmin && (
                    <div className="flex items-center gap-2 border-l border-[var(--outline-variant)] pl-3">
                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="text-xs text-gray-600 hover:text-[var(--primary)] font-bold transition-colors"
                      >
                        ✏️ Düzenle
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-xs text-red-500 hover:text-red-700 font-bold transition-colors"
                      >
                        🗑️ Sil
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
