"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";
import FeedAdCard from "@/components/shared/FeedAdCard";

function generateRandomAdPositions(itemCount: number, minGap = 3, maxGap = 5): Set<number> {
  const adPositions = new Set<number>();
  if (itemCount === 0) return adPositions;

  let currentPos = Math.floor(Math.random() * (maxGap - minGap + 1)) + minGap;

  while (currentPos <= itemCount) {
    adPositions.add(currentPos);
    currentPos += Math.floor(Math.random() * (maxGap - minGap + 1)) + minGap;
  }

  return adPositions;
}

export interface CategoryItem {
  id: string;
  name: string;
  slug?: string;
  icon?: string | null;
  order?: number | null;
  description?: string | null;
  imageUrl?: string | null;
  _count?: {
    questions?: number;
  };
}

export interface QuestionItem {
  id: string;
  title: string;
  body: string;
  userId: string;
  categoryId: string;
  cropType?: string | null;
  city?: string | null;
  district?: string | null;
  village?: string | null;
  status: string;
  viewCount?: number;
  createdAt: string | Date;
  updatedAt?: string | Date;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
  category: {
    id?: string;
    name: string;
    slug?: string;
    icon?: string | null;
  };
  tags?: Array<{
    tag?: { name: string };
    name?: string;
  }>;
  _count: {
    answers: number;
  };
  images: Array<{
    url: string;
  }>;
}

export interface FeedAdItem {
  id: string;
  title: string;
  type: string;
  placement?: string | null;
  networkCode?: string | null;
  imageUrl?: string | null;
  videoUrl?: string | null;
  destinationUrl?: string | null;
  impressionCount?: number;
}

interface Props {
  categories: CategoryItem[];
  initialQuestions: QuestionItem[];
  ads?: FeedAdItem[];
}

/**
 * Kategori isim veya slug'ına göre uyumlu emoji simgesi döndürür.
 * Yeni eklenen kategoriler için akıllı eşleşme ve güvenli varsayılan sağlar.
 */
export function getCategoryEmoji(name: string, slug?: string): string {
  const text = `${name} ${slug || ""}`.toLowerCase();

  if (text.includes("hastalık") || text.includes("hastalik")) return "🍂";
  if (text.includes("zararlı") || text.includes("zararli") || text.includes("böcek") || text.includes("bocek")) return "🐛";
  if (text.includes("beslenme") || text.includes("gübre") || text.includes("gubre") || text.includes("mineral") || text.includes("eksiklik")) return "🌾";
  if (text.includes("yabancı ot") || text.includes("yabanci ot") || text.includes("otlar") || text.includes("ot")) return "🌿";
  if (text.includes("emin değil") || text.includes("emin degil") || text.includes("bilmiyorum")) return "❓";
  if (text.includes("toprak") || text.includes("analiz")) return "🪴";
  if (text.includes("sulama") || text.includes("su") || text.includes("damla")) return "💧";
  if (text.includes("budama") || text.includes("aşı") || text.includes("asi")) return "✂️";
  if (text.includes("meyve") || text.includes("meyvecilik") || text.includes("elma") || text.includes("zeytin") || text.includes("ceviz")) return "🍎";
  if (text.includes("sebze") || text.includes("sebzecilik") || text.includes("domates") || text.includes("biber")) return "🍅";
  if (text.includes("sera") || text.includes("seracılık") || text.includes("seracilik")) return "🏡";
  if (text.includes("arı") || text.includes("ari") || text.includes("bal")) return "🐝";
  if (text.includes("hayvan") || text.includes("yem") || text.includes("süt") || text.includes("besi")) return "🐄";
  if (text.includes("tohum") || text.includes("fide") || text.includes("fidan")) return "🌱";
  if (text.includes("ilaç") || text.includes("ilac") || text.includes("zirai")) return "🧪";
  if (text.includes("diğer") || text.includes("diger")) return "📁";

  return "🌱"; // Varsayılan dinamik ikon
}

export default function CategoryQuestionFeed({ categories, initialQuestions, ads = [] }: Props) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Mouse Drag ile sürükleyerek kaydırma desteği
  const isDown = useRef(false);
  const startX = useRef(0);
  const scrollLeftVal = useRef(0);
  const hasMoved = useRef(false);

  // Slider kaydırma butonlarının durumunu güncelle
  const updateScrollButtons = () => {
    if (!sliderRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
    setCanScrollLeft(scrollLeft > 4);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 4);
  };

  useEffect(() => {
    updateScrollButtons();
    const el = sliderRef.current;
    if (!el) return;

    const handleResize = () => updateScrollButtons();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [categories]);

  const handleScroll = (direction: "left" | "right") => {
    if (!sliderRef.current) return;
    const offset = direction === "left" ? -220 : 220;
    sliderRef.current.scrollBy({ left: offset, behavior: "smooth" });
  };

  // Mouse drag event handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!sliderRef.current) return;
    isDown.current = true;
    hasMoved.current = false;
    startX.current = e.pageX - sliderRef.current.offsetLeft;
    scrollLeftVal.current = sliderRef.current.scrollLeft;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDown.current || !sliderRef.current) return;
    e.preventDefault();
    const x = e.pageX - sliderRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.5;
    if (Math.abs(walk) > 5) {
      hasMoved.current = true;
    }
    sliderRef.current.scrollLeft = scrollLeftVal.current - walk;
  };

  const handleMouseUpOrLeave = () => {
    isDown.current = false;
  };

  const handleCategoryClick = (catId: string | null) => {
    // Sürükleme hareketi yapıldıysa tıklama olayını tetikleme
    if (hasMoved.current) return;

    if (selectedCategoryId === catId) {
      // Zaten seçiliyse kaldır (Tümüne dön)
      setSelectedCategoryId(null);
    } else {
      setSelectedCategoryId(catId);
    }
  };

  // Seçili kategoriye göre soruları filtrele ve POPÜLERLİĞE göre sırala
  const displayedQuestions = useMemo(() => {
    if (!selectedCategoryId) {
      // Tümü seçiliyse: En yeni sorular ilk başta
      return initialQuestions;
    }

    const filtered = initialQuestions.filter(
      (q) => q.categoryId === selectedCategoryId || q.category?.id === selectedCategoryId
    );

    // Kategori seçildiğinde: EN POPÜLER sorular en üstte olacak şekilde sırala
    // 1. Okunma sayısı (viewCount)
    // 2. Yanıt sayısı (_count.answers)
    // 3. Tarih (createdAt)
    return [...filtered].sort((a, b) => {
      const viewA = a.viewCount || 0;
      const viewB = b.viewCount || 0;
      if (viewB !== viewA) {
        return viewB - viewA;
      }

      const answersA = a._count?.answers || 0;
      const answersB = b._count?.answers || 0;
      if (answersB !== answersA) {
        return answersB - answersA;
      }

      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [selectedCategoryId, initialQuestions]);

  const selectedCategory = useMemo(() => {
    if (!selectedCategoryId) return null;
    return categories.find((c) => c.id === selectedCategoryId) || null;
  }, [selectedCategoryId, categories]);

  // Reklam pozisyonlarını hesapla
  const adPositions = useMemo(() => {
    return generateRandomAdPositions(displayedQuestions.length, 3, 5);
  }, [displayedQuestions.length]);

  let adCounter = 0;

  return (
    <div className="space-y-5">
      {/* 1. YATAY KATEGORİ TEXT SLIDER */}
      <div className="relative w-full max-w-full">
        <div className="bg-[var(--surface-container-lowest)] dark:bg-[var(--surface-container)] rounded-2xl border border-[var(--outline-variant)] shadow-sm p-1.5 flex items-center gap-1.5 transition-all">
          
          {/* Sol Kaydırma Butonu (Masaüstü) */}
          {canScrollLeft && (
            <button
              type="button"
              onClick={() => handleScroll("left")}
              aria-label="Sola kaydır"
              className="hidden md:flex items-center justify-center w-7 h-7 rounded-xl bg-[var(--surface-container-high)] text-[var(--on-surface)] hover:bg-[var(--primary)] hover:text-white transition-colors shrink-0 shadow-sm text-xs font-black cursor-pointer z-10"
            >
              ❮
            </button>
          )}

          {/* Yatay Kaydırılabilir Kategori Listesi */}
          <div
            ref={sliderRef}
            onScroll={updateScrollButtons}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUpOrLeave}
            onMouseLeave={handleMouseUpOrLeave}
            className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth w-full select-none cursor-grab active:cursor-grabbing px-1 py-0.5"
          >
            {/* "Tümü" Butonu */}
            <button
              type="button"
              onClick={() => handleCategoryClick(null)}
              className={`px-3.5 py-1.5 text-xs font-bold whitespace-nowrap rounded-xl transition-all flex items-center gap-1.5 shrink-0 border cursor-pointer ${
                selectedCategoryId === null
                  ? "bg-[#006537] text-white border-[#004e2a] shadow-sm scale-[1.02]"
                  : "bg-[var(--surface-container-low)] text-[var(--on-surface-variant)] hover:bg-[var(--surface-container-high)] hover:text-[var(--on-surface)] border-[var(--outline-variant)]/60"
              }`}
            >
              <span>🌟</span>
              <span>Tümü</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                selectedCategoryId === null ? "bg-white/20 text-white" : "bg-[var(--surface-container-highest)] text-[var(--on-surface-variant)]"
              }`}>
                {initialQuestions.length}
              </span>
            </button>

            {/* Dinamik Kategoriler */}
            {categories.map((cat) => {
              const isSelected = selectedCategoryId === cat.id;
              const emoji = cat.icon || getCategoryEmoji(cat.name, cat.slug);
              
              // Bu kategorideki toplam soru sayısı
              const catQuestionCount = initialQuestions.filter(
                (q) => q.categoryId === cat.id || q.category?.id === cat.id
              ).length;

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleCategoryClick(cat.id)}
                  className={`px-3.5 py-1.5 text-xs font-bold whitespace-nowrap rounded-xl transition-all flex items-center gap-1.5 shrink-0 border cursor-pointer ${
                    isSelected
                      ? "bg-[#006537] text-white border-[#004e2a] shadow-sm scale-[1.02]"
                      : "bg-[var(--surface-container-low)] text-[var(--on-surface-variant)] hover:bg-[var(--surface-container-high)] hover:text-[var(--on-surface)] border-[var(--outline-variant)]/60"
                  }`}
                >
                  <span className="text-sm">{emoji}</span>
                  <span>{cat.name}</span>
                  {catQuestionCount > 0 && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                      isSelected ? "bg-white/20 text-white" : "bg-[var(--surface-container-highest)] text-[var(--on-surface-variant)]"
                    }`}>
                      {catQuestionCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Sağ Kaydırma Butonu (Masaüstü) */}
          {canScrollRight && (
            <button
              type="button"
              onClick={() => handleScroll("right")}
              aria-label="Sağa kaydır"
              className="hidden md:flex items-center justify-center w-7 h-7 rounded-xl bg-[var(--surface-container-high)] text-[var(--on-surface)] hover:bg-[var(--primary)] hover:text-white transition-colors shrink-0 shadow-sm text-xs font-black cursor-pointer z-10"
            >
              ❯
            </button>
          )}
        </div>
      </div>

      {/* 2. AKTİF KATEGORİ BİLGİLENDİRME ŞERİDİ */}
      {selectedCategory && (
        <div className="bg-[#006537]/10 dark:bg-[#006537]/20 border border-[#006537]/30 rounded-xl p-3 flex items-center justify-between text-xs animate-in fade-in duration-300">
          <div className="flex items-center gap-2">
            <span className="text-lg">{selectedCategory.icon || getCategoryEmoji(selectedCategory.name, selectedCategory.slug)}</span>
            <div>
              <span className="font-extrabold text-[var(--primary)]">
                {selectedCategory.name}
              </span>
              <span className="text-[var(--on-surface-variant)] ml-1 font-medium">
                kategorisindeki en popüler sorular ({displayedQuestions.length} soru)
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSelectedCategoryId(null)}
            className="text-xs font-bold text-[var(--primary)] hover:underline flex items-center gap-1 cursor-pointer bg-white/60 dark:bg-black/20 px-2.5 py-1 rounded-lg border border-[var(--primary)]/20"
          >
            <span>Tümünü Göster</span>
            <span className="font-black">✕</span>
          </button>
        </div>
      )}

      {/* 3. SORULAR LİSTESİ */}
      {displayedQuestions.length === 0 ? (
        <div className="card text-center p-12 space-y-3">
          <span className="text-4xl block">🌱</span>
          <h4 className="font-bold text-base text-[var(--on-surface)]">
            {selectedCategory
              ? `"${selectedCategory.name}" kategorisinde henüz soru bulunmuyor.`
              : "Henüz soru sorulmamış."}
          </h4>
          <p className="text-xs text-[var(--on-surface-variant)] max-w-md mx-auto">
            {selectedCategory
              ? "Bu kategoride ilk soruyu sorarak uzmanlarımızın ve topluluğumuzun tecrübelerinden hemen faydalanabilirsiniz."
              : "İlk soruyu sen sorarak tarım topluluğumuza katıl!"}
          </p>
          <div className="pt-2 flex items-center justify-center gap-3">
            <Link
              href="/soru/sor"
              className="btn btn-primary text-xs font-bold px-4 py-2.5 rounded-xl shadow"
            >
              ➕ İlk Soruyu Sen Sor
            </Link>
            {selectedCategory && (
              <button
                type="button"
                onClick={() => setSelectedCategoryId(null)}
                className="btn bg-[var(--surface-container-high)] text-[var(--on-surface)] text-xs font-bold px-4 py-2.5 rounded-xl cursor-pointer"
              >
                Tüm Soruları Gör
              </button>
            )}
          </div>
        </div>
      ) : (
        displayedQuestions.map((q, index) => {
          const isAdPosition = adPositions.has(index + 1);
          const adToShow =
            isAdPosition && ads.length > 0
              ? ads[adCounter++ % ads.length]
              : null;

          return (
            <div key={q.id} className="space-y-6">
              {/* Soru Kartı */}
              <article className="card p-5 hover:border-[var(--primary)] transition-all shadow-sm hover:shadow-md group">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {q.user.image ? (
                      <img
                        src={q.user.image}
                        alt={q.user.name || "Kullanıcı"}
                        className="w-10 h-10 rounded-full object-cover border border-[var(--primary)]/30 shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/30 font-bold flex items-center justify-center text-sm shrink-0">
                        {q.user.name?.charAt(0).toUpperCase() || "U"}
                      </div>
                    )}
                    <div>
                      <h4 className="font-bold text-sm text-[var(--on-surface)] group-hover:text-[var(--primary)] transition-colors">
                        {q.user.name}
                      </h4>
                      <p className="text-[11px] text-[var(--on-surface-variant)]">
                        {formatDistanceToNow(new Date(q.createdAt), {
                          addSuffix: true,
                          locale: tr,
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Popülerlik veya Okunma Rozeti */}
                  {selectedCategory && (q.viewCount || 0) > 0 && (
                    <span className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                      <span>👁️</span>
                      <span>{q.viewCount} Okunma</span>
                    </span>
                  )}
                </div>

                <Link href={`/soru/${q.id}`} className="block space-y-2">
                  <h3 className="text-lg font-bold text-[var(--on-surface)] group-hover:text-[var(--primary)] transition-colors line-clamp-2">
                    {q.title}
                  </h3>
                  <p className="text-sm text-[var(--on-surface-variant)] line-clamp-3 leading-relaxed">
                    {q.body}
                  </p>

                  {/* Soru Görselleri (Tek Görsel / Çoklu Görsel Slider) */}
                  {q.images && q.images.length === 1 && (
                    <div className="w-full h-60 rounded-xl overflow-hidden bg-[var(--surface-container-high)] mt-3">
                      <img
                        src={q.images[0].url}
                        alt={q.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  )}

                  {q.images && q.images.length > 1 && (
                    <div className="mt-3 space-y-1.5">
                      <div className="flex gap-2.5 overflow-x-auto snap-x snap-mandatory scrollbar-thin py-1">
                        {q.images.map((img, imgIdx) => (
                          <div
                            key={imgIdx}
                            className="snap-start shrink-0 w-[85%] sm:w-[75%] h-56 rounded-xl overflow-hidden bg-[var(--surface-container-high)] border border-[var(--outline-variant)] relative group/img shadow-sm"
                          >
                            <img
                              src={img.url}
                              alt={`${q.title} - Görsel ${imgIdx + 1}`}
                              className="w-full h-full object-cover"
                            />
                            <span className="absolute bottom-2.5 right-2.5 bg-black/75 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full backdrop-blur-md shadow">
                              {imgIdx + 1} / {q.images.length} 📸
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="text-[11px] text-[var(--primary)] font-bold text-right flex items-center justify-end gap-1">
                        <span>↔️ Sağa kaydırarak tüm fotoğrafları görün ({q.images.length} Fotoğraf)</span>
                      </div>
                    </div>
                  )}

                  {/* Metin Altı: Satır 1 -> Kategori, Satır 2 -> Bitki/Ürün Türü ve Etiketler */}
                  <div className="pt-3 space-y-1.5 border-t border-[var(--outline-variant)]/50 mt-3">
                    {/* Satır 1: Kategori */}
                    <div className="flex items-center gap-2">
                      <span className="bg-[var(--primary)]/10 text-[var(--primary)] text-xs font-bold px-2.5 py-1 rounded-md flex items-center gap-1">
                        <span>{q.category.icon || getCategoryEmoji(q.category.name, q.category.slug)}</span>
                        <span>{q.category.name}</span>
                      </span>
                    </div>

                    {/* Satır 2: Bitki / Ürün Türü & Etiketler */}
                    {(q.cropType || (q.tags && q.tags.length > 0)) && (
                      <div className="flex flex-wrap items-center gap-1.5">
                        {q.cropType && (
                          <span className="bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs font-semibold px-2.5 py-1 rounded-md">
                            🌱 {q.cropType}
                          </span>
                        )}
                        {q.tags &&
                          q.tags.map((t: any, idx: number) => (
                            <span
                              key={idx}
                              className="bg-[var(--surface-container-high)] text-[var(--on-surface-variant)] text-[11px] font-medium px-2 py-0.5 rounded-md border border-[var(--outline-variant)]"
                            >
                              #{t.tag?.name || t.name}
                            </span>
                          ))}
                      </div>
                    )}
                  </div>
                </Link>

                {/* Kart Altı Bilgiler & Butonlar */}
                <div className="mt-4 pt-3 border-t border-[var(--outline-variant)] flex items-center justify-between text-xs text-[var(--on-surface-variant)]">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1 font-semibold text-[var(--primary)]">
                      💬 {q._count.answers} Yanıt
                    </span>
                    {(q.city || q.district) && (
                      <span className="flex items-center gap-1">
                        📍 {q.city} {q.district && `, ${q.district}`}
                      </span>
                    )}
                  </div>

                  <Link
                    href={`/soru/${q.id}`}
                    className="font-bold text-[var(--primary)] hover:underline flex items-center gap-1"
                  >
                    Cevapla & İncele ➔
                  </Link>
                </div>
              </article>

              {/* Sponsorlu Reklam Kartı */}
              {adToShow && <FeedAdCard ad={adToShow} />}
            </div>
          );
        })
      )}
    </div>
  );
}
