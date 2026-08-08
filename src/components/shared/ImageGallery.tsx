"use client";

import { useState, useRef, TouchEvent } from "react";

type ImageType = {
  id: string;
  url: string;
};

export default function ImageGallery({ images }: { images: ImageType[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  
  // Fullscreen Lightbox Zoom States
  const [zoomScale, setZoomScale] = useState(1);
  const [initialPinchDist, setInitialPinchDist] = useState<number | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);

  if (!images || images.length === 0) return null;

  // Instagram slider scroll handler
  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, clientWidth } = scrollRef.current;
    const newIndex = Math.round(scrollLeft / clientWidth);
    if (newIndex !== currentIndex && newIndex >= 0 && newIndex < images.length) {
      setCurrentIndex(newIndex);
    }
  };

  const scrollToImage = (index: number) => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTo({
      left: index * scrollRef.current.clientWidth,
      behavior: "smooth",
    });
    setCurrentIndex(index);
  };

  // Lightbox handlers
  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setZoomScale(1);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    setZoomScale(1);
  };

  // Double tap to zoom
  const handleDoubleTap = () => {
    setZoomScale((prev) => (prev > 1 ? 1 : 2.5));
  };

  // Mobile pinch-to-zoom calculation
  const getPinchDistance = (e: TouchEvent) => {
    if (e.touches.length < 2) return null;
    const dx = e.touches[0].clientX - e.touches[1].clientX;
    const dy = e.touches[0].clientY - e.touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleTouchStart = (e: TouchEvent) => {
    if (e.touches.length === 2) {
      const dist = getPinchDistance(e);
      setInitialPinchDist(dist);
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (e.touches.length === 2 && initialPinchDist !== null) {
      const currentDist = getPinchDistance(e);
      if (currentDist) {
        const factor = currentDist / initialPinchDist;
        const newScale = Math.min(Math.max(1, zoomScale * factor), 4);
        setZoomScale(newScale);
        setInitialPinchDist(currentDist);
      }
    }
  };

  return (
    <div className="relative w-full my-4 select-none">
      {/* Instagram Tarzı Sağa Kaydırmalı Galeri Kapsayıcısı */}
      <div className="relative group rounded-2xl overflow-hidden bg-[var(--surface-container-high)] border border-[var(--outline-variant)] shadow-sm">
        
        {/* Görsel Sayacı Badgesi (Örn: 1/3) */}
        {images.length > 1 && (
          <div className="absolute top-3 right-3 z-10 bg-black/65 text-white font-extrabold text-[11px] px-3 py-1 rounded-full backdrop-blur-md shadow">
            {currentIndex + 1} / {images.length}
          </div>
        )}

        {/* Görsellerin Sıralandığı Snap-Scroll Alanı */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {images.map((img, idx) => (
            <div
              key={img.id}
              onClick={() => openLightbox(idx)}
              className="snap-center shrink-0 w-full flex items-center justify-center bg-black/5 dark:bg-black/40 cursor-zoom-in relative"
            >
              <img
                src={img.url}
                alt={`Soru görseli ${idx + 1}`}
                className="w-full max-h-[480px] object-cover sm:object-contain transition-transform duration-300"
              />
            </div>
          ))}
        </div>

        {/* Masaüstü Sağ/Sol Kaydırma Okları */}
        {images.length > 1 && (
          <>
            {currentIndex > 0 && (
              <button
                type="button"
                onClick={() => scrollToImage(currentIndex - 1)}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-sm transition-all shadow-md cursor-pointer opacity-90 sm:opacity-0 group-hover:opacity-100"
              >
                ‹
              </button>
            )}

            {currentIndex < images.length - 1 && (
              <button
                type="button"
                onClick={() => scrollToImage(currentIndex + 1)}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-sm transition-all shadow-md cursor-pointer opacity-90 sm:opacity-0 group-hover:opacity-100"
              >
                ›
              </button>
            )}
          </>
        )}

        {/* Instagram Tarzı Alt Noktalar (Dots Indicator) */}
        {images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5 bg-black/40 px-3 py-1.5 rounded-full backdrop-blur-md">
            {images.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => scrollToImage(idx)}
                className={`transition-all rounded-full ${
                  idx === currentIndex
                    ? "w-2.5 h-2.5 bg-white scale-110"
                    : "w-1.5 h-1.5 bg-white/50 hover:bg-white/80"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Mobilde İki Parmak Pinch-to-Zoom / Fullscreen Tam Ekran Işıklık (Lightbox) */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-between p-4 animate-fadeIn">
          {/* Üst Bar: Sayacı ve Kapat Butonu */}
          <div className="w-full flex items-center justify-between text-white text-xs z-10 pt-2 px-2">
            <span className="font-extrabold bg-white/20 px-3 py-1 rounded-full backdrop-blur-md">
              {lightboxIndex + 1} / {images.length}
            </span>
            <span className="text-[11px] text-gray-300 hidden sm:inline">
              (Görsele çift tıklayarak veya iki parmakla büyütebilirsiniz)
            </span>
            <button
              onClick={closeLightbox}
              className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 text-white font-bold text-lg flex items-center justify-center backdrop-blur-md transition-all cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* Tam Ekran Büyütülebilir Görsel Alanı */}
          <div
            className="w-full h-full flex items-center justify-center overflow-hidden touch-none my-auto"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onDoubleClick={handleDoubleTap}
          >
            <img
              src={images[lightboxIndex].url}
              alt="Tam Ekran Görsel"
              style={{ transform: `scale(${zoomScale})` }}
              className="max-w-full max-h-[85vh] object-contain transition-transform duration-200 ease-out cursor-grab active:cursor-grabbing"
            />
          </div>

          {/* Alt Kontroller: Büyütme/Küçültme Butonları & Önceki/Sonraki */}
          <div className="w-full flex items-center justify-between gap-4 text-white z-10 pb-2 px-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setZoomScale((prev) => Math.min(prev + 0.5, 4))}
                className="bg-white/20 hover:bg-white/40 text-white text-xs px-3 py-1.5 rounded-xl font-bold backdrop-blur-md transition-all"
              >
                🔍 + Yakınlaştır
              </button>
              {zoomScale > 1 && (
                <button
                  type="button"
                  onClick={() => setZoomScale(1)}
                  className="bg-white/20 hover:bg-white/40 text-white text-xs px-3 py-1.5 rounded-xl font-bold backdrop-blur-md transition-all"
                >
                  ↩️ Sıfırla
                </button>
              )}
            </div>

            {images.length > 1 && (
              <div className="flex items-center gap-2">
                <button
                  disabled={lightboxIndex === 0}
                  onClick={() => {
                    setLightboxIndex((prev) => Math.max(0, prev - 1));
                    setZoomScale(1);
                  }}
                  className="bg-white/20 hover:bg-white/40 disabled:opacity-30 text-white px-3 py-1.5 rounded-xl font-bold backdrop-blur-md transition-all text-xs"
                >
                  ◀ Önceki
                </button>
                <button
                  disabled={lightboxIndex === images.length - 1}
                  onClick={() => {
                    setLightboxIndex((prev) => Math.min(images.length - 1, prev + 1));
                    setZoomScale(1);
                  }}
                  className="bg-white/20 hover:bg-white/40 disabled:opacity-30 text-white px-3 py-1.5 rounded-xl font-bold backdrop-blur-md transition-all text-xs"
                >
                  Sonraki ▶
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
