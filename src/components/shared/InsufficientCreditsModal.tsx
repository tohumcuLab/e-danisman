"use client";

import { useState, useEffect, useRef } from "react";

type InsufficientCreditsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  currentCredits: number;
  onCreditUpdated: (newCredits: number) => void;
  onReadyToSubmit?: () => void;
};

export default function InsufficientCreditsModal({
  isOpen,
  onClose,
  currentCredits,
  onCreditUpdated,
  onReadyToSubmit,
}: InsufficientCreditsModalProps) {
  const [ad, setAd] = useState<any>(null);
  const [loadingAd, setLoadingAd] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [message, setMessage] = useState("");
  const [dailyLimitReached, setDailyLimitReached] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (isOpen) {
      fetchAd();
    } else {
      resetState();
    }
  }, [isOpen]);

  const resetState = () => {
    setIsPlaying(false);
    setIsCompleted(false);
    setMessage("");
  };

  const fetchAd = async () => {
    setLoadingAd(true);
    try {
      const res = await fetch("/api/ads/active-reward");
      if (res.ok) {
        const data = await res.json();
        setAd(data.ad);
        setDailyLimitReached(data.dailyLimitReached || false);
      }
    } catch (err) {
      console.error("Reklam çekme hatası:", err);
    } finally {
      setLoadingAd(false);
    }
  };

  if (!isOpen) return null;

  const isVideo = ad?.videoUrl && !ad.videoUrl.match(/\.(jpeg|jpg|gif|png)$/i);

  const handleStart = () => {
    setIsPlaying(true);
    if (isVideo && videoRef.current) {
      videoRef.current.play();
    } else {
      setTimeout(() => {
        setIsCompleted(true);
      }, 5000);
    }
  };

  const handleVideoEnded = () => {
    setIsCompleted(true);
  };

  const claimReward = async () => {
    if (!ad) return;
    setClaiming(true);
    setMessage("");
    try {
      const res = await fetch("/api/ads/reward", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adId: ad.id }),
      });
      const data = await res.json();

      if (res.ok) {
        setMessage(data.message || "Kredi başarıyla eklendi!");
        // Kullanıcının güncel kredisini çek ve güncelle
        const userRes = await fetch("/api/user/me");
        if (userRes.ok) {
          const userData = await userRes.json();
          const newCredits = userData.user.credits;
          onCreditUpdated(newCredits);
        }
        resetState();
        // Bir sonraki reklamı yükle
        fetchAd();
      } else {
        setMessage(`Hata: ${data.error}`);
      }
    } catch (err) {
      setMessage("Sunucu hatası oluştu.");
    } finally {
      setClaiming(false);
    }
  };

  const hasEnoughCredits = currentCredits >= 4;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="card max-w-lg w-full p-6 relative animate-in fade-in zoom-in duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[var(--on-surface-variant)] hover:text-[var(--on-surface)] text-xl font-bold"
        >
          ✕
        </button>

        <div className="text-center mb-4">
          <div className="text-4xl mb-2">🪙</div>
          <h2 className="text-2xl font-bold text-[var(--primary)]">Yetersiz Kredi Bakiye Uyarısı</h2>
          <p className="text-sm text-[var(--on-surface-variant)] mt-1">
            Soru sorabilmek için en az <strong>4 Krediye</strong> ihtiyacınız var.
          </p>
          <div className="mt-3 inline-flex items-center gap-2 bg-[var(--surface-variant)] px-4 py-2 rounded-full font-semibold text-sm">
            <span>Mevcut Bakiyeniz:</span>
            <span className="text-[var(--primary)] font-bold text-base">{currentCredits} 🪙</span>
          </div>
        </div>

        {hasEnoughCredits ? (
          <div className="bg-green-100 text-green-800 p-4 rounded-md text-center my-4 space-y-3">
            <p className="font-bold text-lg">🎉 Tebrikler! Yeterli krediye ulaştınız!</p>
            <p className="text-sm">Artık sorunuzu gönderebilirsiniz.</p>
            <button
              onClick={() => {
                onClose();
                if (onReadyToSubmit) onReadyToSubmit();
              }}
              className="btn btn-primary w-full py-3 text-lg font-bold"
            >
              Soruyu Şimdi Gönder (-4 Kredi)
            </button>
          </div>
        ) : (
          <div className="border-t border-[var(--outline-variant)] pt-4 mt-4">
            <h3 className="font-bold text-center mb-2 flex items-center justify-center gap-2 text-yellow-600 dark:text-yellow-400">
              🎬 Reklam İzle & Kredi Kazan
            </h3>

            {dailyLimitReached ? (
              <div className="bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 p-4 rounded-md text-center text-sm">
                🛑 Bugünkü reklam izleme limitinize ulaştınız. Yarın tekrar deneyebilirsiniz.
              </div>
            ) : loadingAd ? (
              <div className="text-center py-8 text-[var(--on-surface-variant)] text-sm">
                Reklam yükleniyor...
              </div>
            ) : !ad ? (
              <div className="text-center py-6 text-sm text-[var(--on-surface-variant)]">
                Şu an gösterilecek aktif reklam bulunmuyor.
              </div>
            ) : (
              <div className="space-y-3">
                <div className="text-xs text-center text-[var(--on-surface-variant)]">
                  İzlenecek Reklam: <strong>{ad.title}</strong> (+{ad.creditReward} Kredi)
                </div>

                <div className="relative bg-black rounded-lg overflow-hidden w-full aspect-video flex items-center justify-center">
                  {!isPlaying && (
                    <button
                      onClick={handleStart}
                      className="absolute z-10 bg-white/30 hover:bg-white/40 text-white rounded-full p-4 transition-all"
                    >
                      ▶️ Reklamı Başlat
                    </button>
                  )}

                  {isVideo ? (
                    <video
                      ref={videoRef}
                      src={ad.videoUrl}
                      onEnded={handleVideoEnded}
                      className={`w-full h-full object-contain ${!isPlaying ? "opacity-50" : "opacity-100"}`}
                      controls={false}
                      playsInline
                    />
                  ) : (
                    <div className="w-full h-full">
                      <img
                        src={ad.videoUrl}
                        alt={ad.title}
                        className={`w-full h-full object-contain ${!isPlaying ? "opacity-50" : "opacity-100"}`}
                      />
                      {isPlaying && !isCompleted && (
                        <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                          Lütfen bekleyin...
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {message && (
                  <div
                    className={`p-3 rounded text-sm text-center font-bold ${
                      message.includes("Hata") ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                    }`}
                  >
                    {message}
                  </div>
                )}

                <button
                  onClick={claimReward}
                  disabled={!isCompleted || claiming}
                  className="btn btn-primary w-full py-2 font-bold disabled:opacity-50 text-sm"
                >
                  {claiming
                    ? "Kredi Ekleniyor..."
                    : isCompleted
                    ? `🎉 +${ad.creditReward} Krediyi Al`
                    : "Ödülü Almak İçin Reklamı İzleyin"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
