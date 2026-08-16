"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function CookieConsentBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Daha önce onay verilmiş mi kontrol et
    const consent = localStorage.getItem("hobitohum_cookie_consent");
    if (!consent) {
      // 800ms sonra yumuşak bir animasyonla aç
      const timer = setTimeout(() => setShow(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem("hobitohum_cookie_consent", "all");
    setShow(false);
  };

  const handleAcceptEssential = () => {
    localStorage.setItem("hobitohum_cookie_consent", "essential");
    setShow(false);
  };

  if (!show) return null;

  return (
    <aside
      aria-label="Çerez Onay Bildirimi"
      className="fixed bottom-4 left-4 right-4 md:left-6 md:right-auto md:max-w-md z-50 animate-in slide-in-from-bottom-5 fade-in duration-300"
    >
      <div className="bg-[var(--surface-container-lowest)] dark:bg-[var(--surface-container)] text-[var(--on-surface)] p-4 sm:p-5 rounded-2xl border-2 border-[var(--primary)] shadow-2xl space-y-3">
        <div className="flex items-start gap-3">
          <span className="text-2xl shrink-0">🍪</span>
          <div className="space-y-1">
            <h4 className="font-extrabold text-sm text-[var(--on-surface)]">
              Çerezler ve Gizlilik Bildirimi
            </h4>
            <p className="text-xs text-[var(--on-surface-variant)] leading-relaxed">
              Sitemizde size en iyi deneyimi sunmak, güvenli oturum sağlamak ve Google reklam ortaklarımızın ilgi alanınıza uygun içerikler sunabilmesi için çerezler kullanıyoruz.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-1 text-[11px]">
          <Link
            href="/gizlilik-politikasi"
            className="text-[var(--primary)] font-bold underline hover:opacity-80"
          >
            Gizlilik ve Çerez İlkelerini İncele ➔
          </Link>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--outline-variant)]/40">
          <button
            type="button"
            onClick={handleAcceptEssential}
            className="btn bg-[var(--surface-container-high)] hover:bg-[var(--surface-variant)] text-[var(--on-surface)] text-xs font-bold px-3 py-2 rounded-xl transition-all cursor-pointer"
          >
            Zorunlu Çerezler
          </button>
          <button
            type="button"
            onClick={handleAcceptAll}
            className="btn btn-primary text-xs font-extrabold px-4 py-2 rounded-xl shadow transition-all cursor-pointer hover:scale-[1.02]"
          >
            Tümünü Kabul Et
          </button>
        </div>
      </div>
    </aside>
  );
}
