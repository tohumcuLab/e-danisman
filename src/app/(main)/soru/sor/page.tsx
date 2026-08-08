"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import InsufficientCreditsModal from "@/components/shared/InsufficientCreditsModal";

type Category = {
  id: string;
  name: string;
};

const CROPS_LIST = [
  "Domates (Sırık/Tarla)",
  "Biber (Sivri/Çarliston/Kapya/Dolma)",
  "Patlıcan",
  "Hıyar (Salatalık)",
  "Kabak",
  "Karpuz",
  "Kavun",
  "Çilek",
  "Patates",
  "Havuç",
  "Turp",
  "Şalgam",
  "Alabaş",
  "Lahana (Beyaz/Kırmızı/Kara/Brüksel)",
  "Soğan / Sarımsak",
  "Marul / Kıvırcık",
  "Ispanak",
  "Maydanoz / Dereotu / Nane",
  "Fasulye / Barbunya",
  "Bezelye / Nohut / Mercimek",
  "Mısır (Tane/Silajlık/Tatlı)",
  "Buğday",
  "Arpa",
  "Yulaf / Çavdar",
  "Çeltik (Pirinç)",
  "Pamuk",
  "Ayçiçeği",
  "Kanola / Soya",
  "Tütün",
  "Şeker Pancarı",
  "Elma",
  "Armut",
  "Ayva",
  "Şeftali / Nektarin",
  "Kayısı",
  "Erik",
  "Kiraz / Vişne",
  "Zeytin",
  "Üzüm (Bağ)",
  "Fındık",
  "Ceviz / Badem / Antep Fıstığı",
  "Narenciye (Portakal/Mandalina/Limon/Greyfurt)",
  "Nar",
  "İncir",
  "Kivi",
  "Avokado",
  "Muz",
  "Çay",
  "Yonca / Yem Bitkileri",
  "Süs Bitkileri / Çiçekler",
  "Mantar",
  "Diğer / Emin Değilim"
];

export default function AskQuestionPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [userCredits, setUserCredits] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Form State
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [selectedCrops, setSelectedCrops] = useState<string[]>([]);
  const [isCropDropdownOpen, setIsCropDropdownOpen] = useState(false);
  const [cropSearch, setCropSearch] = useState("");

  const toggleCrop = (crop: string) => {
    if (selectedCrops.includes(crop)) {
      setSelectedCrops(selectedCrops.filter((c) => c !== crop));
    } else {
      setSelectedCrops([...selectedCrops, crop]);
    }
  };
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [village, setVillage] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  useEffect(() => {
    // 1. Kategorileri Çek
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => {
        if (data.categories) {
          setCategories(data.categories);
        }
      });

    // 2. Kullanıcı Kredisini Çek
    fetchUserCredits();
  }, []);

  const fetchUserCredits = async () => {
    try {
      const res = await fetch("/api/user/me");
      if (res.ok) {
        const data = await res.json();
        setUserCredits(data.user.credits);
      }
    } catch (err) {
      console.error("Kredi bilgisi alınamadı:", err);
    }
  };

  const processImage = (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      // 1. Dosya Boyutu Kontrolü (Max 7MB)
      if (file.size > 7 * 1024 * 1024) {
        return reject(new Error(`"${file.name}" dosya boyutu 7 MB'tan büyüktür.`));
      }

      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      img.src = objectUrl;

      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        let { width, height } = img;

        // Boyutlar 1200x1200px içindeyse aynen kabul et
        if (width <= 1200 && height <= 1200) {
          return resolve(file);
        }

        // 1200px sınırına göre orantılı küçült
        if (width > height) {
          if (width > 1200) {
            height = Math.round((height * 1200) / width);
            width = 1200;
          }
        } else {
          if (height > 1200) {
            width = Math.round((width * 1200) / height);
            height = 1200;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return resolve(file);

        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (!blob) return resolve(file);
            const resizedFile = new File([blob], file.name, {
              type: file.type || "image/jpeg",
              lastModified: Date.now(),
            });
            resolve(resizedFile);
          },
          file.type || "image/jpeg",
          0.9
        );
      };

      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error(`"${file.name}" geçerli bir resim dosyası değil.`));
      };
    });
  };

  // Dinamik Kredi Ücreti Hesabı: Temel 4 Kredi + 2 resimden sonra her resim için +1 Kredi
  const totalCreditCost = 4 + Math.max(0, files.length - 2);
  const extraImageCount = Math.max(0, files.length - 2);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const selectedFiles = Array.from(e.target.files);
    
    // Toplam dosya sayısı kontrolü (Mevcut + Yeni <= 10)
    if (files.length + selectedFiles.length > 10) {
      setError("En fazla 10 adet resim ekleyebilirsiniz.");
      return;
    }

    try {
      setError("");
      const processed = await Promise.all(selectedFiles.map(processImage));
      const newFiles = [...files, ...processed];
      setFiles(newFiles);

      const urls = newFiles.map(file => URL.createObjectURL(file));
      setPreviewUrls(urls);
    } catch (err: any) {
      setError(err.message || "Resim işlenirken hata oluştu.");
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    const newFiles = files.filter((_, idx) => idx !== indexToRemove);
    setFiles(newFiles);
    const newUrls = newFiles.map(file => URL.createObjectURL(file));
    setPreviewUrls(newUrls);
  };

  const executeQuestionSubmit = async () => {
    setLoading(true);
    setError("");

    try {
      let uploadedImageUrls: string[] = [];

      // 1. Upload Images
      if (files.length > 0) {
        const formData = new FormData();
        files.forEach(file => formData.append("file", file));

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!uploadRes.ok) {
          throw new Error("Resimler yüklenirken bir hata oluştu.");
        }

        const uploadData = await uploadRes.json();
        uploadedImageUrls = uploadData.urls;
      }

      // 2. Submit Question
      const tags = tagsInput.split(",").map(tag => tag.trim()).filter(Boolean);

      const questionData = {
        title,
        body,
        categoryId,
        cropType: selectedCrops.join(", "),
        city,
        district,
        village,
        tags,
        images: uploadedImageUrls,
      };

      const res = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(questionData),
      });

      if (!res.ok) {
        const errData = await res.json();
        if (res.status === 403 && errData.error?.includes("krediniz")) {
          // Kredi yetersiz
          setIsModalOpen(true);
          return;
        }
        throw new Error(errData.error || "Soru oluşturulamadı.");
      }

      const data = await res.json();
      router.push(`/soru/${data.question.id}`);
      router.refresh();

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Ön Kredi Kontrolü: Kullanıcının kredisini biliyorsak ve gereksinimden azsa doğrudan Modal Aç
    if (userCredits !== null && userCredits < totalCreditCost) {
      setIsModalOpen(true);
      return;
    }

    executeQuestionSubmit();
  };

  return (
    <div className="container max-w-3xl py-6">
      <div className="card p-6 md:p-8 space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-[var(--outline-variant)]">
          <div>
            <h1 className="text-2xl font-bold text-[var(--on-surface)] mb-1">Uzmana Sorun 🌿</h1>
            <p className="text-sm text-[var(--on-surface-variant)]">
              Tarlanızda, bahçenizde gördüğünüz sorunları detaylıca sorun. Dilerseniz fotoğraf da ekleyebilirsiniz.
            </p>
          </div>

          {/* Kredi Bakiye Rozeti */}
          <div className="bg-[var(--surface-container-high)] px-4 py-2 rounded-xl text-right shrink-0 border border-[var(--outline-variant)]">
            <div className="text-[11px] text-[var(--on-surface-variant)] font-semibold uppercase tracking-wider">Mevcut Bakiyeniz</div>
            <div className="text-xl font-extrabold text-[var(--primary)]">
              {userCredits !== null ? `${userCredits} 🪙` : "..."}
            </div>
            <div className="text-[10px] font-bold text-[var(--secondary)]">Ücret: {totalCreditCost} 🪙</div>
          </div>
        </div>

        {error && (
          <div className="bg-[var(--error-container)] text-[var(--on-error-container)] p-4 rounded-xl text-sm font-medium">
            {error}
          </div>
        )}

        {/* Kredi Yetersizse Uyarısı */}
        {userCredits !== null && userCredits < totalCreditCost && (
          <div className="bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-400 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-amber-900 dark:text-amber-200">
              <strong>⚠️ Krediniz Yetersiz (Mevcut: {userCredits} 🪙 / Gereken: {totalCreditCost} 🪙)</strong>
              <p className="text-xs mt-1">Sorunuzu ücretsiz göndermek için kısa bir reklam izleyebilirsiniz.</p>
            </div>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="btn bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs py-2.5 px-4 rounded-xl whitespace-nowrap shadow"
            >
              🎬 Reklam İzle & Kredi Kazan
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Fotoğraf Yükleme Alanı (Stitch Tasarımı Dropzone) */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[var(--on-surface-variant)] uppercase tracking-wider block">
              Fotoğraf Yükle (İsteğe Bağlı) ({files.length}/10)
            </label>
            
            <div className="relative group">
              <input
                id="images"
                type="file"
                accept="image/*"
                multiple
                disabled={files.length >= 10}
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="border-2 border-dashed border-[var(--outline-variant)] rounded-2xl bg-[var(--surface-container-lowest)] p-6 min-h-[160px] flex flex-col items-center justify-center text-center gap-2 transition-all group-hover:border-[var(--primary)] group-hover:bg-[var(--surface-container-low)]">
                <span className="text-4xl">📸</span>
                <span className="font-bold text-base text-[var(--on-surface)]">
                  {files.length >= 10 ? "Maksimum Görsel Sayısına Ulaşıldı" : "Fotoğraf Seç veya Sürükle Bırak (İsteğe Bağlı)"}
                </span>
                <span className="text-xs text-[var(--on-surface-variant)]">
                  Görsel yüklemeden de sorunuzu iletebilirsiniz. Max 10 resim (JPG/PNG). İlk 2 resim ücretsizdir.
                </span>
              </div>
            </div>

            {/* Seçilen Fotoğraf Önizlemeleri */}
            {previewUrls.length > 0 && (
              <div className="flex flex-wrap gap-3 pt-2">
                {previewUrls.map((url, i) => (
                  <div key={i} className="relative w-24 h-24 border-2 border-[var(--outline-variant)] rounded-xl overflow-hidden group shadow-sm">
                    <img src={url} alt={`Önizleme ${i + 1}`} className="object-cover w-full h-full" />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(i)}
                      title="Resmi kaldır"
                      className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow hover:bg-red-700 transition-colors"
                    >
                      ✕
                    </button>
                    {i >= 2 && (
                      <span className="absolute bottom-1 left-1 bg-amber-500 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded shadow">
                        +1 🪙
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Soru Başlığı */}
          <div className="space-y-1.5">
            <label htmlFor="title" className="text-xs font-bold text-[var(--on-surface-variant)] uppercase tracking-wider block">
              Soru Başlığı *
            </label>
            <input
              id="title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Örn: Domates yapraklarında sararma ve lekelenmeler başladı"
              className="w-full bg-[var(--surface-container-lowest)] border border-[var(--outline-variant)] rounded-xl p-3.5 text-sm font-medium text-[var(--on-surface)] focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] transition-all outline-none"
            />
          </div>

          {/* Detaylı Açıklama */}
          <div className="space-y-1.5">
            <label htmlFor="body" className="text-xs font-bold text-[var(--on-surface-variant)] uppercase tracking-wider block">
              Detaylı Açıklama *
            </label>
            <textarea
              id="body"
              required
              rows={5}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Bitkinizdeki belirtileri, sorunun ne zaman başladığını ve kullandığınız gübre/ilaçları açıklayın..."
              className="w-full bg-[var(--surface-container-lowest)] border border-[var(--outline-variant)] rounded-xl p-3.5 text-sm text-[var(--on-surface)] focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] transition-all outline-none leading-relaxed"
            />
          </div>

          {/* Kategori ve Ürün Türü */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="category" className="text-xs font-bold text-[var(--on-surface-variant)] uppercase tracking-wider block">
                Kategori Seçin *
              </label>
              <select
                id="category"
                required
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full bg-[var(--surface-container-lowest)] border border-[var(--outline-variant)] rounded-xl p-3.5 text-sm font-medium text-[var(--on-surface)] focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] transition-all outline-none"
              >
                <option value="">Kategori Seçiniz</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5 relative">
              <label htmlFor="cropType" className="text-xs font-bold text-[var(--on-surface-variant)] uppercase tracking-wider flex items-center justify-between">
                <span>Bitki / Ürün Türü *</span>
                <span className="text-[10px] text-[var(--primary)] font-semibold lowercase">Çoklu Seçim</span>
              </label>
              
              {/* Gizli Validation Girdisi */}
              <input type="hidden" required value={selectedCrops.length > 0 ? "selected" : ""} />

              {/* Seçim Butonu */}
              <button
                type="button"
                onClick={() => setIsCropDropdownOpen(!isCropDropdownOpen)}
                className="w-full bg-[var(--surface-container-lowest)] border border-[var(--outline-variant)] rounded-xl p-3.5 text-sm font-medium text-left text-[var(--on-surface)] flex items-center justify-between focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] transition-all cursor-pointer"
              >
                <span className={selectedCrops.length > 0 ? "font-bold text-[var(--on-surface)] truncate" : "text-[var(--on-surface-variant)]"}>
                  {selectedCrops.length > 0 
                    ? `🌿 ${selectedCrops.join(", ")} (${selectedCrops.length} Seçildi)` 
                    : "Bitki / Ürün Seçiniz (Çoklu Seçim yapılabilir)..."}
                </span>
                <span className="text-xs text-[var(--on-surface-variant)] shrink-0 ml-2">
                  {isCropDropdownOpen ? "▲" : "▼"}
                </span>
              </button>

              {/* Seçilen Ürün Etiketleri (Chips) */}
              {selectedCrops.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {selectedCrops.map((crop) => (
                    <span
                      key={crop}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[var(--primary)]/15 text-[var(--primary)] text-xs font-bold border border-[var(--primary)]/30"
                    >
                      <span>🌱 {crop}</span>
                      <button
                        type="button"
                        onClick={() => toggleCrop(crop)}
                        className="hover:text-red-600 font-black ml-1 text-xs"
                        title="Kaldır"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Açılır Arama ve Çoklu Seçim Menüsü */}
              {isCropDropdownOpen && (
                <div className="absolute top-full left-0 right-0 z-40 mt-1 bg-[var(--surface-container-lowest)] border-2 border-[var(--primary)]/40 rounded-2xl shadow-2xl p-3 space-y-2 max-w-full">
                  <div className="relative">
                    <input
                      type="text"
                      value={cropSearch}
                      onChange={(e) => setCropSearch(e.target.value)}
                      placeholder="🔍 Listede ara... (Birden fazla seçebilirsiniz)"
                      className="w-full bg-[var(--surface-container-low)] border border-[var(--outline-variant)] rounded-xl p-2.5 text-xs font-medium text-[var(--on-surface)] focus:border-[var(--primary)] outline-none"
                    />
                  </div>

                  <div className="max-h-56 overflow-y-auto space-y-1 divide-y divide-[var(--outline-variant)]/30 pr-1 scrollbar-thin">
                    {CROPS_LIST.filter(crop => crop.toLowerCase().includes(cropSearch.toLowerCase())).length === 0 ? (
                      <div className="p-3 text-xs text-[var(--on-surface-variant)] text-center">
                        Aranan ürün bulunamadı.
                      </div>
                    ) : (
                      CROPS_LIST.filter(crop => crop.toLowerCase().includes(cropSearch.toLowerCase())).map((crop) => {
                        const isSelected = selectedCrops.includes(crop);
                        return (
                          <button
                            key={crop}
                            type="button"
                            onClick={() => toggleCrop(crop)}
                            className={`w-full text-left p-2.5 text-xs font-semibold rounded-xl hover:bg-[var(--primary)]/10 hover:text-[var(--primary)] transition-colors flex items-center justify-between cursor-pointer ${
                              isSelected ? "bg-[var(--primary)]/15 text-[var(--primary)] font-extrabold" : "text-[var(--on-surface)]"
                            }`}
                          >
                            <span className="flex items-center gap-2">
                              <span className={`w-4 h-4 rounded border flex items-center justify-center text-[10px] font-black ${
                                isSelected ? "bg-[var(--primary)] text-white border-[var(--primary)]" : "border-[var(--outline-variant)]"
                              }`}>
                                {isSelected ? "✓" : ""}
                              </span>
                              <span>🌱 {crop}</span>
                            </span>
                            {isSelected && <span className="font-bold text-xs text-[var(--primary)]">Seçildi</span>}
                          </button>
                        );
                      })
                    )}
                  </div>

                  {/* Alt Kapat / Tamam Satırı */}
                  <div className="pt-2 border-t border-[var(--outline-variant)] flex items-center justify-between text-xs">
                    <span className="text-[11px] font-bold text-[var(--on-surface-variant)]">
                      {selectedCrops.length} Ürün Seçildi
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsCropDropdownOpen(false)}
                      className="bg-[var(--primary)] hover:bg-[#00502b] text-white px-4 py-1 rounded-xl font-bold text-xs shadow transition-colors"
                    >
                      Tamam
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Konum Bilgileri */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label htmlFor="city" className="text-xs font-semibold text-[var(--on-surface-variant)] block">İl</label>
              <input
                id="city"
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="İl"
                className="w-full bg-[var(--surface-container-lowest)] border border-[var(--outline-variant)] rounded-xl p-2.5 text-xs text-[var(--on-surface)] outline-none"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="district" className="text-xs font-semibold text-[var(--on-surface-variant)] block">İlçe</label>
              <input
                id="district"
                type="text"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                placeholder="İlçe"
                className="w-full bg-[var(--surface-container-lowest)] border border-[var(--outline-variant)] rounded-xl p-2.5 text-xs text-[var(--on-surface)] outline-none"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="village" className="text-xs font-semibold text-[var(--on-surface-variant)] block">Köy/Mahalle</label>
              <input
                id="village"
                type="text"
                value={village}
                onChange={(e) => setVillage(e.target.value)}
                placeholder="Köy"
                className="w-full bg-[var(--surface-container-lowest)] border border-[var(--outline-variant)] rounded-xl p-2.5 text-xs text-[var(--on-surface)] outline-none"
              />
            </div>
          </div>

          {/* Etiketler */}
          <div className="space-y-1.5">
            <label htmlFor="tags" className="text-xs font-bold text-[var(--on-surface-variant)] uppercase tracking-wider block">
              Etiketler
            </label>
            <input
              id="tags"
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="Yaprak lekesi, Sulama, Haşere (virgül ile ayırın)"
              className="w-full bg-[var(--surface-container-lowest)] border border-[var(--outline-variant)] rounded-xl p-3.5 text-sm text-[var(--on-surface)] focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] transition-all outline-none"
            />
          </div>

          {/* Soru Yayınlama Kartı (Stitch Seçenek Kutusu) */}
          <div className="bg-[var(--surface-container)] rounded-2xl p-5 border border-[var(--outline-variant)] space-y-3">
            <h3 className="font-bold text-sm text-[var(--on-surface)]">Soru Yayınlama & Kredi İşlemi</h3>
            <div className="p-4 bg-[var(--surface-container-lowest)] rounded-xl border border-[var(--outline-variant)] flex items-center justify-between">
              <div>
                <div className="font-bold text-sm text-[var(--on-surface)] flex items-center gap-2">
                  <span>🪙 Kredi Hesabı:</span>
                  <span className="text-[var(--primary)]">{totalCreditCost} Kredi Düşülecektir</span>
                </div>
                <div className="text-xs text-[var(--on-surface-variant)] mt-0.5">
                  (4 Temel Soru Kredisi + {extraImageCount} Ekstra Resim Kredisi)
                </div>
              </div>
              <div className="font-extrabold text-sm text-[var(--primary)]">
                Bakiye: {userCredits ?? 0} 🪙
              </div>
            </div>
          </div>

          {/* Gönder Butonu */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full font-bold text-base py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
              userCredits !== null && userCredits < totalCreditCost
                ? "bg-amber-500 hover:bg-amber-600 text-white"
                : "bg-[#006537] hover:bg-[#74db98] text-white hover:text-[#00391d]"
            }`}
          >
            <span>➔</span>
            <span>
              {loading
                ? "Sorunuz Gönderiliyor..."
                : userCredits !== null && userCredits < totalCreditCost
                ? "🎬 Reklam İzle & Soruyu Gönder"
                : `Soruyu Gönder (-${totalCreditCost} Kredi)`}
            </span>
          </button>
        </form>
      </div>

      {/* Kredi Yetersiz Modal */}
      <InsufficientCreditsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        currentCredits={userCredits ?? 0}
        onCreditUpdated={(newCredits) => setUserCredits(newCredits)}
        onReadyToSubmit={() => {
          setIsModalOpen(false);
          executeQuestionSubmit();
        }}
      />
    </div>
  );
}
