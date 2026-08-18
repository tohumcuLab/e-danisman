"use client";

import Link from "next/link";
import { Sparkles, Crown, ShieldCheck, Zap, ArrowRight } from "lucide-react";

interface PremiumPromoCardProps {
  /**
   * Kartın görsel varyantı:
   * - "sidebar": Sağ veya sol yan paneller için dikey, kompakt ve zarif kart.
   * - "inline": Soru akışı (feed) veya detay sayfaları için yatay / geniş kart.
   * - "banner": İnce ve dikkat çekici yatay şerit.
   * - "floating": Sayfanın köşesinde veya mobilde dikkat çeken kompakt kart.
   */
  variant?: "sidebar" | "inline" | "banner" | "compact";
  className?: string;
}

export default function PremiumPromoCard({
  variant = "sidebar",
  className = "",
}: PremiumPromoCardProps) {
  // 1. INLINE VARYANTI (Soru Akışları & İçerik Araları)
  if (variant === "inline") {
    return (
      <div
        className={`relative overflow-hidden rounded-3xl p-5 sm:p-6 my-5 bg-gradient-to-br from-amber-500/15 via-[var(--surface-container-high)] to-emerald-500/10 border-2 border-amber-500/30 dark:border-amber-400/25 shadow-lg hover:shadow-xl transition-all duration-300 group ${className}`}
      >
        {/* Arka Plan Parlama Efektleri */}
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-amber-400/20 rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform duration-700" />
        <div className="absolute -bottom-12 -left-12 w-36 h-36 bg-emerald-500/15 rounded-full blur-2xl pointer-events-none" />

        {/* Dekoratif Arka Plan Filigranı */}
        <div className="absolute -right-2 -bottom-4 text-7xl sm:text-8xl opacity-10 select-none pointer-events-none group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500">
          👑
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          {/* Sol Kısım: Rozet, Başlık ve Slogan */}
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-sm">
              <Crown className="w-3.5 h-3.5 fill-current" />
              <span>Ayrıcalıklı Deneyim</span>
            </div>

            <h3 className="text-lg sm:text-xl font-black text-[var(--on-surface)] tracking-tight leading-tight">
              Premium Üyelik Paketlerini İncele
            </h3>

            <p className="text-sm font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500 shrink-0 animate-pulse" />
              <span>Premium Üye Ol Reklamlardan Kurtul !</span>
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-[var(--on-surface-variant)] font-medium">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                Sıfır Reklam, Kesintisiz Akış
              </span>
              <span className="hidden sm:inline">•</span>
              <span className="flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                Sorularınızda Uzman Önceliği
              </span>
            </div>
          </div>

          {/* Sağ Kısım: Aksiyon Butonu */}
          <div className="shrink-0 flex items-center">
            <Link
              href="/premium"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-white font-extrabold text-xs sm:text-sm px-6 py-3.5 rounded-2xl shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200"
            >
              <span>Paketleri Keşfet</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 2. BANNER VARYANTI (Üst veya Alt İnce Şerit)
  if (variant === "banner") {
    return (
      <div
        className={`relative overflow-hidden rounded-2xl p-4 bg-gradient-to-r from-[#006537] via-[#008148] to-amber-600 text-white shadow-md flex flex-col sm:flex-row items-center justify-between gap-3 ${className}`}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 text-xl shadow-inner">
            👑
          </div>
          <div>
            <h4 className="font-extrabold text-sm sm:text-base leading-tight">
              Premium Üyelik Paketlerini İncele
            </h4>
            <p className="text-xs text-amber-200 font-bold mt-0.5">
              Premium Üye Ol Reklamlardan Kurtul !
            </p>
          </div>
        </div>

        <Link
          href="/premium"
          className="w-full sm:w-auto text-center shrink-0 bg-white text-[#006537] hover:bg-amber-50 font-black px-4 py-2 rounded-xl text-xs shadow hover:scale-105 transition-all"
        >
          Hemen İncele ➔
        </Link>
      </div>
    );
  }

  // 3. COMPACT VARYANTI (Menü veya Küçük Alanlar İçin)
  if (variant === "compact") {
    return (
      <Link
        href="/premium"
        className={`block group relative overflow-hidden rounded-2xl p-3.5 bg-gradient-to-br from-amber-500/10 via-[var(--surface-container-high)] to-emerald-500/10 border border-amber-500/30 hover:border-amber-500 transition-all shadow-sm hover:shadow-md ${className}`}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center text-base shrink-0 group-hover:scale-110 transition-transform">
              👑
            </span>
            <div>
              <h5 className="font-bold text-xs text-[var(--on-surface)] group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors leading-tight">
                Premium Üyelik Paketleri
              </h5>
              <p className="text-[10px] font-bold text-amber-700 dark:text-amber-400">
                Reklamlardan Kurtul !
              </p>
            </div>
          </div>
          <span className="text-xs text-amber-600 dark:text-amber-400 font-extrabold group-hover:translate-x-1 transition-transform">
            ➔
          </span>
        </div>
      </Link>
    );
  }

  // 4. SIDEBAR VARYANTI (Varsayılan - Sağ veya Sol Kolon Widget'ı)
  return (
    <div
      className={`card relative overflow-hidden p-5 border-2 border-amber-500/30 dark:border-amber-400/25 bg-gradient-to-b from-amber-500/10 via-[var(--surface-container)] to-emerald-500/5 shadow-md hover:shadow-xl transition-all duration-300 group ${className}`}
    >
      {/* Arka Plan Parlama Efekti */}
      <div className="absolute -top-10 -right-10 w-28 h-28 bg-amber-400/20 rounded-full blur-2xl pointer-events-none group-hover:scale-150 transition-transform duration-700" />
      <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-emerald-500/15 rounded-full blur-xl pointer-events-none" />

      {/* Arka Plan Büyük Filigran İkon */}
      <div className="absolute -right-2 -bottom-2 text-6xl opacity-10 select-none pointer-events-none group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500">
        👑
      </div>

      <div className="relative z-10 space-y-3.5">
        {/* Üst Rozet & İkon */}
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-sm">
            <Sparkles className="w-3 h-3 fill-current" />
            Özel Fırsat
          </span>
          <span className="text-xs font-black text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
            %100 Reklamsız
          </span>
        </div>

        {/* Başlık ve Slogan */}
        <div>
          <h3 className="font-extrabold text-base text-[var(--on-surface)] tracking-tight leading-snug group-hover:text-amber-700 dark:group-hover:text-amber-300 transition-colors">
            Premium Üyelik Paketlerini İncele
          </h3>
          <p className="text-xs font-bold text-amber-700 dark:text-amber-400 mt-1 flex items-center gap-1">
            <span>✨ Premium Üye Ol Reklamlardan Kurtul !</span>
          </p>
        </div>

        {/* Avantaj Maddeleri */}
        <div className="space-y-1.5 pt-1 border-t border-[var(--outline-variant)]/50 text-[11px] text-[var(--on-surface-variant)]">
          <div className="flex items-center gap-1.5 font-medium">
            <span className="text-amber-500 font-bold">✓</span>
            <span>Tüm sayfalarda sıfır reklam deneyimi</span>
          </div>
          <div className="flex items-center gap-1.5 font-medium">
            <span className="text-amber-500 font-bold">✓</span>
            <span>Kesintisiz soru sorma ve hızlı yanıt</span>
          </div>
          <div className="flex items-center gap-1.5 font-medium">
            <span className="text-amber-500 font-bold">✓</span>
            <span>Öncelikli uzman danışman desteği</span>
          </div>
        </div>

        {/* Aksiyon Butonu */}
        <Link
          href="/premium"
          className="block w-full text-center py-2.5 px-4 rounded-xl font-black text-xs text-white bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-800 shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-95 transition-all duration-200"
        >
          Paketleri İncele ➔
        </Link>
      </div>
    </div>
  );
}
