"use client";

import { useState } from "react";
import { getCategoryEmoji } from "@/components/home/CategoryQuestionFeed";

export interface CategoryData {
  id: string;
  name: string;
  slug: string;
  icon?: string | null;
  description?: string | null;
  order: number;
  _count?: {
    questions: number;
  };
}

interface Props {
  initialCategories: CategoryData[];
}

const PRESET_ICONS = [
  "🍂", "🐛", "🌾", "🌿", "❓", "📁", 
  "🪴", "💧", "✂️", "🍎", "🍅", "🍇", 
  "🌽", "🥔", "🍓", "🌳", "🏡", "🐝", 
  "🐄", "🌱", "🧪", "🚜", "🌻", "🫒"
];

export default function AdminCategoryManager({ initialCategories }: Props) {
  const [categories, setCategories] = useState<CategoryData[]>(initialCategories);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [icon, setIcon] = useState("");
  const [description, setDescription] = useState("");
  const [order, setOrder] = useState<number>(0);

  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleOpenCreate = () => {
    setEditingId(null);
    setName("");
    setSlug("");
    setIcon("🌱");
    setDescription("");
    // Sıradaki sırayı otomatik öner
    const maxOrder = categories.reduce((max, c) => Math.max(max, c.order || 0), 0);
    setOrder(maxOrder + 1);
    setShowForm(true);
    setErrorMsg("");
    setSuccessMsg("");
  };

  const handleOpenEdit = (cat: CategoryData) => {
    setEditingId(cat.id);
    setName(cat.name);
    setSlug(cat.slug);
    setIcon(cat.icon || getCategoryEmoji(cat.name, cat.slug));
    setDescription(cat.description || "");
    setOrder(cat.order || 0);
    setShowForm(true);
    setErrorMsg("");
    setSuccessMsg("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingId(null);
    setErrorMsg("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg("Lütfen kategori adını girin.");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      if (editingId) {
        // Güncelleme
        const res = await fetch(`/api/admin/categories/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name.trim(),
            slug: slug.trim() || undefined,
            icon: icon.trim() || null,
            description: description.trim() || null,
            order: Number(order) || 0,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Kategori güncellenemedi.");
        }

        setCategories((prev) =>
          prev.map((c) => (c.id === editingId ? data.category : c)).sort((a, b) => (a.order || 0) - (b.order || 0))
        );
        setSuccessMsg(`"${name}" kategorisi başarıyla güncellendi!`);
        setShowForm(false);
      } else {
        // Yeni Oluşturma
        const res = await fetch("/api/admin/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name.trim(),
            slug: slug.trim() || undefined,
            icon: icon.trim() || null,
            description: description.trim() || null,
            order: Number(order) || 0,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Kategori eklenemedi.");
        }

        setCategories((prev) =>
          [...prev, data.category].sort((a, b) => (a.order || 0) - (b.order || 0))
        );
        setSuccessMsg(`"${name}" kategorisi başarıyla eklendi ve slider'a dahil edildi!`);
        setShowForm(false);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "İşlem sırasında bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (cat: CategoryData) => {
    if ((cat._count?.questions || 0) > 0) {
      alert(`Bu kategoriye ait ${cat._count?.questions} adet soru bulunmaktadır. İçeriği korumak amacıyla soru içeren kategoriler silinemez.`);
      return;
    }

    if (!confirm(`"${cat.name}" kategorisini sistemden silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`)) {
      return;
    }

    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await fetch(`/api/admin/categories/${cat.id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Kategori silinemedi.");
      }

      setCategories((prev) => prev.filter((c) => c.id !== cat.id));
      setSuccessMsg(`"${cat.name}" kategorisi başarıyla kaldırıldı.`);
    } catch (err: any) {
      setErrorMsg(err.message || "Kategori silinirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  // Arama filtresi
  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.description && c.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Üst Başlık ve Yeni Ekle Butonu */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[var(--surface-container)] p-6 rounded-2xl border border-[var(--outline-variant)]">
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--on-surface)] flex items-center gap-2">
            <span>📁</span>
            <span>Kategori Yönetimi</span>
          </h1>
          <p className="text-xs text-[var(--on-surface-variant)] mt-1">
            Ana sayfa akışındaki yatay slider'da ve soru sorma formunda yer alan kategorileri, simgelerini ve sıralarını yönetin.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="btn btn-primary font-bold text-xs px-4 py-2.5 rounded-xl shadow flex items-center gap-2 shrink-0 cursor-pointer"
        >
          <span>➕</span>
          <span>Yeni Kategori Ekle</span>
        </button>
      </div>

      {/* Başarı / Hata Mesajları */}
      {successMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 p-4 rounded-xl text-xs font-bold flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <span>✅</span>
            <span>{successMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessMsg("")}
            className="text-emerald-700 hover:text-emerald-900 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 p-4 rounded-xl text-xs font-bold flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <span>⚠️</span>
            <span>{errorMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMsg("")}
            className="text-rose-700 hover:text-rose-900 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Kategori Ekleme / Düzenleme Formu */}
      {showForm && (
        <div className="card p-6 border-2 border-[var(--primary)] shadow-lg animate-in fade-in duration-200">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-[var(--outline-variant)]">
            <h3 className="font-extrabold text-base text-[var(--on-surface)] flex items-center gap-2">
              <span>{editingId ? "✏️ Kategoriyi Düzenle" : "➕ Yeni Kategori Oluştur"}</span>
            </h3>
            <button
              type="button"
              onClick={handleCloseForm}
              className="text-xs text-[var(--on-surface-variant)] hover:text-[var(--on-surface)] font-bold px-2 py-1 rounded-lg bg-[var(--surface-container-high)] cursor-pointer"
            >
              Vazgeç ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              
              {/* İkon Seçimi & Önizleme */}
              <div className="md:col-span-4 space-y-2">
                <label className="text-xs font-bold text-[var(--on-surface-variant)] uppercase tracking-wider block">
                  Kategori İkonu / Emoji
                </label>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[var(--surface-container-high)] border border-[var(--outline-variant)] flex items-center justify-center text-2xl shrink-0 shadow-inner">
                    {icon || getCategoryEmoji(name, slug)}
                  </div>
                  <input
                    type="text"
                    value={icon}
                    onChange={(e) => setIcon(e.target.value)}
                    placeholder="Örn: 🍂 veya 🐛"
                    className="w-full bg-[var(--surface-container-lowest)] border border-[var(--outline-variant)] rounded-xl px-3.5 py-2.5 text-xs text-[var(--on-surface)] focus:border-[var(--primary)] focus:outline-none"
                  />
                </div>

                {/* Hızlı İkon Seçici */}
                <div className="pt-1">
                  <span className="text-[11px] text-[var(--on-surface-variant)] block mb-1">
                    Hızlı Simge Seçin:
                  </span>
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1.5 bg-[var(--surface-container-low)] rounded-xl border border-[var(--outline-variant)]/50">
                    {PRESET_ICONS.map((pIcon, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setIcon(pIcon)}
                        className={`w-7 h-7 rounded-lg text-sm flex items-center justify-center hover:scale-110 transition-transform cursor-pointer ${
                          icon === pIcon ? "bg-[var(--primary)] text-white shadow-sm" : "hover:bg-white/40"
                        }`}
                      >
                        {pIcon}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Kategori Adı ve Detayları */}
              <div className="md:col-span-8 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-[var(--on-surface-variant)] uppercase tracking-wider block mb-1.5">
                      Kategori İsmi *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Örn: Meyve Ağaçları Bakımı"
                      className="w-full bg-[var(--surface-container-lowest)] border border-[var(--outline-variant)] rounded-xl px-3.5 py-2.5 text-xs text-[var(--on-surface)] focus:border-[var(--primary)] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[var(--on-surface-variant)] uppercase tracking-wider block mb-1.5">
                      Slider Görüntülenme Sırası
                    </label>
                    <input
                      type="number"
                      value={order}
                      onChange={(e) => setOrder(parseInt(e.target.value) || 0)}
                      placeholder="Örn: 1"
                      className="w-full bg-[var(--surface-container-lowest)] border border-[var(--outline-variant)] rounded-xl px-3.5 py-2.5 text-xs text-[var(--on-surface)] focus:border-[var(--primary)] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-[var(--on-surface-variant)] uppercase tracking-wider block mb-1.5">
                    Açıklama (Opsiyonel)
                  </label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Kategori hakkında kısa açıklama..."
                    className="w-full bg-[var(--surface-container-lowest)] border border-[var(--outline-variant)] rounded-xl px-3.5 py-2 text-xs text-[var(--on-surface)] focus:border-[var(--primary)] focus:outline-none"
                  />
                </div>

                {/* Canlı Slider Butonu Önizlemesi */}
                <div className="p-3 bg-[var(--surface-container-low)] rounded-xl border border-[var(--outline-variant)]/60 flex items-center justify-between">
                  <span className="text-[11px] text-[var(--on-surface-variant)] font-bold">
                    Ana Sayfa Slider Önizlemesi:
                  </span>
                  <div className="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-[#006537] text-white flex items-center gap-1.5 shadow-sm">
                    <span>{icon || getCategoryEmoji(name, slug)}</span>
                    <span>{name || "Kategori Adı"}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20">
                      0
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Butonlar */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--outline-variant)]">
              <button
                type="button"
                onClick={handleCloseForm}
                disabled={loading}
                className="btn bg-[var(--surface-container-high)] text-[var(--on-surface)] text-xs font-bold px-4 py-2.5 rounded-xl cursor-pointer"
              >
                İptal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary text-xs font-bold px-6 py-2.5 rounded-xl shadow cursor-pointer"
              >
                {loading ? "Kaydediliyor..." : editingId ? "Değişiklikleri Kaydet" : "Kategoriyi Ekle"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Arama ve Filtreleme */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Kategori adı veya açıklamada ara..."
            className="w-full bg-[var(--surface-container-lowest)] border border-[var(--outline-variant)] rounded-xl pl-9 pr-3.5 py-2 text-xs text-[var(--on-surface)] focus:border-[var(--primary)] focus:outline-none"
          />
          <span className="absolute left-3 top-2.5 text-xs text-[var(--on-surface-variant)]">
            🔍
          </span>
        </div>

        <span className="text-xs text-[var(--on-surface-variant)] font-semibold">
          Toplam <strong>{categories.length}</strong> Kategori
        </span>
      </div>

      {/* Kategoriler Tablosu */}
      <div className="card overflow-hidden p-0 border border-[var(--outline-variant)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[var(--surface-container-high)] text-[var(--on-surface-variant)] font-bold uppercase tracking-wider text-[10px] border-b border-[var(--outline-variant)]">
              <tr>
                <th className="py-3 px-4 w-16 text-center">Sıra</th>
                <th className="py-3 px-4 w-16 text-center">İkon</th>
                <th className="py-3 px-4">Kategori Adı</th>
                <th className="py-3 px-4">Slug (URL)</th>
                <th className="py-3 px-4">Açıklama</th>
                <th className="py-3 px-4 text-center">Soru Sayısı</th>
                <th className="py-3 px-4 text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--outline-variant)]/50">
              {filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-[var(--on-surface-variant)]">
                    Kategori bulunamadı.
                  </td>
                </tr>
              ) : (
                filteredCategories.map((cat) => {
                  const displayIcon = cat.icon || getCategoryEmoji(cat.name, cat.slug);
                  const qCount = cat._count?.questions || 0;

                  return (
                    <tr
                      key={cat.id}
                      className="hover:bg-[var(--surface-container-low)] transition-colors"
                    >
                      {/* Sıra */}
                      <td className="py-3.5 px-4 text-center font-extrabold text-[var(--primary)]">
                        #{cat.order}
                      </td>

                      {/* İkon */}
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-[var(--surface-container-high)] text-lg shadow-sm">
                          {displayIcon}
                        </span>
                      </td>

                      {/* Kategori Adı */}
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-sm text-[var(--on-surface)] block">
                          {cat.name}
                        </span>
                      </td>

                      {/* Slug */}
                      <td className="py-3.5 px-4 font-mono text-[11px] text-[var(--on-surface-variant)]">
                        {cat.slug}
                      </td>

                      {/* Açıklama */}
                      <td className="py-3.5 px-4 text-[var(--on-surface-variant)] max-w-xs truncate">
                        {cat.description || "—"}
                      </td>

                      {/* Soru Sayısı */}
                      <td className="py-3.5 px-4 text-center">
                        <span className={`px-2.5 py-1 rounded-full font-bold text-[11px] ${
                          qCount > 0
                            ? "bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20"
                            : "bg-[var(--surface-container-high)] text-[var(--on-surface-variant)]"
                        }`}>
                          💬 {qCount} Soru
                        </span>
                      </td>

                      {/* İşlemler */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(cat)}
                            className="btn bg-[var(--surface-container-high)] hover:bg-[var(--primary)] hover:text-white text-[var(--on-surface)] text-[11px] font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                          >
                            ✏️ Düzenle
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(cat)}
                            disabled={loading}
                            className={`btn text-[11px] font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                              qCount > 0
                                ? "opacity-40 cursor-not-allowed bg-gray-200 text-gray-500"
                                : "bg-rose-500/10 hover:bg-rose-600 hover:text-white text-rose-600 border border-rose-500/20"
                            }`}
                            title={qCount > 0 ? "Soru içeren kategoriler silinemez" : "Kategoriyi Sil"}
                          >
                            🗑️ Sil
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
