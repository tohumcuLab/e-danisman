"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

type SideMenuProps = {
  user: any | null;
};

export function SideMenu({ user }: SideMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [profileData, setProfileData] = useState<any | null>(null);
  const pathname = usePathname();

  // Route değiştiğinde menüyü kapat
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Giriş yapmış kullanıcının gerçek zamanlı bakiye ve istatistik verilerini çek
  useEffect(() => {
    if (user && isOpen) {
      fetch("/api/user/me")
        .then((res) => res.ok ? res.json() : null)
        .then((data) => {
          if (data?.user) {
            setProfileData(data.user);
          }
        })
        .catch((err) => console.error("Profil bilgisi yüklenemedi:", err));
    }
  }, [user, isOpen]);

  // Menü açıkken arka plan kaydırmasını engelle ve dinamik footer'ı bilgilendir
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    window.dispatchEvent(new CustomEvent("sidemenu:toggle", { detail: isOpen }));
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="p-1.5 sm:p-2 text-gray-600 hover:text-[var(--primary)] hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors shrink-0 cursor-pointer touch-manipulation z-10"
        aria-label="Menüyü Aç"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 sm:w-6 sm:h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </svg>
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-[60] transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Panel */}
      <div 
        className={`fixed top-0 left-0 w-80 h-full bg-[var(--surface-container)] z-[70] shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? "translate-x-0 pointer-events-auto opacity-100" : "-translate-x-full pointer-events-none opacity-0"
        }`}
      >
        {/* Menünün Dışına Taşan Kapatma (X) Düğmesi - Sadece Menü Açıkken Görünür */}
        {isOpen && (
          <button 
            onClick={() => setIsOpen(false)}
            className="absolute top-4 -right-11 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 w-9 h-9 rounded-full shadow-2xl flex items-center justify-center font-extrabold text-sm hover:scale-110 transition-all border border-gray-300 dark:border-gray-700 cursor-pointer"
            aria-label="Menüyü Kapat"
          >
            ✕
          </button>
        )}

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* 1. EN ÜSTTE: Yeşil Profil Özeti Kutusu */}
          {user ? (
            <div className="bg-[#006537] text-white p-4 rounded-2xl shadow-md border border-[#006537]/30 space-y-3">
              {/* Profil Üst Başlık & Bakiye */}
              <Link 
                href="/profil" 
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-between group hover:opacity-90 transition-opacity"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  {user.image || user.avatarUrl ? (
                    <img 
                      src={user.image || user.avatarUrl} 
                      alt={user.name || "Kullanıcı"} 
                      className="w-11 h-11 rounded-full object-cover border-2 border-white/50 shrink-0 shadow-sm" 
                    />
                  ) : (
                    <div className="w-11 h-11 rounded-full bg-white/20 text-white font-extrabold flex items-center justify-center text-base shrink-0 border-2 border-white/30 shadow-inner">
                      {user.name?.charAt(0).toUpperCase() || "U"}
                    </div>
                  )}
                  <div className="min-w-0">
                    <h3 className="font-extrabold text-sm text-white truncate group-hover:underline">
                      {user.name}
                    </h3>
                    <p className="text-[11px] text-amber-200 font-bold flex items-center gap-1">
                      <span>Bakiye:</span>
                      <span className="bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-md font-extrabold border border-amber-300/30">
                        {profileData?.credits ?? user.credits ?? 0} 🪙
                      </span>
                    </p>
                  </div>
                </div>
                <span className="text-xs bg-white/20 text-white px-2.5 py-1 rounded-full font-bold shrink-0">
                  Profil ➔
                </span>
              </Link>

              {/* 4'lü İstatistik Özeti (Her biri ayrı tıklanabilir link) */}
              <div className="grid grid-cols-4 gap-1 pt-2 border-t border-white/20 text-center">
                {/* 1. Soru Sordu (Kullanıcının Sorduğu Tüm Sorular) */}
                <Link
                  href={`/kullanici/${user.id}?tab=questions`}
                  onClick={() => setIsOpen(false)}
                  className="bg-white/10 hover:bg-white/25 p-1.5 rounded-xl border border-white/15 transition-all transform hover:scale-105 group/box cursor-pointer"
                  title="Sorduğunuz tüm soruları inceleyin"
                >
                  <p className="text-[9px] text-white/80 group-hover/box:text-white font-bold uppercase truncate">Soru Sordu</p>
                  <p className="text-xs font-extrabold text-white group-hover/box:underline">{profileData?.askedQuestionsCount ?? 0}</p>
                </Link>

                {/* 2. Onay Bekleyen (Henüz Onaylanmamış Sorular - 0 ise '-' gösterir) */}
                <Link
                  href={`/kullanici/${user.id}?tab=pending`}
                  onClick={() => setIsOpen(false)}
                  className="bg-white/10 hover:bg-white/25 p-1.5 rounded-xl border border-white/15 transition-all transform hover:scale-105 group/box cursor-pointer"
                  title="Onay bekleyen sorularınız"
                >
                  <p className="text-[9px] text-amber-200 group-hover/box:text-amber-100 font-bold uppercase truncate">Onay Bekleyen</p>
                  <p className="text-xs font-extrabold text-amber-300 group-hover/box:underline">
                    {(profileData?.pendingQuestionsCount ?? 0) > 0 ? profileData.pendingQuestionsCount : "-"}
                  </p>
                </Link>

                {/* 3. Cevapladı (Kullanıcının Verdiği Cevaplar) */}
                <Link
                  href={`/kullanici/${user.id}?tab=answers`}
                  onClick={() => setIsOpen(false)}
                  className="bg-white/10 hover:bg-white/25 p-1.5 rounded-xl border border-white/15 transition-all transform hover:scale-105 group/box cursor-pointer"
                  title="Verdiğiniz cevapları inceleyin"
                >
                  <p className="text-[9px] text-white/80 group-hover/box:text-white font-bold uppercase truncate">Cevapladı</p>
                  <p className="text-xs font-extrabold text-white group-hover/box:underline">{profileData?.answersCount ?? 0}</p>
                </Link>

                {/* 4. Cevapsız (Kullanıcının Cevap Bekleyen Soruları) */}
                <Link
                  href={`/kullanici/${user.id}?tab=unanswered`}
                  onClick={() => setIsOpen(false)}
                  className="bg-white/10 hover:bg-white/25 p-1.5 rounded-xl border border-white/15 transition-all transform hover:scale-105 group/box cursor-pointer"
                  title="Cevap bekleyen sorularınızı inceleyin"
                >
                  <p className="text-[9px] text-amber-200 group-hover/box:text-amber-100 font-bold uppercase truncate">Cevapsız</p>
                  <p className="text-xs font-extrabold text-amber-300 group-hover/box:underline">{profileData?.unansweredQuestionsCount ?? 0}</p>
                </Link>
              </div>
            </div>
          ) : (
            <Link 
              href="/giris" 
              className="block bg-[#006537] hover:bg-[#74db98] hover:text-[#00391d] transition-all text-white p-4 rounded-2xl shadow-md border border-[#006537]/30 text-center font-bold text-sm"
            >
              🔑 Giriş Yap / Kayıt Ol ➔
            </Link>
          )}

          {/* Menü Düğmeleri */}
          <nav className="flex flex-col gap-1.5 pt-1">
            {/* En Aktif Danışmanlar Düğmesi (İlk 100 Kullanıcı) */}
            <Link href="/danismanlar" className="flex items-center justify-between px-4 py-3 rounded-xl hover:bg-[var(--surface-container-high)] font-bold text-sm text-[var(--on-surface)] transition-colors">
              <span className="flex items-center gap-3">
                🏆 En Aktif Danışmanlar
              </span>
              <span className="text-[10px] bg-[var(--primary)]/10 text-[var(--primary)] px-2 py-0.5 rounded-full font-extrabold">
                Top 100
              </span>
            </Link>

            {/* En Çok Okunanlar Düğmesi */}
            <Link href="/en-cok-okunanlar" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[var(--surface-container-high)] font-bold text-sm text-[var(--on-surface)] transition-colors">
              🔥 En Çok Okunanlar
            </Link>

            {/* Cevap Bekleyenler Düğmesi */}
            <Link href="/cevap-bekleyenler" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[var(--surface-container-high)] font-bold text-sm text-[var(--on-surface)] transition-colors">
              ⏳ Cevap Bekleyenler
            </Link>

            <div className="my-1 border-t border-[var(--outline-variant)]"></div>

            {user?.role === "EXPERT" && (
              <Link href="/uzman" className="flex items-center gap-3 px-4 py-3 rounded-xl text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/20 font-bold text-sm transition-colors">
                🎓 Uzman Paneli
              </Link>
            )}
            
            {user?.role === "ADMIN" && (
              <Link href="/admin" className="flex items-center gap-3 px-4 py-3 rounded-xl text-purple-700 bg-purple-50 hover:bg-purple-100 dark:text-purple-400 dark:bg-purple-900/20 font-bold text-sm transition-colors">
                ⚙️ Admin Paneli
              </Link>
            )}
          </nav>
        </div>

        {/* Footer Öncesi Hava Tahmini / Tavsiye Kutusu & Footer Metni */}
        <div className="p-4 border-t border-[var(--outline-variant)] bg-[var(--surface-container-low)] space-y-3">
          {/* Ana Sayfadaki Canlı Hava Tahmini ve Tavsiye Bölümü Kutusu */}
          <div className="p-3 bg-amber-50/60 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-700/50 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">☀️</span>
                <div>
                  <p className="text-[10px] font-extrabold text-[var(--on-surface-variant)] uppercase tracking-wider">CANLI HAVA DURUMU</p>
                  <h4 className="text-sm font-extrabold text-[var(--on-surface)] leading-none">24°C <span className="text-[10px] font-normal text-[var(--on-surface-variant)]">/ Güneşli</span></h4>
                </div>
              </div>
              <span className="text-[9px] bg-amber-500 text-white font-bold px-2 py-0.5 rounded-full">BUGÜN</span>
            </div>
            <div className="bg-[var(--surface-container-lowest)] p-2 rounded-lg border border-[var(--outline-variant)]">
              <p className="text-[10px] font-bold text-[var(--primary)] mb-0.5">🌱 GÜNÜN TARIMSAL TAVSİYESİ</p>
              <p className="text-[10px] text-[var(--on-surface)] font-medium leading-tight">
                Domates ve biber ekimi için ideal şartlar. Akşam üzeri sulama yapılması tavsiye edilir.
              </p>
            </div>
          </div>

          {/* Kurallar ve Sözleşme Bağlantıları */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 text-[10px] font-bold text-[var(--on-surface-variant)] pt-1">
            <Link href="/duyurular" onClick={() => setIsOpen(false)} className="text-[var(--primary)] font-bold underline hover:opacity-80">📢 Duyurular</Link>
            <span>•</span>
            <Link href="/telif-ve-yasal-uyari" onClick={() => setIsOpen(false)} className="text-amber-700 dark:text-amber-400 font-bold hover:underline">⚖️ Telif</Link>
            <span>•</span>
            <Link href="/topluluk-kurallari" onClick={() => setIsOpen(false)} className="hover:underline">Kurallar</Link>
            <span>•</span>
            <Link href="/kullanici-sozlesmesi" onClick={() => setIsOpen(false)} className="hover:underline">Sözleşme</Link>
          </div>

          {/* Footer Yazısı ve Açıklaması */}
          <div className="text-center space-y-0.5 pt-1">
            <h4 className="text-xs font-extrabold text-[var(--primary)]">Tarımsal e-Danışman 🌿</h4>
            <p className="text-[10px] text-[var(--on-surface-variant)] leading-tight">
              Çiftçiler ve Tarım Gönüllülerinin Dijital Buluşma Noktası © 2026
            </p>
          </div>

          {/* Çıkış Butonu */}
          {user && (
            <button 
              type="button" 
              onClick={async () => {
                await signOut({ redirect: false });
                window.location.href = "/";
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-red-600 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 font-bold text-xs transition-colors cursor-pointer border border-red-200 dark:border-red-900"
            >
              🚪 Çıkış Yap
            </button>
          )}
        </div>
      </div>
    </>
  );
}
