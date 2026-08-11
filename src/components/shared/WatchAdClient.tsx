"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function WatchAdClient({ ads, dailyLimitReached }: { ads: any[], dailyLimitReached: boolean }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rewardClaimed, setRewardClaimed] = useState(false);
  const [message, setMessage] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const router = useRouter();

  const ad = ads && ads.length > 0 ? ads[currentIndex % ads.length] : null;

  const loadNextAd = () => {
    setIsPlaying(false);
    setIsCompleted(false);
    setRewardClaimed(false);
    setMessage("");
    if (ads && ads.length > 0) {
      setCurrentIndex((prev) => (prev + 1) % ads.length);
    }
    router.refresh();
  };

  if (dailyLimitReached) {
    return (
      <div className="card p-8 text-center">
        <div className="text-4xl mb-4">🛑</div>
        <h2 className="text-xl font-bold mb-2">Günlük Limite Ulaştınız</h2>
        <p className="text-[var(--on-surface-variant)]">Bugünlük izleyebileceğiniz maksimum reklam sayısına ulaştınız. Yarın tekrar gelerek kredi kazanabilirsiniz.</p>
      </div>
    );
  }

  if (!ad) {
    if (ads && ads.length > 0) {
      return <div className="card p-8 text-center"><p>Yükleniyor...</p></div>;
    }
    
    return (
      <div className="card p-8 text-center">
        <div className="text-4xl mb-4">📺</div>
        <h2 className="text-xl font-bold mb-2">Şu an gösterilecek reklam yok</h2>
        <p className="text-[var(--on-surface-variant)]">Daha sonra tekrar kontrol edin.</p>
      </div>
    );
  }

  const mediaUrl = ad.imageUrl || ad.videoUrl || "";
  const isVideo = Boolean(mediaUrl && (mediaUrl.match(/\.(mp4|webm|ogg)$/i) || mediaUrl.includes("video")));

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
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("/api/ads/reward", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adId: ad.id })
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(data.message);
        setRewardClaimed(true);
        router.refresh();
      } else {
        setMessage(`Hata: ${data.error}`);
      }
    } catch (err) {
      setMessage("Sunucu bağlantı hatası");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card overflow-hidden">
      <div className="p-4 bg-[var(--surface-variant)] border-b border-[var(--outline-variant)] flex justify-between items-center">
        <div>
          <h2 className="font-bold">{ad.title}</h2>
          <p className="text-sm text-[var(--on-surface-variant)]">Bu reklamı izleyerek +{ad.creditReward} Kredi kazanın</p>
        </div>
      </div>
      
      <div className="relative bg-black w-full aspect-video flex items-center justify-center">
        {!isPlaying && !rewardClaimed ? (
          <button 
            onClick={handleStart}
            className="absolute z-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-full w-20 h-20 flex items-center justify-center transition-all"
          >
            <div className="w-0 h-0 border-t-[12px] border-t-transparent border-l-[20px] border-l-white border-b-[12px] border-b-transparent ml-2" />
          </button>
        ) : null}

        {isVideo ? (
          <video 
            ref={videoRef}
            src={mediaUrl} 
            onEnded={handleVideoEnded}
            className={`w-full h-full object-contain ${!isPlaying || rewardClaimed ? 'opacity-50' : 'opacity-100'}`}
            controls={false}
            playsInline
          />
        ) : (
          <div className="w-full h-full">
            <img 
              src={mediaUrl} 
              alt={ad.title} 
              className={`w-full h-full object-contain ${!isPlaying || rewardClaimed ? 'opacity-50' : 'opacity-100'}`} 
            />
            {isPlaying && !isCompleted && !rewardClaimed && (
              <div className="absolute top-4 right-4 bg-black/60 text-white px-3 py-1 rounded text-sm">
                Lütfen bekleyin...
              </div>
            )}
          </div>
        )}
      </div>

      <div className="p-6 text-center">
        {message ? (
          <div className={`p-4 rounded-md font-bold mb-4 ${message.includes('Hata') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            {message}
          </div>
        ) : null}

        {!rewardClaimed ? (
          <button 
            onClick={claimReward}
            disabled={!isCompleted || loading}
            className="btn btn-primary px-8 py-3 text-lg font-bold disabled:opacity-50"
          >
            {loading ? "Bekleyiniz..." : isCompleted ? "🎉 Ödülü Al" : "Ödülü Alabilmek İçin Reklamı İzleyin"}
          </button>
        ) : (
          <button 
            onClick={loadNextAd}
            className="btn bg-[var(--primary)] text-[var(--on-primary)] hover:opacity-90 px-8 py-3 text-lg font-bold flex items-center justify-center gap-2 mx-auto"
          >
            ▶️ Sonraki Reklamı İzle
          </button>
        )}
      </div>
    </div>
  );
}
