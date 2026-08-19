import { useState, useEffect, useRef } from "react";
import { sortAndShuffleAds } from "@/lib/adUtils";
import GoogleAdSenseUnit from "@/components/shared/GoogleAdSenseUnit";
import AdBlockModal from "@/components/shared/AdBlockModal";
import { detectAdBlock } from "@/lib/adblockDetector";

type InsufficientCreditsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  currentCredits: number;
  onCreditUpdated: (newCredits: number) => void;
  onReadyToSubmit?: () => void;
  onOpenPremium?: () => void;
};

export default function InsufficientCreditsModal({
  isOpen,
  onClose,
  currentCredits,
  onCreditUpdated,
  onReadyToSubmit,
  onOpenPremium,
}: InsufficientCreditsModalProps) {
  const [ad, setAd] = useState<any>(null);
  const [adsList, setAdsList] = useState<any[]>([]);
  const [adIndex, setAdIndex] = useState(0);
  const [loadingAd, setLoadingAd] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [claiming, setClaiming] = useState(false);
  const [message, setMessage] = useState("");
  const [dailyLimitReached, setDailyLimitReached] = useState(false);
  const [showAdBlockModal, setShowAdBlockModal] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);
  const googleContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => {
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchAd();
    } else {
      resetState();
      setAdsList([]);
      setAdIndex(0);
    }
  }, [isOpen]);

  const resetState = () => {
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    setIsPlaying(false);
    setIsCompleted(false);
    setCountdown(5);
    setMessage("");
  };

  const isGoogle = Boolean(ad && (ad.type === "GOOGLE" || Boolean(ad.networkCode?.trim())));

  // Google AdSense veya özel HTML / Script kodlarını dinamik çalıştır
  useEffect(() => {
    if (!ad || !ad.networkCode || !googleContainerRef.current) return;
    if (!isGoogle) return;

    const scripts = googleContainerRef.current.querySelectorAll("script");
    scripts.forEach((oldScript) => {
      const newScript = document.createElement("script");
      Array.from(oldScript.attributes).forEach((attr) => {
        newScript.setAttribute(attr.name, attr.value);
      });
      newScript.textContent = oldScript.textContent;
      oldScript.parentNode?.replaceChild(newScript, oldScript);
    });

    try {
      if (typeof window !== "undefined" && (window as any).adsbygoogle) {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      }
    } catch (e) {}
  }, [ad, isGoogle, isPlaying]);

  const fetchAd = async () => {
    setLoadingAd(true);
    try {
      const res = await fetch("/api/ads/active-reward");
      if (res.ok) {
        const data = await res.json();
        const rawAds = data.ads || (data.ad ? [data.ad] : []);
        const sorted = sortAndShuffleAds(rawAds);
        setAdsList(sorted);
        setAdIndex(0);
        setAd(sorted[0] || null);
        setDailyLimitReached(data.dailyLimitReached || false);
      }
    } catch (err) {
      console.error("Reklam çekme hatası:", err);
    } finally {
      setLoadingAd(false);
    }
  };

  const loadNextModalAd = () => {
    resetState();
    if (adsList.length > 0) {
      const nextIndex = (adIndex + 1) % adsList.length;
      setAdIndex(nextIndex);
      setAd(adsList[nextIndex]);
    } else {
      fetchAd();
    }
  };

  if (!isOpen) return null;

  const mediaUrl = ad?.imageUrl || ad?.videoUrl || "";
  const isVideo = Boolean(mediaUrl && (mediaUrl.match(/\.(mp4|webm|ogg)$/i) || mediaUrl.includes("video")));
  const targetUrl = ad?.destinationUrl ? `/api/ads/${ad.id}/click` : null;

  const handleStart = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (isPlaying || isCompleted) return;

    // 1. Reklam Engelleyici Kontrolü
    const isBlocked = await detectAdBlock();
    if (isBlocked) {
      setShowAdBlockModal(true);
      setMessage("⚠️ Reklam engelleyici tespit edildi. Kredi kazanmak için lütfen kapatın.");
      return;
    }

    setIsPlaying(true);
    setCountdown(5);
    setIsCompleted(false);

    if (isVideo && videoRef.current) {
      videoRef.current.play().catch(() => {});
    }

    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);

    let timeLeft = 5;
    countdownTimerRef.current = setInterval(async () => {
      timeLeft -= 1;
      setCountdown(timeLeft);

      if (timeLeft === 2) {
        const reCheckBlocked = await detectAdBlock();
        if (reCheckBlocked) {
          if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
          setIsPlaying(false);
          setIsCompleted(false);
          setShowAdBlockModal(true);
          setMessage("⚠️ Reklam engelleyici algılandı. Görüntüleme başarısız.");
          return;
        }
      }

      if (timeLeft <= 0) {
        if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
        
        const finalBlocked = await detectAdBlock();
        if (finalBlocked) {
          setIsPlaying(false);
          setIsCompleted(false);
          setShowAdBlockModal(true);
          setMessage("⚠️ Reklam yüklenemedi. Lütfen reklam engelleyicinizi kapatın.");
          return;
        }

        setIsCompleted(true);
      }
    }, 1000);
  };

  const handleMediaClick = () => {
    if (targetUrl) {
      window.open(targetUrl, "_blank", "noopener,noreferrer");
    }
  };

  const handleVideoEnded = () => {
    if (countdown <= 0) {
      setIsCompleted(true);
    }
  };

  const claimReward = async () => {
    if (!ad) return;

    const isBlocked = await detectAdBlock();
    if (isBlocked) {
      setIsCompleted(false);
      setShowAdBlockModal(true);
      setMessage("⚠️ Reklam engelleyici aktif olduğu için kredi kazanılamadı.");
      return;
    }

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
        // Bir sonraki reklama geç
        setTimeout(() => {
          loadNextModalAd();
        }, 1200);
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
            İşlemi tamamlayabilmek için en az <strong>4 Krediye</strong> ihtiyacınız var.
          </p>
          <div className="mt-3 inline-flex items-center gap-2 bg-[var(--surface-variant)] px-4 py-2 rounded-full font-semibold text-sm">
            <span>Mevcut Bakiyeniz:</span>
            <span className="text-[var(--primary)] font-bold text-base">{currentCredits} 🪙</span>
          </div>
        </div>

        {hasEnoughCredits ? (
          <div className="bg-green-100 text-green-800 p-4 rounded-md text-center my-4 space-y-3">
            <p className="font-bold text-lg">🎉 Tebrikler! Yeterli krediye ulaştınız!</p>
            <p className="text-sm">Artık işleminizi gerçekleştirebilirsiniz.</p>
            <button
              onClick={() => {
                onClose();
                if (onReadyToSubmit) onReadyToSubmit();
              }}
              className="btn btn-primary w-full py-3 text-lg font-bold"
            >
              Şimdi Gönder (-4 Kredi)
            </button>
          </div>
        ) : (
          <div className="border-t border-[var(--outline-variant)] pt-4 mt-4">
            <h3 className="font-bold text-center mb-2 flex items-center justify-center gap-2 text-yellow-600 dark:text-yellow-400">
              🎬 Reklam İzle & Kredi Kazan
            </h3>

            {dailyLimitReached ? (
              <div className="bg-amber-50 dark:bg-amber-950/50 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700/60 p-4 rounded-2xl text-center text-xs space-y-3 shadow-sm">
                <p className="font-bold text-sm">🛑 Bugünkü reklam izleme limitinize ulaştınız.</p>
                <p className="text-amber-800 dark:text-amber-300">
                  Beklemeden devam etmek için Premium üye olabilir veya yarın tekrar deneyebilirsiniz.
                </p>
                <button
                  onClick={() => {
                    onClose();
                    if (onOpenPremium) onOpenPremium();
                  }}
                  className="w-full bg-gradient-to-r from-amber-500 to-emerald-600 hover:from-amber-600 hover:to-emerald-700 text-white font-extrabold py-3 px-4 rounded-xl shadow-md transition-all text-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>👑 Premium Üye Ol (Sınırsız Kredi)</span>
                </button>
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
                <div className="text-xs text-center text-[var(--on-surface-variant)] flex items-center justify-between gap-2">
                  <span>İzlenecek Reklam: <strong>{ad.title}</strong> (+{ad.creditReward} Kredi)</span>
                  {targetUrl && (
                    <a
                      href={targetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn bg-[var(--secondary)] text-white text-[11px] px-2.5 py-1 rounded-md font-bold hover:opacity-90 transition-all shrink-0 flex items-center gap-1"
                    >
                      İncele ➔
                    </a>
                  )}
                </div>

                <div 
                  onClick={targetUrl ? handleMediaClick : undefined}
                  className={`relative bg-neutral-900 rounded-xl overflow-hidden w-full min-h-[220px] flex items-center justify-center ${targetUrl ? "cursor-pointer group/media" : ""}`}
                >
                  {/* Geri Sayım & Durum Rozeti */}
                  {isPlaying && (
                    <div className="absolute top-2 right-2 z-30">
                      {countdown > 0 ? (
                        <span className="bg-amber-500 text-white font-extrabold text-[11px] px-2.5 py-1 rounded-full shadow flex items-center gap-1 animate-pulse">
                          <span>⏳</span>
                          <span>{countdown} sn</span>
                        </span>
                      ) : (
                        <span className="bg-emerald-600 text-white font-extrabold text-[11px] px-2.5 py-1 rounded-full shadow flex items-center gap-1">
                          <span>✅</span>
                          <span>Tamamlandı!</span>
                        </span>
                      )}
                    </div>
                  )}

                  {/* İlerleme Çubuğu */}
                  {isPlaying && (
                    <div className="absolute top-0 left-0 w-full h-1 bg-white/20 z-30 overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 transition-all duration-1000 ease-linear"
                        style={{ width: `${Math.min(100, ((5 - countdown) / 5) * 100)}%` }}
                      />
                    </div>
                  )}

                  {!isPlaying && (
                    <div className="absolute inset-0 z-20 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center p-4 text-center text-white space-y-2">
                      <button
                        onClick={handleStart}
                        type="button"
                        className="bg-[var(--primary)] hover:bg-[var(--primary-container)] text-white rounded-full w-14 h-14 flex items-center justify-center transition-all shadow-xl hover:scale-110 cursor-pointer"
                      >
                        <div className="w-0 h-0 border-t-[10px] border-t-transparent border-l-[16px] border-l-white border-b-[10px] border-b-transparent ml-1" />
                      </button>
                      <span className="font-bold text-xs">Reklamı Başlat (+{ad.creditReward || 1} Kredi)</span>
                    </div>
                  )}

                  {isGoogle ? (
                    <div className="w-full h-full min-h-[200px] flex items-center justify-center p-3 bg-white/5">
                      {ad.networkCode?.match(/data-ad-slot=["'](\d+)["']/) ? (
                        <GoogleAdSenseUnit
                          client={ad.networkCode.match(/data-ad-client=["'](ca-pub-[\d]+)["']/)?.[1]}
                          slot={ad.networkCode.match(/data-ad-slot=["'](\d+)["']/)?.[1] || ""}
                          format={ad.networkCode.match(/data-ad-format=["']([^"']+)["']/)?.[1] || "auto"}
                          className="w-full max-w-full my-auto"
                        />
                      ) : (
                        <div
                          ref={googleContainerRef}
                          className="w-full overflow-hidden flex justify-center items-center my-auto"
                          dangerouslySetInnerHTML={{ __html: ad.networkCode || "" }}
                        />
                      )}
                    </div>
                  ) : isVideo ? (
                    <video
                      ref={videoRef}
                      src={mediaUrl}
                      onEnded={handleVideoEnded}
                      className={`w-full h-full max-h-[280px] object-contain ${!isPlaying ? "opacity-50" : "opacity-100"}`}
                      controls={false}
                      playsInline
                    />
                  ) : (
                    <div className="w-full h-full min-h-[180px] flex items-center justify-center">
                      {mediaUrl ? (
                        <img
                          src={mediaUrl}
                          alt={ad.title}
                          className={`w-full max-h-[280px] object-contain ${!isPlaying ? "opacity-50" : "opacity-100"} ${targetUrl ? "group-hover/media:scale-105 transition-transform duration-500" : ""}`}
                        />
                      ) : (
                        <div className="text-white/60 text-xs p-4 text-center">
                          📢 {ad.title}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {message && (
                  <div
                    className={`p-3 rounded-xl text-xs text-center font-bold ${
                      message.includes("Hata") ? "bg-red-500/10 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-800" : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800"
                    }`}
                  >
                    {message}
                  </div>
                )}

                <button
                  onClick={claimReward}
                  disabled={!isCompleted || claiming}
                  className={`btn w-full py-3 font-extrabold text-sm rounded-xl transition-all cursor-pointer ${
                    isCompleted
                      ? "btn-primary ring-4 ring-[var(--primary)]/30 animate-bounce"
                      : isPlaying
                      ? "bg-amber-500 text-white cursor-not-allowed opacity-90"
                      : "btn-primary opacity-60"
                  }`}
                >
                  {claiming
                    ? "Kredi Ekleniyor..."
                    : isCompleted
                    ? `🎉 +${ad.creditReward || 1} Krediyi Al`
                    : isPlaying
                    ? `⏳ Reklam İzleniyor (${countdown} sn)...`
                    : "▶️ Reklamı Başlat & İzle (5 sn)"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Reklam Engelleyici Uyarı Pop-up Modalı */}
      <AdBlockModal
        isOpen={showAdBlockModal}
        onClose={() => setShowAdBlockModal(false)}
        onRetry={async () => {
          setShowAdBlockModal(false);
          const isStillBlocked = await detectAdBlock();
          if (isStillBlocked) {
            setTimeout(() => setShowAdBlockModal(true), 300);
          } else {
            handleStart();
          }
        }}
      />
    </div>
  );
}
