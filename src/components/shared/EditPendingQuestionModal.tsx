"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updatePendingQuestion } from "@/app/actions/questionApproval";

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

interface EditPendingQuestionModalProps {
  question: {
    id: string;
    title: string;
    body: string;
    categoryId: string;
    cropType?: string | null;
    images?: { url: string }[];
  };
  categories: { id: string; name: string }[];
  isOpen: boolean;
  onClose: () => void;
}

export default function EditPendingQuestionModal({
  question,
  categories,
  isOpen,
  onClose,
}: EditPendingQuestionModalProps) {
  const router = useRouter();
  const [title, setTitle] = useState(question.title);
  const [body, setBody] = useState(question.body);
  const [categoryId, setCategoryId] = useState(question.categoryId);
  
  // Bitki türleri (Virgülle ayrılmış dizeyi diziye çevir)
  const initialCrops = question.cropType 
    ? question.cropType.split(",").map(c => c.trim()).filter(Boolean)
    : [];
  const [selectedCrops, setSelectedCrops] = useState<string[]>(initialCrops);
  const [cropSearch, setCropSearch] = useState("");
  
  // Görseller
  const initialImages = question.images?.map(i => i.url) || [];
  const [images, setImages] = useState<string[]>(initialImages);
  const [imageUrlInput, setImageUrlInput] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  if (!isOpen) return null;

  const toggleCrop = (crop: string) => {
    if (selectedCrops.includes(crop)) {
      setSelectedCrops(selectedCrops.filter(c => c !== crop));
    } else {
      setSelectedCrops([...selectedCrops, crop]);
    }
  };

  const removeCrop = (crop: string) => {
    setSelectedCrops(selectedCrops.filter(c => c !== crop));
  };

  const handleAddImage = () => {
    if (!imageUrlInput.trim()) return;
    if (images.length >= 5) {
      setErrorMsg("En fazla 5 adet görsel ekleyebilirsiniz.");
      return;
    }
    setImages([...images, imageUrlInput.trim()]);
    setImageUrlInput("");
    setErrorMsg("");
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || title.trim().length < 10) {
      setErrorMsg("Soru başlığı en az 10 karakter olmalıdır.");
      return;
    }
    if (!body.trim() || body.trim().length < 20) {
      setErrorMsg("Soru açıklaması en az 20 karakter olmalıdır.");
      return;
    }
    if (!categoryId) {
      setErrorMsg("Lütfen bir kategori seçiniz.");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    const res = await updatePendingQuestion({
      questionId: question.id,
      title: title.trim(),
      body: body.trim(),
      categoryId,
      cropType: selectedCrops.join(", "),
      images
    });

    if (res.success) {
      setSuccessMsg("Sorunuz başarıyla güncellendi! Herhangi bir ek kredi düşülmedi.");
      setTimeout(() => {
        onClose();
        router.refresh();
      }, 1200);
    } else {
      setErrorMsg(res.error || "Sorunuz güncellenirken bir hata oluştu.");
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[var(--surface)] text-[var(--on-surface)] border border-[var(--outline-variant)] w-full max-w-2xl p-6 rounded-2xl shadow-2xl space-y-5 my-8 max-h-[90vh] overflow-y-auto animate-in zoom-in-95">
        
        {/* Modal Başlığı */}
        <div className="flex items-center justify-between border-b border-[var(--outline-variant)] pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">✏️</span>
            <div>
              <h3 className="font-extrabold text-lg text-[var(--on-surface)]">Soruyu Düzenle</h3>
              <p className="text-xs text-amber-700 dark:text-amber-300 font-semibold">
                ℹ️ Sorunuz onay sürecindedir. Düzenleme için ekstra <strong>KREDİ DÜŞÜLMEZ</strong> (Ücretsiz).
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-[var(--surface-variant)] text-gray-500 hover:text-gray-800 text-lg font-bold"
          >
            ✕
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 text-xs font-bold border border-red-200 dark:border-red-800">
            ⚠️ {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-xl bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-300 text-xs font-bold border border-green-200 dark:border-green-800">
            ✅ {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* 1. Başlık */}
          <div>
            <label className="block font-bold mb-1 text-[var(--on-surface-variant)]">
              Soru Başlığı:
            </label>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input w-full font-semibold text-xs"
              placeholder="Örn: Domates serasında yaprak kuruması neden olur?"
            />
          </div>

          {/* 2. Kategori */}
          <div>
            <label className="block font-bold mb-1 text-[var(--on-surface-variant)]">
              Kategori:
            </label>
            <select 
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="select w-full font-semibold text-xs"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* 3. Bitki / Ürün Türü (Çoklu Seçim) */}
          <div>
            <label className="block font-bold mb-1 text-[var(--on-surface-variant)]">
              Bitki / Ürün Türü Seçimi (İsteğe Bağlı - Birden Fazla Seçilebilir):
            </label>

            {/* Seçilen Türler Chips */}
            {selectedCrops.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2 p-2 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-800">
                {selectedCrops.map((crop) => (
                  <span 
                    key={crop}
                    className="inline-flex items-center gap-1 bg-amber-500 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg shadow-sm"
                  >
                    🌱 {crop}
                    <button 
                      type="button" 
                      onClick={() => removeCrop(crop)}
                      className="hover:text-red-200 font-bold ml-1"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Arama Inputu */}
            <input
              type="text"
              placeholder="🔍 Ürün ara (Örn: Domates, Biber, Havuç)..."
              value={cropSearch}
              onChange={(e) => setCropSearch(e.target.value)}
              className="input w-full text-xs mb-2"
            />

            {/* Seçim Kutusu Grid */}
            <div className="max-h-36 overflow-y-auto border border-[var(--outline-variant)] rounded-xl p-2 bg-[var(--surface-container-low)] space-y-1">
              {CROPS_LIST.filter(crop => crop.toLowerCase().includes(cropSearch.toLowerCase())).map((crop) => {
                const isSelected = selectedCrops.includes(crop);
                return (
                  <button
                    key={crop}
                    type="button"
                    onClick={() => toggleCrop(crop)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between transition-colors ${
                      isSelected 
                        ? "bg-amber-500 text-white font-bold" 
                        : "hover:bg-[var(--surface-variant)] text-[var(--on-surface)]"
                    }`}
                  >
                    <span>{crop}</span>
                    {isSelected && <span>✓</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Soru Açıklaması */}
          <div>
            <label className="block font-bold mb-1 text-[var(--on-surface-variant)]">
              Detaylı Açıklama:
            </label>
            <textarea 
              rows={4}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="textarea w-full font-medium text-xs leading-relaxed"
              placeholder="Sorunuzu detaylı bir şekilde açıklayın..."
            />
          </div>

          {/* 5. Görseller */}
          <div>
            <label className="block font-bold mb-1 text-[var(--on-surface-variant)]">
              Görseller (İsteğe Bağlı):
            </label>

            <div className="flex gap-2 mb-2">
              <input 
                type="text" 
                placeholder="Görsel URL adresi yapıştırın..."
                value={imageUrlInput}
                onChange={(e) => setImageUrlInput(e.target.value)}
                className="input flex-1 text-xs"
              />
              <button 
                type="button" 
                onClick={handleAddImage}
                className="px-3 py-1.5 bg-[var(--primary)] text-white font-bold rounded-xl text-xs"
              >
                + Ekle
              </button>
            </div>

            {images.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {images.map((url, idx) => (
                  <div key={idx} className="relative w-16 h-16 rounded-xl overflow-hidden border border-[var(--outline-variant)]">
                    <img src={url} alt="Ön izleme" className="w-full h-full object-cover" />
                    <button 
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute top-0.5 right-0.5 bg-red-600 text-white w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Aksiyon Butonları */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-[var(--outline-variant)]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-[var(--surface-container-high)] text-[var(--on-surface)] hover:bg-[var(--surface-variant)]"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl text-xs font-extrabold bg-[#006537] hover:bg-[#004f2b] text-white shadow-md flex items-center gap-1.5 disabled:opacity-50"
            >
              <span>{loading ? "Kaydediliyor..." : "💾 Değişiklikleri Kaydet (Kredisiz)"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
