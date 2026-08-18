"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export interface AdPackageItem {
  id: string;
  title: string;
  views: string;
  impressionLimit: number;
  price: number;
  estimatedTime: string | null;
  description: string | null;
  imageUrl: string | null;
  iyzicoLink: string | null;
  isPopular: boolean;
  order: number;
  isActive: boolean;
  createdAt: string;
}

export default function AdPackageManagement() {
  const [packages, setPackages] = useState<AdPackageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<AdPackageItem | null>(null);
  const [uploading, setUploading] = useState(false);
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: "",
    views: "",
    impressionLimit: 10000,
    price: 3000,
    estimatedTime: "",
    description: "",
    imageUrl: "",
    iyzicoLink: "",
    isPopular: false,
    order: 0,
    isActive: true,
  });

  const fetchPackages = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/ad-packages");
      if (res.ok) {
        const data = await res.json();
        setPackages(data.packages || []);
      }
    } catch (err) {
      console.error("Paketler yüklenemedi", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  const handleOpenModal = (pkg?: AdPackageItem) => {
    if (pkg) {
      setEditingPackage(pkg);
      setFormData({
        title: pkg.title,
        views: pkg.views,
        impressionLimit: pkg.impressionLimit,
        price: pkg.price,
        estimatedTime: pkg.estimatedTime || "",
        description: pkg.description || "",
        imageUrl: pkg.imageUrl || "",
        iyzicoLink: pkg.iyzicoLink || "",
        isPopular: pkg.isPopular,
        order: pkg.order,
        isActive: pkg.isActive,
      });
    } else {
      setEditingPackage(null);
      setFormData({
        title: "",
        views: "",
        impressionLimit: 10000,
        price: 3000,
        estimatedTime: "",
        description: "",
        imageUrl: "",
        iyzicoLink: "",
        isPopular: false,
        order: packages.length + 1,
        isActive: true,
      });
    }
    setModalOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 4 * 1024 * 1024) {
      alert("Görsel boyutu maksimum 4 MB olmalıdır.");
      return;
    }

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("type", "AD_IMAGE");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: fd,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Yükleme hatası");

      if (data.urls && data.urls.length > 0) {
        setFormData((prev) => ({ ...prev, imageUrl: data.urls[0] }));
      }
    } catch (err: any) {
      alert(err.message || "Görsel yüklenemedi.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingPackage
        ? `/api/admin/ad-packages/${editingPackage.id}`
        : "/api/admin/ad-packages";
      const method = editingPackage ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Kaydetme başarısız.");
      }

      alert(editingPackage ? "Paket güncellendi!" : "Yeni paket oluşturuldu!");
      setModalOpen(false);
      fetchPackages();
      router.refresh();
    } catch (err: any) {
      alert(err.message || "İşlem yapılırken bir hata oluştu.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu reklam paketini silmek istediğinize emin misiniz?")) return;

    try {
      const res = await fetch(`/api/admin/ad-packages/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Silme başarısız.");

      alert("Paket silindi!");
      fetchPackages();
      router.refresh();
    } catch (err: any) {
      alert(err.message || "Hata oluştu.");
    }
  };

  const toggleActive = async (pkg: AdPackageItem) => {
    try {
      const res = await fetch(`/api/admin/ad-packages/${pkg.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !pkg.isActive }),
      });

      if (res.ok) {
        fetchPackages();
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[var(--surface-container-low)] p-5 rounded-2xl border border-[var(--outline-variant)]">
        <div>
          <h2 className="text-lg font-black text-[var(--on-surface)] flex items-center gap-2">
            <span>📦 Reklam Paketleri Yönetimi</span>
          </h2>
          <p className="text-xs text-[var(--on-surface-variant)] mt-1">
            Reklam vermek isteyen kullanıcılara gösterilecek tüm paketleri, başlıkları, görselleri, içerikleri ve İyzico ödeme linklerini buradan yönetin.
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="btn bg-[var(--primary)] text-white hover:bg-[var(--primary-container)] hover:text-[var(--on-primary-container)] font-bold text-xs px-4 py-2.5 rounded-xl shadow-md transition-all shrink-0"
        >
          ➕ Yeni Reklam Paketi Ekle
        </button>
      </div>

      {loading ? (
        <div className="p-8 text-center text-sm text-[var(--on-surface-variant)]">
          Paketler yükleniyor...
        </div>
      ) : packages.length === 0 ? (
        <div className="card p-8 text-center text-sm text-[var(--on-surface-variant)]">
          Henüz eklenmiş bir reklam paketi bulunmuyor.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className={`card p-5 relative flex flex-col justify-between border-2 transition-all ${
                pkg.isPopular ? "border-amber-500 bg-amber-500/5 shadow-md" : "border-[var(--outline-variant)]"
              } ${!pkg.isActive ? "opacity-60" : ""}`}
            >
              {pkg.isPopular && (
                <span className="absolute top-3 right-3 bg-amber-500 text-white font-black text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                  Popüler
                </span>
              )}

              <div className="space-y-3">
                {pkg.imageUrl ? (
                  <div className="w-full aspect-[16/9] rounded-xl overflow-hidden bg-black/5 dark:bg-black/30 border border-[var(--outline-variant)] flex items-center justify-center p-1.5 shadow-inner mb-2">
                    <img
                      src={pkg.imageUrl}
                      alt={pkg.title}
                      className="w-full h-full object-contain rounded-lg"
                    />
                  </div>
                ) : (
                  <div className="w-full h-24 rounded-xl bg-amber-500/10 border border-amber-300 dark:border-amber-800 flex items-center justify-center text-3xl mb-2">
                    📢
                  </div>
                )}

                <div>
                  <h3 className="font-extrabold text-base text-[var(--on-surface)]">{pkg.title}</h3>
                  <div className="text-xl font-black text-[var(--primary)] mt-0.5">
                    {pkg.price.toLocaleString("tr-TR")} TL
                  </div>
                  <span className="text-xs font-bold text-[var(--on-surface-variant)] block mt-0.5">
                    {pkg.views}
                  </span>
                  {pkg.estimatedTime && (
                    <span className="text-[11px] italic text-[var(--on-surface-variant)] block">
                      *{pkg.estimatedTime}
                    </span>
                  )}
                </div>

                {pkg.description && (
                  <p className="text-xs text-[var(--on-surface-variant)] leading-relaxed line-clamp-3">
                    {pkg.description}
                  </p>
                )}

                <div className="pt-2 border-t border-[var(--outline-variant)] text-[11px] space-y-1">
                  <div className="truncate text-gray-500">
                    <strong>İyzico Linki:</strong> {pkg.iyzicoLink || "Eklenmemiş (#)"}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 mt-4 border-t border-[var(--outline-variant)]">
                <button
                  onClick={() => toggleActive(pkg)}
                  className={`text-xs font-bold px-2.5 py-1 rounded-lg transition-colors ${
                    pkg.isActive
                      ? "bg-green-500/10 text-green-700 dark:text-green-400 border border-green-300"
                      : "bg-gray-500/10 text-gray-600 dark:text-gray-400 border border-gray-300"
                  }`}
                >
                  {pkg.isActive ? "● Aktif" : "○ Pasif"}
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenModal(pkg)}
                    className="px-3 py-1 bg-blue-500/10 hover:bg-blue-500/20 text-blue-700 dark:text-blue-400 font-bold text-xs rounded-lg transition-colors border border-blue-500/30"
                  >
                    ✏️ Düzenle
                  </button>
                  <button
                    onClick={() => handleDelete(pkg.id)}
                    className="px-3 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-700 dark:text-red-400 font-bold text-xs rounded-lg transition-colors border border-red-500/30"
                  >
                    🗑️ Sil
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Form */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="card p-6 w-full max-w-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--outline-variant)]">
              <h3 className="font-extrabold text-base text-[var(--on-surface)]">
                {editingPackage ? "Reklam Paketini Düzenle" : "Yeni Reklam Paketi Ekle"}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-gray-500 hover:text-gray-800 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--on-surface-variant)] mb-1">
                    Paket Başlığı *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="input w-full"
                    placeholder="Örn: Başlangıç Paketi"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--on-surface-variant)] mb-1">
                    Gösterim Yazısı / Sayısı *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.views}
                    onChange={(e) => setFormData({ ...formData, views: e.target.value })}
                    className="input w-full"
                    placeholder="Örn: 10.000 Gösterim"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--on-surface-variant)] mb-1">
                    Fiyat (TL) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="input w-full"
                    placeholder="3000"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--on-surface-variant)] mb-1">
                    Gösterim Limiti (Sayısal)
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.impressionLimit}
                    onChange={(e) => setFormData({ ...formData, impressionLimit: Number(e.target.value) })}
                    className="input w-full"
                    placeholder="10000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--on-surface-variant)] mb-1">
                  Tahmini Süre Metni
                </label>
                <input
                  type="text"
                  value={formData.estimatedTime}
                  onChange={(e) => setFormData({ ...formData, estimatedTime: e.target.value })}
                  className="input w-full"
                  placeholder="Tahmini Gösterim Süresi: ~15-20 Gün"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--on-surface-variant)] mb-1">
                  Açıklama / Detay Metni
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input w-full resize-none"
                  placeholder="Yeni başlayanlar için idealdir..."
                />
              </div>

              {/* Görsel Yükleme / URL */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-[var(--on-surface-variant)]">
                  Paket Afiş Görseli (Dosya Yükle veya URL)
                </label>
                <div className="flex flex-wrap items-center gap-3">
                  <label className="px-3 py-2 bg-[var(--primary)] text-white text-xs font-bold rounded-xl cursor-pointer hover:bg-[var(--primary-container)] hover:text-[var(--on-primary-container)] transition-all">
                    {uploading ? "Yükleniyor..." : "📁 Görsel Seç & Yükle (Max 4MB)"}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploading}
                      className="hidden"
                    />
                  </label>
                  {formData.imageUrl && (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, imageUrl: "" })}
                      className="text-xs text-red-500 hover:underline font-bold"
                    >
                      Kaldır
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  className="input w-full text-xs"
                  placeholder="/iyzico/reklam-baslangic.jpg veya https://..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--on-surface-variant)] mb-1">
                  İyzico Ödeme Linki
                </label>
                <input
                  type="url"
                  value={formData.iyzicoLink}
                  onChange={(e) => setFormData({ ...formData, iyzicoLink: e.target.value })}
                  className="input w-full"
                  placeholder="https://www.iyzico.com/..."
                />
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isPopular}
                    onChange={(e) => setFormData({ ...formData, isPopular: e.target.checked })}
                    className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                  />
                  <span>🌟 En Popüler Rozeti</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>✅ Aktif Paket</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[var(--outline-variant)]">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold border border-[var(--outline-variant)] rounded-xl hover:bg-[var(--surface-variant)]"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-extrabold bg-[var(--primary)] text-white rounded-xl shadow-md hover:bg-[var(--primary-container)] hover:text-[var(--on-primary-container)] transition-all"
                >
                  {editingPackage ? "Güncelle" : "Paketi Oluştur"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
