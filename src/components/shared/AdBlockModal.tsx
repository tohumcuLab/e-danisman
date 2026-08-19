"use client";

import { ShieldAlert, RefreshCw, X } from "lucide-react";

interface AdBlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRetry?: () => void;
}

export default function AdBlockModal({ isOpen, onClose, onRetry }: AdBlockModalProps) {
  if (!isOpen) return null;

  const handleRefresh = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div 
        className="bg-[var(--surface)] text-[var(--on-surface)] rounded-2xl border-2 border-amber-500/50 shadow-2xl max-w-md w-full p-6 relative animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Kapat Butonu */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[var(--on-surface-variant)] hover:text-[var(--on-surface)] p-1 rounded-lg hover:bg-[var(--surface-container-high)] transition-colors"
          title="Kapat"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-4">
          {/* İkon */}
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border-2 border-amber-500/30 flex items-center justify-center mx-auto text-amber-600 dark:text-amber-400">
            <ShieldAlert className="w-9 h-9 animate-pulse" />
          </div>

          {/* Başlık ve Açıklama */}
          <div>
            <h3 className="font-extrabold text-lg sm:text-xl text-[var(--on-surface)]">
              Reklam Engelleyici (AdBlock) Algılandı
            </h3>
            <p className="text-xs sm:text-sm text-[var(--on-surface-variant)] mt-2 leading-relaxed font-medium">
              Kredi kazanabilmeniz için reklam içeriğinin başarıyla görüntülenmesi gerekmektedir. 
              Tarayıcınızda aktif olan reklam engelleyici (AdBlock, uBlock, Brave Kalkanı vb.) reklamın yüklenmesini engelledi.
            </p>
          </div>

          {/* Adım Adım Rehber */}
          <div className="bg-amber-500/10 dark:bg-amber-950/20 border border-amber-500/20 rounded-xl p-3.5 text-left text-xs text-amber-950 dark:text-amber-200 space-y-2">
            <p className="font-bold flex items-center gap-1.5 text-amber-800 dark:text-amber-300">
              <span>💡</span>
              <span>Nasıl Devam Edebilirsiniz?</span>
            </p>
            <ol className="list-decimal list-inside space-y-1 opacity-90 pl-1 font-medium">
              <li>Tarayıcınızın eklenti simgesinden reklam engelleyiciyi açın.</li>
              <li><strong>Bu site için</strong> korumayı devre dışı bırakın (kapatın).</li>
              <li>Aşağıdaki <strong>Yeniden Dene</strong> butonuna tıklayın.</li>
            </ol>
          </div>

          {/* Butonlar */}
          <div className="space-y-2 pt-1">
            <button
              onClick={handleRefresh}
              className="w-full btn bg-amber-500 hover:bg-amber-600 text-white font-extrabold py-3 px-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 text-xs sm:text-sm cursor-pointer hover:scale-[1.02]"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reklam Engelleyiciyi Kapattım, Yeniden Dene</span>
            </button>
            <button
              onClick={onClose}
              className="w-full btn bg-[var(--surface-container-high)] hover:bg-[var(--surface-container-highest)] text-[var(--on-surface-variant)] font-bold py-2.5 px-4 rounded-xl transition-colors text-xs cursor-pointer"
            >
              Anladım, Kapat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
