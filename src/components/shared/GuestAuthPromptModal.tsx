"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { safeSessionStorage } from "@/lib/safeStorage";

export default function GuestAuthPromptModal() {
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Auth sayfalarında (giris, kayit), iletişim/reklam veya admin panelinde modal gösterilmesin
  const isAuthOrAdminPage = 
    pathname.startsWith("/giris") || 
    pathname.startsWith("/kayit") || 
    pathname.startsWith("/iletisim") || 
    pathname.startsWith("/admin");

  useEffect(() => {
    // Sadece giriş yapmamış (guest) kullanıcılara göster
    if (status !== "unauthenticated" || isAuthOrAdminPage) {
      setIsOpen(false);
      return;
    }

    // Oturum esnasında önceden kapatıldı mı kontrol et
    const isDismissed = safeSessionStorage.getItem("guest_auth_modal_dismissed");
    
    if (!isDismissed) {
      // Sayfaya girdikten 5 saniye sonra otomatik göster
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [status, isAuthOrAdminPage, pathname]);

  // Global event listener: Giriş yapmamış kullanıcı tıklama uyarısı
  useEffect(() => {
    const handleGuestPrompt = () => {
      if (status === "unauthenticated" && !isAuthOrAdminPage) {
        setIsOpen(true);
      }
    };

    window.addEventListener("prompt-guest-login", handleGuestPrompt);
    return () => window.removeEventListener("prompt-guest-login", handleGuestPrompt);
  }, [status, isAuthOrAdminPage]);

  const handleClose = () => {
    setIsOpen(false);
    safeSessionStorage.setItem("guest_auth_modal_dismissed", "true");
  };

  if (!isOpen || status === "authenticated" || isAuthOrAdminPage) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-[var(--surface)] text-[var(--on-surface)] border border-[var(--outline-variant)] w-full max-w-lg max-h-[92vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden relative transform transition-all animate-in zoom-in-95 duration-200">
        
        {/* Üst Renkli Banner */}
        <div className="bg-gradient-to-r from-[#006537] via-emerald-600 to-teal-700 p-3.5 sm:p-4 text-white relative overflow-hidden shrink-0">
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 text-white/80 hover:text-white bg-black/20 hover:bg-black/40 rounded-full w-7 h-7 flex items-center justify-center text-xs transition-colors cursor-pointer"
            title="Kapat"
          >
            ✕
          </button>
          
          <div className="flex items-center gap-2.5 sm:gap-3">
            <img 
              src="/tarimsaledanisman111.svg" 
              alt="Tarımsal e-Danışman Logo" 
              className="w-9 h-9 sm:w-11 sm:h-11 object-contain shrink-0 drop-shadow-md bg-white/10 p-1 rounded-xl border border-white/20" 
            />
            <div>
              <h3 className="font-extrabold text-base sm:text-xl leading-tight">
                Tarımsal e-Danışman, Hoşgeldiniz
              </h3>
              <p className="text-[11px] sm:text-xs text-emerald-100 font-medium mt-0.5">
                Tarıma gönül verenlerin buluştuğu platform!
              </p>
            </div>
          </div>
        </div>

        {/* Modal İçeriği (Kaydırılabilir alan) */}
        <div className="p-3.5 sm:p-5 space-y-3 sm:space-y-4 overflow-y-auto scrollbar-thin">
          <p className="text-xs sm:text-sm text-[var(--on-surface-variant)] leading-relaxed font-medium">
            Toprağınızın ve bitkilerinizin dili olmak için buradayız! Bir kaç fotoğraf ile siz sorun biz cevap verelim. Diğer tarım gönüllüleri ile tecrübe paylaşımında bulunmak için aramıza hemen katılın!
          </p>

          {/* Avantajlar Listesi */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5">
            <div className="flex items-start gap-2 p-2 sm:p-2.5 rounded-xl bg-[var(--surface-container-low)] border border-[var(--outline-variant)]">
              <span className="text-base sm:text-lg shrink-0">🎁</span>
              <div>
                <h4 className="font-bold text-xs">10 Hediye Kredi</h4>
                <p className="text-[10px] sm:text-[11px] text-[var(--on-surface-variant)]">Yeni üyelere anında tanımlanır.</p>
              </div>
            </div>

            <div className="flex items-start gap-2 p-2 sm:p-2.5 rounded-xl bg-[var(--surface-container-low)] border border-[var(--outline-variant)]">
              <span className="text-base sm:text-lg shrink-0">👨‍🌾</span>
              <div>
                <h4 className="font-bold text-xs">Tarımsal Danışmanlar</h4>
                <p className="text-[10px] sm:text-[11px] text-[var(--on-surface-variant)]">Sorularınıza doğru cevaplar alın.</p>
              </div>
            </div>

            <div className="flex items-start gap-2 p-2 sm:p-2.5 rounded-xl bg-[var(--surface-container-low)] border border-[var(--outline-variant)]">
              <span className="text-base sm:text-lg shrink-0">📸</span>
              <div>
                <h4 className="font-bold text-xs">Fotoğraflı Teşhis</h4>
                <p className="text-[10px] sm:text-[11px] text-[var(--on-surface-variant)]">Hastalıkları fotoğrafla sorun.</p>
              </div>
            </div>

            <Link
              href="/iletisim?tab=ad"
              onClick={handleClose}
              className="flex items-start gap-2 p-2 sm:p-2.5 rounded-xl bg-[var(--surface-container-low)] border border-[var(--outline-variant)] hover:border-amber-500 hover:bg-amber-500/10 transition-all group cursor-pointer"
            >
              <span className="text-base sm:text-lg group-hover:scale-110 transition-transform shrink-0">📢</span>
              <div>
                <h4 className="font-bold text-xs group-hover:text-amber-600 dark:group-hover:text-amber-400 flex items-center gap-1">
                  <span>Reklam Ver</span>
                  <span className="text-[10px]">➔</span>
                </h4>
                <p className="text-[10px] sm:text-[11px] text-[var(--on-surface-variant)]">Markanızı binlerce üreticiyle paylaşın.</p>
              </div>
            </Link>
          </div>

          {/* Butonlar */}
          <div className="space-y-2 pt-1">
            {/* Tek Satırda İki Buton: Sol: Premium Üyelik, Sağ: Hemen Üye Ol */}
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <Link
                href="/premium"
                onClick={handleClose}
                className="flex items-center justify-center gap-1.5 sm:gap-2 w-full bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-white font-extrabold text-xs sm:text-sm py-2.5 sm:py-3 px-2 sm:px-3 rounded-xl shadow-md hover:shadow-lg transition-all text-center truncate"
              >
                <span>👑 Premium Üyelik</span>
              </Link>

              <Link
                href="/kayit"
                onClick={handleClose}
                className="flex items-center justify-center gap-1.5 sm:gap-2 w-full bg-[#006537] hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm py-2.5 sm:py-3 px-2 sm:px-3 rounded-xl shadow-md transition-all text-center truncate"
              >
                <span>🚀 Hemen Üye Ol</span>
              </Link>
            </div>

            {/* Zaten Hesabım Var, Giriş Yap */}
            <Link
              href="/giris"
              onClick={handleClose}
              className="flex items-center justify-center gap-1.5 w-full bg-[var(--surface-container-high)] hover:bg-[var(--surface-variant)] text-[var(--on-surface)] font-bold text-xs sm:text-sm py-2 sm:py-2.5 px-3 rounded-xl border border-[var(--outline-variant)] transition-colors"
            >
              <span>🔐 Zaten Hesabım Var, Giriş Yap</span>
            </Link>
          </div>
        </div>

        {/* Modal Alt Kapat Butonu */}
        <div className="bg-[var(--surface-container-low)] px-4 py-2 sm:py-2.5 border-t border-[var(--outline-variant)] text-center shrink-0">
          <button
            onClick={handleClose}
            className="text-[11px] sm:text-xs text-[var(--on-surface-variant)] hover:text-[var(--on-surface)] font-semibold underline transition-colors cursor-pointer"
          >
            Geçici olarak misafir kalmaya devam et
          </button>
        </div>

      </div>
    </div>
  );
}
