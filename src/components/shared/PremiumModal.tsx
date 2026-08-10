"use client";

import Link from "next/link";

type PremiumModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function PremiumModal({ isOpen, onClose }: PremiumModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-[var(--surface)] text-[var(--on-surface)] border border-[var(--outline-variant)] max-w-lg w-full rounded-3xl p-6 relative shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
        
        {/* Kapat Butonu */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[var(--on-surface-variant)] hover:text-[var(--on-surface)] bg-[var(--surface-variant)]/60 hover:bg-[var(--surface-variant)] w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all"
        >
          ✕
        </button>

        {/* Üst İkon & Başlık */}
        <div className="text-center mb-6 pt-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 text-3xl mb-3 animate-bounce">
            👑
          </div>
          <h2 className="text-2xl font-black bg-gradient-to-r from-amber-600 via-amber-500 to-emerald-600 bg-clip-text text-transparent">
            Premium Üyeliğe Yükseltin
          </h2>
          <p className="text-xs text-[var(--on-surface-variant)] mt-1 font-medium max-w-xs mx-auto">
            Günlük reklam izleme limitine ulaştınız. Sınırsız soru-cevap ve ayrıcalıklar için Premium üye olun!
          </p>
        </div>

        {/* Avantajlar */}
        <div className="space-y-2.5 bg-[var(--surface-container-low)] p-4 rounded-2xl border border-[var(--outline-variant)]/60 mb-6 text-xs font-semibold text-[var(--on-surface)]">
          <div className="flex items-center gap-2.5">
            <span className="text-emerald-500 font-bold text-sm">✓</span>
            <span><strong>Sınırsız Soru & Cevap:</strong> Kredi derdi olmadan dilediğiniz kadar soru sorun ve cevap yazın.</span>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="text-emerald-500 font-bold text-sm">✓</span>
            <span><strong>%100 Reklamsız Deneyim:</strong> Hiçbir reklam beklemeden doğrudan platformu kullanın.</span>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="text-emerald-500 font-bold text-sm">✓</span>
            <span><strong>Öncelikli Cevaplar:</strong> Sorularınız uzman danışmanlarımıza öncelikli olarak iletilir.</span>
          </div>
        </div>

        {/* Yönlendirme Butonu */}
        <div className="space-y-3">
          <Link
            href="/premium"
            onClick={onClose}
            className="w-full bg-gradient-to-r from-amber-500 to-emerald-600 hover:from-amber-600 hover:to-emerald-700 text-white font-extrabold py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all text-sm"
          >
            <span>👑 Premium Paketleri İncele</span>
          </Link>

          <button
            onClick={onClose}
            className="w-full bg-transparent hover:bg-[var(--surface-variant)] text-[var(--on-surface-variant)] font-bold py-2 text-xs rounded-xl transition-all"
          >
            Kapat
          </button>
        </div>

      </div>
    </div>
  );
}
