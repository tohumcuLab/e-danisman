"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export interface AdData {
  id?: string;
  title: string;
  type: string; // "GOOGLE" | "MANUAL"
  placement?: string; // "FEED" | "REWARD"
  networkCode?: string | null;
  imageUrl?: string | null;
  videoUrl?: string | null;
  destinationUrl?: string | null;
  startDate?: string | Date | null;
  endDate?: string | Date | null;
  impressionLimit?: number | null;
  creditReward?: number | null;
  isActive?: boolean;
}

interface AdFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: AdData | null;
}

export default function AdFormModal({ isOpen, onClose, initialData }: AdFormModalProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const [type, setType] = useState<"GOOGLE" | "MANUAL">("MANUAL");
  const [placement, setPlacement] = useState<"FEED" | "REWARD">("FEED");
  const [title, setTitle] = useState("");
  const [networkCode, setNetworkCode] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [destinationUrl, setDestinationUrl] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [impressionLimit, setImpressionLimit] = useState("");
  const [creditReward, setCreditReward] = useState("2");

  // Preview dimension state
  const [imgDimensions, setImgDimensions] = useState<{ width: number; height: number } | null>(null);
  const [dimensionWarning, setDimensionWarning] = useState("");

  useEffect(() => {
    // Format YYYY-MM-DD
    const formatDateForInput = (dateVal: string | Date | null | undefined) => {
      if (!dateVal) return "";
      try {
        const d = new Date(dateVal);
        if (isNaN(d.getTime())) return "";
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      } catch {
        return "";
      }
    };

    const todayStr = formatDateForInput(new Date());

    if (initialData && isOpen) {
      // Detect Google / Network Ad type vs Manual Ad
      const isGoogleAd =
        initialData.type === "GOOGLE" ||
        initialData.type === "NETWORK" ||
        Boolean(initialData.networkCode?.trim());

      setType(isGoogleAd ? "GOOGLE" : "MANUAL");

      // Placement detection (FEED vs REWARD)
      let detPlacement: "FEED" | "REWARD" = "FEED";
      if (initialData.placement === "REWARD" || initialData.type === "REWARD_VIDEO") {
        detPlacement = "REWARD";
      }
      setPlacement(detPlacement);

      setTitle(initialData.title || "");
      setNetworkCode(initialData.networkCode || "");
      setImageUrl(initialData.imageUrl || initialData.videoUrl || "");
      setDestinationUrl(initialData.destinationUrl || "");

      setStartDate(formatDateForInput(initialData.startDate) || todayStr);
      setEndDate(formatDateForInput(initialData.endDate));
      setImpressionLimit(
        initialData.impressionLimit !== null && initialData.impressionLimit !== undefined
          ? initialData.impressionLimit.toString()
          : ""
      );
      setCreditReward(
        initialData.creditReward !== null && initialData.creditReward !== undefined
          ? initialData.creditReward.toString()
          : "2"
      );
    } else if (isOpen) {
      setType("MANUAL");
      setPlacement("FEED");
      setTitle("");
      setNetworkCode("");
      setImageUrl("");
      setDestinationUrl("");
      setStartDate(todayStr); // Varsayılan olarak reklamın ekleme tarihi (bugünün tarihi)
      setEndDate("");
      setImpressionLimit("");
      setCreditReward("2"); // Varsayılan olarak 2 kredi
    }
    setError("");
    setDimensionWarning("");
    setImgDimensions(null);
  }, [initialData, isOpen]);

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const { naturalWidth, naturalHeight } = e.currentTarget;
    setImgDimensions({ width: naturalWidth, height: naturalHeight });

    if (naturalWidth < 100 || naturalHeight < 50) {
      setDimensionWarning("Uyarı: Görsel boyutu çok küçük (Önerilen min: 100x50px)");
    } else if (naturalWidth > 2500 || naturalHeight > 2500) {
      setDimensionWarning("Uyarı: Görsel çözünürlüğü çok yüksek (Sayfa yüklenmesini yavaşlatabilir)");
    } else {
      setDimensionWarning("");
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Görsel yüklenirken hata oluştu.");
      }

      const data = await res.json();
      if (data.urls && data.urls[0]) {
        setImageUrl(data.urls[0]);
      }
    } catch (err: any) {
      setError(err.message || "Dosya yüklenemedi.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (!title.trim()) throw new Error("Lütfen reklam başlığını girin.");

      if (type === "GOOGLE" && !networkCode.trim()) {
        throw new Error("Lütfen Google Reklam Kodunu girin.");
      }

      if (type === "MANUAL") {
        if (!imageUrl.trim()) throw new Error("Lütfen bir reklam görseli veya videosu ekleyin/yükleyin.");
      }

      const payload = {
        title,
        type,
        placement,
        networkCode: type === "GOOGLE" ? networkCode : null,
        imageUrl: type === "MANUAL" ? imageUrl : null,
        videoUrl: type === "MANUAL" ? imageUrl : null,
        destinationUrl: type === "MANUAL" ? destinationUrl : null,
        startDate: startDate || null,
        endDate: endDate || null,
        impressionLimit: impressionLimit ? parseInt(impressionLimit) : null,
        creditReward: creditReward !== "" ? parseInt(creditReward) : 2,
      };

      const url = initialData?.id
        ? `/api/admin/ads/${initialData.id}`
        : "/api/admin/ads";
      const method = initialData?.id ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "İşlem sırasında hata oluştu");
      }

      onClose();
      router.refresh();
      // Force navigation refresh to guarantee fresh list view
      window.location.href = "/admin/ads";
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-2 sm:p-4 overflow-hidden">
      <div className="bg-[var(--surface)] text-[var(--on-surface)] rounded-xl border border-[var(--outline-variant)] shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col my-auto overflow-hidden">
        {/* Modal Header */}
        <div className="flex justify-between items-center px-5 py-3 border-b border-[var(--outline-variant)] bg-[var(--surface-variant)] shrink-0">
          <h2 className="text-base font-bold">
            {initialData ? "Reklamı Düzenle" : "Yeni Reklam Ekle"}
          </h2>
          <button
            onClick={onClose}
            type="button"
            className="text-gray-500 hover:text-gray-700 text-lg font-bold px-2 py-1"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1 text-sm">
          {error && (
            <div className="p-3 text-sm text-red-700 bg-red-100 rounded-lg border border-red-200">
              {error}
            </div>
          )}

          {/* Ad Type Selector */}
          <div>
            <label className="block text-sm font-semibold mb-2">Reklam Türü</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setType("MANUAL")}
                className={`p-3 rounded-lg border text-sm font-medium flex items-center justify-center gap-2 transition ${
                  type === "MANUAL"
                    ? "bg-[var(--primary)] text-[var(--on-primary)] border-[var(--primary)] shadow-sm"
                    : "bg-[var(--surface-variant)] border-[var(--outline-variant)] hover:bg-gray-200"
                }`}
              >
                🖼️ Manuel / Özel Reklam
              </button>
              <button
                type="button"
                onClick={() => setType("GOOGLE")}
                className={`p-3 rounded-lg border text-sm font-medium flex items-center justify-center gap-2 transition ${
                  type === "GOOGLE"
                    ? "bg-[var(--primary)] text-[var(--on-primary)] border-[var(--primary)] shadow-sm"
                    : "bg-[var(--surface-variant)] border-[var(--outline-variant)] hover:bg-gray-200"
                }`}
              >
                🌐 Google / Ağ Reklamı
              </button>
            </div>
          </div>

          {/* Placement Selector */}
          <div>
            <label className="block text-sm font-semibold mb-2">Reklamın Gösterileceği Yer (Yerleşim)</label>
            <select
              value={placement}
              onChange={(e) => setPlacement(e.target.value as "FEED" | "REWARD")}
              className="w-full p-2.5 rounded-lg border border-[var(--outline-variant)] bg-[var(--surface)] text-sm focus:ring-2 focus:ring-[var(--primary)] outline-none"
            >
              <option value="FEED">Akış İçi (En Aktifler, Bekleyenler, Arama vs. - Kredisi Yok)</option>
              <option value="REWARD">Kredi Kazanma Sayfası (Ödüllü Görev / Video alanı)</option>
            </select>
          </div>

          {/* Common Field: Title */}
          <div>
            <label className="block text-sm font-medium mb-1">Reklam Başlığı / Tanım *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Örn: Tarım Ekipmanları Sponsorlu Banner"
              className="w-full p-2.5 rounded-lg border border-[var(--outline-variant)] bg-[var(--surface)] text-sm focus:ring-2 focus:ring-[var(--primary)] outline-none"
            />
          </div>

          {/* Conditional Fields: Google Ad vs Manual Ad */}
          {type === "GOOGLE" ? (
            <div>
              <label className="block text-sm font-medium mb-1">
                Google / AdSense / HTML Reklam Kodu *
              </label>
              <textarea
                rows={5}
                required
                value={networkCode}
                onChange={(e) => setNetworkCode(e.target.value)}
                placeholder="<script async src='https://pagead2.googlesyndication.com/...'></script>"
                className="w-full p-2.5 font-mono text-xs rounded-lg border border-[var(--outline-variant)] bg-slate-900 text-green-400 focus:ring-2 focus:ring-[var(--primary)] outline-none"
              />
              <p className="text-xs text-[var(--on-surface-variant)] mt-1">
                Google AdSense veya reklam ağınızdan aldığınız tam script / iframe kodunu buraya yapıştırın.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Reklam Medyası (Görsel veya MP4 Video) *</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://... VEYA /uploads/... (Görsel veya Video URL)"
                    className="flex-1 p-2.5 rounded-lg border border-[var(--outline-variant)] bg-[var(--surface)] text-sm focus:ring-2 focus:ring-[var(--primary)] outline-none"
                  />
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/*,video/mp4,video/webm"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="px-4 py-2 bg-[var(--surface-variant)] text-sm font-medium rounded-lg border border-[var(--outline-variant)] hover:bg-gray-200 transition shrink-0"
                  >
                    {uploading ? "Yükleniyor..." : "📁 Görsel/Video Yükle"}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Tıklandığında Gidilecek Bağlantı (Opsiyonel)
                </label>
                <input
                  type="text"
                  value={destinationUrl}
                  onChange={(e) => setDestinationUrl(e.target.value)}
                  placeholder="https://www.ornekfirma.com/kampanya (Boş bırakılabilir)"
                  className="w-full p-2.5 rounded-lg border border-[var(--outline-variant)] bg-[var(--surface)] text-sm focus:ring-2 focus:ring-[var(--primary)] outline-none"
                />
              </div>
            </div>
          )}

          {/* Date, Limits & Credit Reward */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1">Başlangıç Tarihi</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full p-2 rounded-lg border border-[var(--outline-variant)] bg-[var(--surface)] text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Bitiş Tarihi</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full p-2 rounded-lg border border-[var(--outline-variant)] bg-[var(--surface)] text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Max Gösterim Limiti</label>
              <input
                type="number"
                min="1"
                placeholder="Sınırsız (boş)"
                value={impressionLimit}
                onChange={(e) => setImpressionLimit(e.target.value)}
                className="w-full p-2 rounded-lg border border-[var(--outline-variant)] bg-[var(--surface)] text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Ödül (Kredi)</label>
              <input
                type="number"
                min="0"
                placeholder="2"
                value={creditReward}
                onChange={(e) => setCreditReward(e.target.value)}
                className="w-full p-2 rounded-lg border border-[var(--outline-variant)] bg-[var(--surface)] text-xs font-bold text-amber-600"
              />
            </div>
          </div>

          {/* REAL-TIME PREVIEW AREA */}
          <div className="pt-2">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--on-surface-variant)]">
                🔍 Reklam Canlı Önizleme (Onay Öncesi)
              </span>
              {imgDimensions && (
                <span className="text-xs px-2 py-0.5 bg-gray-100 rounded text-gray-600 font-mono">
                  {imgDimensions.width} x {imgDimensions.height} px
                </span>
              )}
            </div>

            <div className="p-4 border border-dashed border-[var(--outline-variant)] rounded-xl bg-[var(--surface-variant)]/50 flex flex-col items-center justify-center min-h-[140px] max-h-[300px] overflow-hidden relative">
              {type === "MANUAL" ? (
                imageUrl ? (
                  <div className="relative w-full h-full flex flex-col items-center justify-center">
                    {/* Responsive Dynamic Preview Container with Bounds */}
                    <div className="max-w-full max-h-[220px] overflow-hidden rounded-lg shadow-sm border border-gray-200 flex items-center justify-center bg-white">
                      {imageUrl.match(/\.(mp4|webm|ogg)$/i) || imageUrl.includes("video") ? (
                        <video
                          src={imageUrl}
                          controls
                          onLoadedMetadata={(e) => {
                            setImgDimensions({
                              width: e.currentTarget.videoWidth,
                              height: e.currentTarget.videoHeight,
                            });
                          }}
                          className="max-w-full max-h-[220px] rounded"
                        />
                      ) : (
                        <img
                          src={imageUrl}
                          alt="Reklam Önizleme"
                          onLoad={handleImageLoad}
                          className="max-w-full max-h-[220px] object-contain"
                        />
                      )}
                    </div>
                    {destinationUrl && (
                      <span className="mt-2 text-xs text-blue-600 underline truncate max-w-full">
                        🔗 {destinationUrl}
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="text-xs text-[var(--on-surface-variant)] text-center">
                    Görsel / Video URL girdiğinizde veya dosya yüklediğinizde canlı önizleme burada görünecektir.
                  </div>
                )
              ) : networkCode ? (
                <div className="w-full p-3 bg-slate-900 text-green-400 font-mono text-xs rounded-lg overflow-x-auto max-h-[160px]">
                  <div className="text-[10px] text-gray-400 mb-1">// Google AdSense Kodu Yüklenecek:</div>
                  <pre className="whitespace-pre-wrap break-all">{networkCode}</pre>
                </div>
              ) : (
                <div className="text-xs text-[var(--on-surface-variant)] text-center">
                  Google script kodunu girdiğinizde önizleme simülasyonu burada görünecektir.
                </div>
              )}
            </div>

            {dimensionWarning && (
              <p className="text-xs text-amber-600 mt-1.5 font-medium flex items-center gap-1">
                ⚠️ {dimensionWarning}
              </p>
            )}
          </div>

          {/* Modal Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-[var(--outline-variant)]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-[var(--outline-variant)] text-sm font-medium hover:bg-gray-100 transition"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary px-6 py-2 text-sm font-medium"
            >
              {loading ? "Kaydediliyor..." : initialData ? "Güncelle" : "Reklamı Yayınla"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
