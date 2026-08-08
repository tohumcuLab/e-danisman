"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ProfileEditForm({ user }: { user: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [message, setMessage] = useState("");

  const [name, setName] = useState(user.name || "");
  const [bio, setBio] = useState(user.bio || "");
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl || user.image || "");
  const [city, setCity] = useState(user.city || "");
  const [district, setDistrict] = useState(user.district || "");
  const [village, setVillage] = useState(user.village || "");
  
  // Social links
  const [website, setWebsite] = useState(user.website || "");
  const [twitter, setTwitter] = useState(user.twitter || "");
  const [instagram, setInstagram] = useState(user.instagram || "");
  const [linkedin, setLinkedin] = useState(user.linkedin || "");
  const [facebook, setFacebook] = useState(user.facebook || "");
  const [youtube, setYoutube] = useState(user.youtube || "");

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Dosya Boyutu Kontrolü (Max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert("Dosya boyutu çok yüksek. Lütfen en fazla 2 MB boyutunda bir resim seçiniz.");
        return;
      }

      // Format Kontrolü
      const validTypes = ["image/jpeg", "image/png", "image/webp"];
      if (!validTypes.includes(file.type)) {
        alert("Geçersiz dosya formatı. Lütfen JPG, PNG veya WEBP formatında bir resim seçiniz.");
        return;
      }

      setUploadingAvatar(true);
      try {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (res.ok) {
          const data = await res.json();
          setAvatarUrl(data.urls[0]);
        } else {
          alert("Fotoğraf yüklenemedi.");
        }
      } catch (err) {
        alert("Yükleme hatası.");
      } finally {
        setUploadingAvatar(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          bio,
          avatarUrl,
          city,
          district,
          village,
          website,
          twitter,
          instagram,
          linkedin,
          facebook,
          youtube
        })
      });

      const data = await res.json();
      if (res.ok) {
        setMessage("Profiliniz başarıyla güncellendi!");
        router.refresh();
      } else {
        setMessage(`Hata: ${data.error}`);
      }
    } catch (err) {
      setMessage("Sunucu hatası oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {message && (
        <div className={`p-3 rounded text-sm font-bold ${message.includes("Hata") ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
          {message}
        </div>
      )}

      {/* Profil Fotoğrafı Yükleme */}
      <div className="flex items-center gap-4 border-b border-[var(--outline-variant)] pb-4">
        <div className="w-16 h-16 rounded-full bg-[var(--primary)] text-[var(--on-primary)] flex items-center justify-center font-bold text-xl overflow-hidden flex-shrink-0">
          {avatarUrl ? (
            <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            name?.charAt(0).toUpperCase() || "U"
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold mb-1">Profil Fotoğrafı Değiştir</label>
          <input 
            type="file" 
            accept="image/jpeg,image/png,image/webp"
            onChange={handleAvatarFileChange}
            disabled={uploadingAvatar}
            className="text-xs text-[var(--on-surface-variant)] file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-[var(--surface-variant)] file:text-[var(--on-surface-variant)] hover:file:bg-[var(--outline-variant)] cursor-pointer"
          />
          {uploadingAvatar && <p className="text-[10px] text-[var(--primary)] mt-1">Fotoğraf yüklenecek...</p>}

          {/* Açıklama ve Boyut/Format Rehberi */}
          <div className="mt-2 text-[11px] text-[var(--on-surface-variant)] bg-[var(--surface-container-low)] p-2 rounded border border-[var(--outline-variant)]">
            <span className="font-semibold block mb-0.5">ℹ️ Resim Yükleme Kuralları:</span>
            <ul className="list-disc list-inside space-y-0.5 text-[10px]">
              <li><strong>Önerilen Boyut:</strong> 200x200px veya 400x400px (Kare format 1:1)</li>
              <li><strong>İzin Verilen Formatlar:</strong> JPG, PNG, WEBP</li>
              <li><strong>Maksimum Boyut:</strong> En fazla <strong>2 MB</strong></li>
            </ul>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Ad Soyad</label>
        <input 
          type="text" 
          value={name} 
          onChange={(e) => setName(e.target.value)}
          className="w-full p-2 border border-[var(--outline-variant)] rounded bg-[var(--surface)]"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Hakkımda / Slogan / Not</label>
        <textarea 
          rows={3}
          value={bio} 
          onChange={(e) => setBio(e.target.value)}
          placeholder="Örn: 15 yıllık ziraat mühendisi. Organik tarım ve damla sulama uzmanı."
          className="w-full p-2 border border-[var(--outline-variant)] rounded bg-[var(--surface)] text-sm"
        />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-medium mb-1">İl</label>
          <input 
            type="text" 
            value={city} 
            onChange={(e) => setCity(e.target.value)}
            className="w-full p-2 border border-[var(--outline-variant)] rounded bg-[var(--surface)] text-xs"
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">İlçe</label>
          <input 
            type="text" 
            value={district} 
            onChange={(e) => setDistrict(e.target.value)}
            className="w-full p-2 border border-[var(--outline-variant)] rounded bg-[var(--surface)] text-xs"
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">Köy / Mahalle</label>
          <input 
            type="text" 
            value={village} 
            onChange={(e) => setVillage(e.target.value)}
            className="w-full p-2 border border-[var(--outline-variant)] rounded bg-[var(--surface)] text-xs"
          />
        </div>
      </div>

      <div className="border-t border-[var(--outline-variant)] pt-4">
        <h4 className="font-bold text-sm mb-3">Sosyal Medya ve İletişim Bağlantıları</h4>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium mb-1">🌐 Web Sitesi</label>
            <input 
              type="url" 
              value={website} 
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://..."
              className="w-full p-2 border border-[var(--outline-variant)] rounded bg-[var(--surface)] text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">📺 YouTube</label>
            <input 
              type="url" 
              value={youtube} 
              onChange={(e) => setYoutube(e.target.value)}
              placeholder="https://youtube.com/@..."
              className="w-full p-2 border border-[var(--outline-variant)] rounded bg-[var(--surface)] text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">🐦 Twitter / X</label>
            <input 
              type="url" 
              value={twitter} 
              onChange={(e) => setTwitter(e.target.value)}
              placeholder="https://x.com/..."
              className="w-full p-2 border border-[var(--outline-variant)] rounded bg-[var(--surface)] text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">📷 Instagram</label>
            <input 
              type="url" 
              value={instagram} 
              onChange={(e) => setInstagram(e.target.value)}
              placeholder="https://instagram.com/..."
              className="w-full p-2 border border-[var(--outline-variant)] rounded bg-[var(--surface)] text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">💼 LinkedIn</label>
            <input 
              type="url" 
              value={linkedin} 
              onChange={(e) => setLinkedin(e.target.value)}
              placeholder="https://linkedin.com/in/..."
              className="w-full p-2 border border-[var(--outline-variant)] rounded bg-[var(--surface)] text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">📘 Facebook</label>
            <input 
              type="url" 
              value={facebook} 
              onChange={(e) => setFacebook(e.target.value)}
              placeholder="https://facebook.com/..."
              className="w-full p-2 border border-[var(--outline-variant)] rounded bg-[var(--surface)] text-xs"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button 
          type="submit" 
          disabled={loading || uploadingAvatar}
          className="btn btn-primary px-6 font-bold"
        >
          {loading ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
        </button>
      </div>
    </form>
  );
}
