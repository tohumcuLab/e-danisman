"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowUp } from "lucide-react";

const FULL_DISCLAIMER_TEXT = "Tarımsal e-Danışman, Hobitohum.com tarafından geliştirilen topluluk platformudur. Sitede yer alan tüm metin, uzman yanıtları, fotoğraf, video ve görseller 5846 Sayılı Fikir ve Sanat Eserleri Kanunu (FSEK) uyarınca koruma altındadır. İzinsiz kopyalanamaz, çoğaltılamaz veya başka mecralarda yayınlanamaz.";

export default function StickyFooterBar() {
  const [isVisible, setIsVisible] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDisclaimerExpanded, setIsDisclaimerExpanded] = useState(false);

  useEffect(() => {
    const handleMenuToggle = (e: Event) => {
      const customEvent = e as CustomEvent;
      setIsMenuOpen(Boolean(customEvent.detail));
    };

    window.addEventListener("sidemenu:toggle", handleMenuToggle);
    return () => window.removeEventListener("sidemenu:toggle", handleMenuToggle);
  }, []);

  useEffect(() => {
    // Ekranda aşağı inildiğinde (150px sonrası) footer görünür olsun
    const handleScroll = () => {
      if (window.scrollY > 150) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    handleScroll(); // İlk yüklemede de kontrol et
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Slide menü açıkken dinamik footer tamamen gizlenir
  if (isMenuOpen) return null;

  return (
    <footer
      className={`fixed bottom-0 left-0 right-0 z-50 bg-[var(--surface-container-lowest)]/95 backdrop-blur-md border-t border-[var(--outline-variant)] py-2 px-3 sm:px-6 shadow-2xl transition-all duration-300 transform ${
        isVisible ? "translate-y-0 opacity-100" : "translate-y-full opacity-0 pointer-events-none"
      }`}
    >
      <div className="container max-w-7xl mx-auto flex flex-col space-y-2 text-xs">
        
        {/* Üst Satır: Akordeon Telif Metni ve Navigasyon Bağlantıları */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
          
          {/* Akordeon Metin Alanı */}
          <div className="flex-1 min-w-0">
            <div 
              onClick={() => setIsDisclaimerExpanded(!isDisclaimerExpanded)}
              className="flex items-center gap-1.5 cursor-pointer select-none group"
              title={isDisclaimerExpanded ? "Açıklamayı Daralt" : "Açıklamanın Tamamını Oku (Akordeon)"}
            >
              <span className={`text-[11px] sm:text-xs text-[var(--on-surface-variant)] transition-all ${
                isDisclaimerExpanded 
                  ? "block font-medium leading-relaxed text-[var(--on-surface)]" 
                  : "truncate block max-w-[240px] xs:max-w-[320px] sm:max-w-xl md:max-w-2xl font-normal group-hover:text-[var(--primary)]"
              }`}>
                {FULL_DISCLAIMER_TEXT}
              </span>
              
              {/* Üçgen İkon Butonu (▼ / ▲) */}
              <button
                type="button"
                className="text-[9px] bg-[var(--primary)]/10 text-[var(--primary)] px-1.5 py-0.5 rounded-md group-hover:bg-[var(--primary)] group-hover:text-white transition-colors shrink-0 flex items-center gap-0.5 font-bold"
              >
                <span>{isDisclaimerExpanded ? "▲" : "▼"}</span>
              </button>
            </div>

            {/* Genişletilmiş Akordeon Ek İçeriği */}
            {isDisclaimerExpanded && (
              <div className="mt-2 pt-2 border-t border-[var(--outline-variant)]/40 text-[11px] text-[var(--on-surface-variant)] flex flex-wrap items-center justify-between gap-2 animate-in fade-in slide-in-from-top-1">
                <span>5846 Sayılı FSEK uyarınca tüm içerikler Hobitohum.com lisansı altında korunmaktadır.</span>
                <Link href="/telif-ve-yasal-uyari" className="text-[var(--primary)] font-bold underline hover:opacity-80">
                  Detaylı Yasal Şartlar ➔
                </Link>
              </div>
            )}
          </div>

          {/* Sağ Taraftaki Hızlı Linkler ve Yukarı Çık Butonu */}
          <div className="flex items-center justify-between md:justify-end gap-3 text-[11px] shrink-0 pt-1 md:pt-0 border-t md:border-t-0 border-[var(--outline-variant)]/30">
            <div className="flex items-center gap-1.5 font-semibold">
              <Link href="/duyurular" className="text-[var(--primary)] font-bold underline hover:opacity-80">📢 Duyurular</Link>
              <span>•</span>
              <Link href="/telif-ve-yasal-uyari" className="text-amber-700 dark:text-amber-400 font-bold hover:underline">⚖️ Telif</Link>
              <span>•</span>
              <Link href="/topluluk-kurallari" className="hover:underline">Kurallar</Link>
              <span>•</span>
              <Link href="/kullanici-sozlesmesi" className="hover:underline">Sözleşme</Link>
              <span>•</span>
              <Link href="/gizlilik-politikasi" className="hover:underline">Gizlilik</Link>
            </div>

            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              aria-label="Yukarı Çık"
              className="bg-[var(--primary)] text-white w-7 h-7 rounded-full hover:bg-[var(--primary-container)] transition-all shadow shrink-0 cursor-pointer flex items-center justify-center"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>
    </footer>
  );
}
