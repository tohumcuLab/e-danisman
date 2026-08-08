"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

export default function AdForm() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [title, setTitle] = useState("");
  const [type, setType] = useState("FEED"); // FEED or REWARD_VIDEO
  const [uploadMethod, setUploadMethod] = useState("LINK"); // LINK or FILE
  const [videoUrl, setVideoUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [impressionLimit, setImpressionLimit] = useState("");
  const [creditReward, setCreditReward] = useState("0");
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      let finalUrl = videoUrl;

      // Handle MP4 File Upload
      if (uploadMethod === "FILE" && file) {
        const formData = new FormData();
        formData.append("file", file);
        
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        
        if (!uploadRes.ok) {
          throw new Error("Dosya yüklenirken hata oluştu");
        }
        
        const uploadData = await uploadRes.json();
        finalUrl = uploadData.urls[0];
      }

      if (!finalUrl && type === "REWARD_VIDEO") {
        throw new Error("Ödüllü video için bir dosya veya URL gereklidir.");
      }

      const res = await fetch("/api/admin/ads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          type,
          videoUrl: finalUrl,
          impressionLimit,
          creditReward
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Reklam oluşturulamadı");
      }

      // Reset form
      setTitle("");
      setVideoUrl("");
      setFile(null);
      setImpressionLimit("");
      setCreditReward("0");
      if (fileInputRef.current) fileInputRef.current.value = "";
      
      router.refresh();
      alert("Reklam başarıyla oluşturuldu");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card p-6 mb-8">
      <h2 className="text-xl font-bold mb-4">Yeni Reklam Ekle</h2>
      
      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Başlık / Kampanya Adı</label>
          <input 
            type="text" 
            required 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 border border-[var(--outline-variant)] rounded-md bg-[var(--surface)]"
            placeholder="Örn: Bahar Dönemi Gübre İndirimi"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Reklam Tipi</label>
            <select 
              value={type} 
              onChange={(e) => setType(e.target.value)}
              className="w-full p-2 border border-[var(--outline-variant)] rounded-md bg-[var(--surface)]"
            >
              <option value="FEED">Akış İçi (Soru Arası)</option>
              <option value="REWARD_VIDEO">Ödüllü Video (İzle-Kazan)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Ödül (Kredi)</label>
            <input 
              type="number" 
              min="0"
              value={creditReward}
              onChange={(e) => setCreditReward(e.target.value)}
              className="w-full p-2 border border-[var(--outline-variant)] rounded-md bg-[var(--surface)]"
              placeholder="Örn: 2"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Medya Yükleme Yöntemi</label>
          <div className="flex gap-4 mb-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="radio" 
                checked={uploadMethod === "LINK"} 
                onChange={() => setUploadMethod("LINK")} 
              /> Dış Bağlantı (URL)
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="radio" 
                checked={uploadMethod === "FILE"} 
                onChange={() => setUploadMethod("FILE")} 
              /> Sunucuya Dosya Yükle (MP4 / Görsel)
            </label>
          </div>

          {uploadMethod === "LINK" ? (
            <input 
              type="url" 
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              className="w-full p-2 border border-[var(--outline-variant)] rounded-md bg-[var(--surface)]"
              placeholder="https://www.youtube.com/... veya https://.../resim.jpg"
            />
          ) : (
            <input 
              type="file" 
              ref={fileInputRef}
              accept="video/mp4,image/*"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full p-2 border border-[var(--outline-variant)] rounded-md bg-[var(--surface)] text-sm"
            />
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Gösterim Limiti (Opsiyonel)</label>
          <input 
            type="number" 
            min="1"
            value={impressionLimit}
            onChange={(e) => setImpressionLimit(e.target.value)}
            className="w-full p-2 border border-[var(--outline-variant)] rounded-md bg-[var(--surface)]"
            placeholder="Boş bırakılırsa sınırsız gösterilir"
          />
        </div>

        <div className="flex justify-end pt-4">
          <button 
            type="submit" 
            disabled={loading}
            className="btn btn-primary"
          >
            {loading ? "Oluşturuluyor..." : "Reklamı Yayınla"}
          </button>
        </div>
      </form>
    </div>
  );
}
