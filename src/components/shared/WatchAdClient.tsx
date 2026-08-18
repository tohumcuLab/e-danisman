"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { sortAndShuffleAds } from "@/lib/adUtils";
import { Sparkles, Gift, Lock, UserPlus, CheckCircle2, ArrowRight } from "lucide-react";

interface WatchAdClientProps {
  ads: any[];
  dailyLimitReached: boolean;
  isLoggedIn?: boolean;
  user?: any | null;
}

export default function WatchAdClient({
  ads,
  dailyLimitReached,
  isLoggedIn = false,
  user = null,
}: WatchAdClientProps) {
  const [rotationAds, setRotationAds] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rewardClaimed, setRewardClaimed] = useState(false);
  const [message, setMessage] = useState("");
  
  // Misafir Kredi ve İzlenen Reklam Sayacı State'i
  const [guestCredits, setGuestCredits] = useState<number>(0);
  const [guestWatchedCount, setGuestWatchedCount] = useState<number>(0);
  const [currentUser, setCurrentUser] = useState<any | null>(user);
  const [authTab, setAuthTab] = useState<"LOGIN" | "REGISTER">("LOGIN");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");

  // Hızlı Giriş Formu State
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Hızlı Kayıt Formu State
  const [regFirstName, setRegFirstName] = useState("");
  const [regLastName, setRegLastName] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");

  const videoRef = useRef<HTMLVideoElement>(null);
  const router = useRouter();

  // İlk yüklemede localStorage'daki misafir kredilerini ve izleme sayısını oku
  useEffect(() => {
    try {
      const savedCredits = localStorage.getItem("guest_pending_credits");
      if (savedCredits) {
        const val = parseInt(savedCredits, 10);
        if (!isNaN(val) && val > 0) {
          setGuestCredits(val);
        }
      }

      const savedCount = localStorage.getItem("guest_rewarded_ad_count");
      if (savedCount) {
        const count = parseInt(savedCount, 10);
        if (!isNaN(count)) {
          setGuestWatchedCount(count);
        }
      }
    } catch (e) {
      // ignore
    }
  }, []);

  // Eğer kullanıcı zaten giriş yapmışsa ve localStorage'da bekleyen misafir kredisi varsa otomatik aktar
  useEffect(() => {
    if (isLoggedIn && user?.id) {
      setCurrentUser(user);
      const pending = localStorage.getItem("guest_pending_credits");
      if (pending && parseInt(pending, 10) > 0) {
        claimGuestCreditsToServer(parseInt(pending, 10));
      }
    }
  }, [isLoggedIn, user]);

  useEffect(() => {
    if (ads && ads.length > 0) {
      setRotationAds((prev) => {
        if (
          prev.length === ads.length &&
          prev.every((p) => ads.some((a) => a.id === p.id))
        ) {
          return prev;
        }
        return sortAndShuffleAds(ads);
      });
    } else {
      setRotationAds([]);
    }
  }, [ads]);

  const ad = rotationAds.length > 0 ? rotationAds[currentIndex % rotationAds.length] : null;

  const loadNextAd = () => {
    setIsPlaying(false);
    setIsCompleted(false);
    setRewardClaimed(false);
    setMessage("");
    if (rotationAds.length > 0) {
      setCurrentIndex((prev) => (prev + 1) % rotationAds.length);
    }
    router.refresh();
  };

  // Sunucuya misafir kredilerini aktarma fonksiyonu
  const claimGuestCreditsToServer = async (amountToClaim: number) => {
    try {
      const res = await fetch("/api/ads/claim-guest-rewards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credits: amountToClaim }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        localStorage.removeItem("guest_pending_credits");
        localStorage.removeItem("guest_rewarded_ad_count");
        setGuestCredits(0);
        setGuestWatchedCount(0);
        setMessage(data.message || `🎉 ${amountToClaim} kredi hesabınıza aktarıldı.`);
        window.dispatchEvent(new CustomEvent("user:credits-updated"));
        router.refresh();
      }
    } catch (err) {
      console.error("Misafir kredisi aktarılamadı:", err);
    }
  };

  const handleStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPlaying(true);
    if (isVideo && videoRef.current) {
      videoRef.current.play();
    } else {
      setTimeout(() => {
        setIsCompleted(true);
      }, 5000);
    }
  };

  const handleMediaClick = () => {
    if (targetUrl) {
      window.open(targetUrl, "_blank", "noopener,noreferrer");
    }
  };

  const handleVideoEnded = () => {
    setIsCompleted(true);
  };

  // Ödül Talep Etme (Misafir için ilk 2 reklam kuralı)
  const claimReward = async () => {
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("/api/ads/reward", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adId: ad.id }),
      });
      const data = await res.json();

      if (res.ok) {
        const rewardAmount = data.reward || 1;

        if (data.isGuest || !currentUser) {
          // Misafir kullanıcı kontrolü: İlk 2 reklam için ödül kazanabilir
          if (guestWatchedCount < 2) {
            const newCount = guestWatchedCount + 1;
            const newTotal = guestCredits + rewardAmount;
            
            setGuestWatchedCount(newCount);
            setGuestCredits(newTotal);

            try {
              localStorage.setItem("guest_rewarded_ad_count", newCount.toString());
              localStorage.setItem("guest_pending_credits", newTotal.toString());
            } catch (e) {}

            setMessage(`🎉 Tebrikler! +${rewardAmount} Kredi kazandınız. (Misafir Ödülü: ${newCount}/2)`);
          } else {
            // 2 reklam hakkı dolmuş: Kredi verilmez, bilgilendirme yapılır
            setMessage(
              "ℹ️ Misafir olarak ilk 2 reklamlık kredi kazanma limitinizi tamamladınız. Dilediğiniz kadar reklam izleyebilirsiniz; ancak sonraki izlemelerden kredi kazanmak için lütfen aşağıdan giriş yapın veya üye olun."
            );
          }
        } else {
          // Giriş yapmış kullanıcı
          setMessage(data.message || `🎉 Tebrikler! ${rewardAmount} kredi hesabınıza yüklendi.`);
          window.dispatchEvent(new CustomEvent("user:credits-updated"));
        }

        setRewardClaimed(true);
        router.refresh();
      } else {
        setMessage(`Hata: ${data.error || "Ödül alınamadı."}`);
      }
    } catch (err) {
      setMessage("Sunucu bağlantı hatası.");
    } finally {
      setLoading(false);
    }
  };

  // Sayfadan ayrılmadan Hızlı Giriş Yap
  const handleQuickLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError("");

    try {
      const verifyRes = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });

      const verifyData = await verifyRes.json();
      if (!verifyRes.ok) {
        setAuthError(verifyData.error || "Geçersiz e-posta veya şifre.");
        setAuthLoading(false);
        return;
      }

      const res = await signIn("credentials", {
        redirect: false,
        email: loginEmail,
        password: loginPassword,
      });

      if (res?.error) {
        setAuthError("Giriş yapılamadı. Bilgilerinizi kontrol ediniz.");
      } else {
        // Oturum açıldı, bekleyen misafir kredisi varsa hemen yükle
        const pending = guestCredits;
        if (pending > 0) {
          await claimGuestCreditsToServer(pending);
        }
        window.location.reload();
      }
    } catch (err: any) {
      setAuthError("Giriş sırasında bağlantı hatası oluştu.");
    } finally {
      setAuthLoading(false);
    }
  };

  // Sayfadan ayrılmadan Hızlı Kayıt Ol
  const handleQuickRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError("");

    if (!regFirstName.trim() || !regLastName.trim()) {
      setAuthError("Lütfen ad ve soyadınızı giriniz.");
      setAuthLoading(false);
      return;
    }

    const cleanPhone = regPhone.replace(/\D/g, "");
    if (!cleanPhone || (cleanPhone.length !== 10 && cleanPhone.length !== 11)) {
      setAuthError("Lütfen geçerli bir telefon numarası giriniz.");
      setAuthLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: regFirstName.trim(),
          lastName: regLastName.trim(),
          email: regEmail.trim(),
          phone: regPhone.trim(),
          password: regPassword,
          agreedTerms: true,
        }),
      });

      if (res.ok) {
        // Otomatik giriş
        await signIn("credentials", {
          redirect: false,
          email: regEmail,
          password: regPassword,
        });

        // Bekleyen kredileri aktar
        const pending = guestCredits;
        if (pending > 0) {
          await claimGuestCreditsToServer(pending);
        }
        window.location.reload();
      } else {
        const data = await res.json();
        setAuthError(data.error || "Kayıt sırasında bir hata oluştu.");
      }
    } catch (err) {
      setAuthError("Bağlantı hatası. Lütfen tekrar deneyin.");
    } finally {
      setAuthLoading(false);
    }
  };

  if (dailyLimitReached) {
    return (
      <div className="card p-8 text-center space-y-3">
        <div className="text-5xl">🛑</div>
        <h2 className="text-xl font-bold text-[var(--on-surface)]">Günlük Limite Ulaştınız</h2>
        <p className="text-sm text-[var(--on-surface-variant)] leading-relaxed max-w-md mx-auto">
          Bugünlük izleyebileceğiniz maksimum reklam sayısına ulaştınız. Yarın tekrar gelerek kredi kazanabilir veya dilerseniz Premium üyelik ile sınırsız soru sorabilirsiniz.
        </p>
        <div className="pt-2">
          <Link href="/premium" className="btn bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow">
            👑 Premium Paketleri İncele
          </Link>
        </div>
      </div>
    );
  }

  if (!ad) {
    if (ads && ads.length > 0) {
      return (
        <div className="card p-8 text-center">
          <p className="text-sm text-[var(--on-surface-variant)]">Reklamlar yükleniyor...</p>
        </div>
      );
    }

    return (
      <div className="card p-8 text-center space-y-3">
        <div className="text-5xl">📺</div>
        <h2 className="text-xl font-bold text-[var(--on-surface)]">Şu an gösterilecek reklam bulunamadı</h2>
        <p className="text-sm text-[var(--on-surface-variant)]">Lütfen daha sonra tekrar kontrol ediniz.</p>
      </div>
    );
  }

  const mediaUrl = ad.imageUrl || ad.videoUrl || "";
  const isVideo = Boolean(mediaUrl && (mediaUrl.match(/\.(mp4|webm|ogg)$/i) || mediaUrl.includes("video")));
  const targetUrl = ad.destinationUrl ? `/api/ads/${ad.id}/click` : null;

  return (
    <div className="space-y-6">
      {/* 1. REKLAM İZLEME ANA KARTI */}
      <div className="card overflow-hidden shadow-xl border border-[var(--outline-variant)]">
        <div className="p-4 bg-[var(--surface-variant)] border-b border-[var(--outline-variant)] flex justify-between items-center gap-3">
          <div>
            <h2 className="font-bold text-sm sm:text-base text-[var(--on-surface)]">{ad.title}</h2>
            <p className="text-xs text-[var(--on-surface-variant)] font-medium">
              Bu reklamı izleyerek <strong className="text-[var(--primary)]">+{ad.creditReward || 1} Kredi</strong> kazanın
            </p>
          </div>
          {targetUrl && (
            <a
              href={targetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn bg-[var(--secondary)] text-white text-xs px-3.5 py-1.5 rounded-xl font-bold hover:opacity-90 transition-all shrink-0 flex items-center gap-1 shadow-sm"
            >
              İncele ➔
            </a>
          )}
        </div>

        {/* Video / Medya Alanı */}
        <div
          onClick={targetUrl ? handleMediaClick : undefined}
          className={`relative bg-black w-full aspect-video flex items-center justify-center ${
            targetUrl ? "cursor-pointer group/media" : ""
          }`}
        >
          {!isPlaying && !rewardClaimed ? (
            <button
              onClick={handleStart}
              className="absolute z-10 bg-white/25 hover:bg-white/40 backdrop-blur-md text-white rounded-full w-20 h-20 flex items-center justify-center transition-all shadow-2xl hover:scale-110 cursor-pointer"
            >
              <div className="w-0 h-0 border-t-[12px] border-t-transparent border-l-[20px] border-l-white border-b-[12px] border-b-transparent ml-2" />
            </button>
          ) : null}

          {isVideo ? (
            <video
              ref={videoRef}
              src={mediaUrl}
              onEnded={handleVideoEnded}
              className={`w-full h-full object-contain ${
                !isPlaying || rewardClaimed ? "opacity-50" : "opacity-100"
              }`}
              controls={false}
              playsInline
            />
          ) : (
            <div className="w-full h-full">
              <img
                src={mediaUrl}
                alt={ad.title}
                className={`w-full h-full object-contain ${
                  !isPlaying || rewardClaimed ? "opacity-50" : "opacity-100"
                } ${targetUrl ? "group-hover/media:scale-105 transition-transform duration-500" : ""}`}
              />
              {isPlaying && !isCompleted && !rewardClaimed && (
                <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-md text-white px-3.5 py-1.5 rounded-xl text-xs font-bold animate-pulse">
                  ⏳ Lütfen bekleyin...
                </div>
              )}
            </div>
          )}
        </div>

        {/* Buton ve Bildirim Alanı */}
        <div className="p-6 text-center space-y-4">
          {message && (
            <div
              className={`p-4 rounded-2xl font-bold text-sm shadow-sm ${
                message.includes("Hata")
                  ? "bg-red-500/10 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-800"
                  : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800"
              }`}
            >
              {message}
            </div>
          )}

          {!rewardClaimed ? (
            <button
              onClick={claimReward}
              disabled={!isCompleted || loading}
              className="btn btn-primary px-8 py-3.5 text-sm sm:text-base font-extrabold rounded-2xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 cursor-pointer"
            >
              {loading
                ? "İşleniyor..."
                : isCompleted
                ? "🎉 Ödülü Al"
                : "Ödülü Alabilmek İçin Reklamı Başlatın & İzleyin"}
            </button>
          ) : (
            <button
              onClick={loadNextAd}
              className="btn bg-[var(--primary)] hover:bg-[var(--primary-container)] text-white px-8 py-3.5 text-sm sm:text-base font-extrabold rounded-2xl shadow-lg flex items-center justify-center gap-2 mx-auto cursor-pointer"
            >
              <span>▶️ Sonraki Reklamı İzle</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. MİSAFİR KULLANICI BİLGİLENDİRME VE HIZLI GİRİŞ/KAYIT FORMU */}
      {!currentUser && (
        <div className="space-y-4 animate-in fade-in duration-300">
          {/* Uyarı ve Bilgilendirme Kutusu */}
          <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border-2 border-amber-500/30 text-amber-950 dark:text-amber-200 text-xs sm:text-sm space-y-2.5 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2 font-black text-amber-800 dark:text-amber-300 text-sm">
                <Gift className="w-5 h-5 text-amber-600 shrink-0 animate-bounce" />
                <span>(Kazanılan krediler üye olduktan sonra veya üye girişi yaptıktan sonra hesabınıza aktarılacaktır.)</span>
              </div>
              {guestCredits > 0 && (
                <span className="self-start sm:self-center bg-gradient-to-r from-amber-500 to-amber-600 text-white font-black px-3 py-1 rounded-full text-xs shrink-0 shadow-md">
                  🪙 Bekleyen: {guestCredits} Kredi ({guestWatchedCount}/2 Hak)
                </span>
              )}
            </div>
            <p className="text-xs text-[var(--on-surface-variant)] leading-relaxed font-medium">
              Misafir olarak dilediğiniz kadar reklam izleyebilirsiniz; ancak <strong>yalnızca ilk 2 reklamdan</strong> kredi kazanabilirsiniz. Kazandığınız kredileri hemen hesabınıza aktarmak ve sınırsız günlük kredi kazanmaya devam etmek için <strong>bu sayfadan hiç ayrılmadan</strong> hemen aşağıdan giriş yapabilir veya kayıt olabilirsiniz!
            </p>
          </div>

          {/* Sayfadan Ayrılmadan Hızlı Giriş / Kayıt Ol Paneli */}
          <div className="card p-5 sm:p-6 border-2 border-[var(--primary)]/30 space-y-4 shadow-lg">
            <div className="flex items-center justify-between border-b border-[var(--outline-variant)] pb-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-[var(--primary)]/10 text-[var(--primary)] text-base">
                  ⚡
                </span>
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base text-[var(--on-surface)]">
                    Kredilerinizi Hesabınıza Yükleyin
                  </h3>
                  <p className="text-[11px] text-[var(--on-surface-variant)]">
                    Sayfadan ayrılmadan 10 saniyede giriş yapın veya üye olun
                  </p>
                </div>
              </div>

              {/* Tab Seçimi */}
              <div className="flex items-center bg-[var(--surface-container-high)] p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => { setAuthTab("LOGIN"); setAuthError(""); }}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                    authTab === "LOGIN"
                      ? "bg-[var(--primary)] text-white shadow-sm"
                      : "text-[var(--on-surface-variant)] hover:text-[var(--on-surface)]"
                  }`}
                >
                  Giriş Yap
                </button>
                <button
                  type="button"
                  onClick={() => { setAuthTab("REGISTER"); setAuthError(""); }}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                    authTab === "REGISTER"
                      ? "bg-[var(--primary)] text-white shadow-sm"
                      : "text-[var(--on-surface-variant)] hover:text-[var(--on-surface)]"
                  }`}
                >
                  Kayıt Ol
                </button>
              </div>
            </div>

            {authError && (
              <div className="p-3 bg-red-500/10 border border-red-300 dark:border-red-800 text-red-700 dark:text-red-300 rounded-xl text-xs font-bold">
                ⚠️ {authError}
              </div>
            )}

            {/* Hızlı Giriş Formu */}
            {authTab === "LOGIN" && (
              <form onSubmit={handleQuickLogin} className="space-y-3 animate-in fade-in">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[var(--on-surface-variant)] mb-1">
                      E-posta Adresi
                    </label>
                    <input
                      type="email"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="ornek@hobitohum.com"
                      className="input w-full text-xs p-2.5 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[var(--on-surface-variant)] mb-1">
                      Şifre
                    </label>
                    <input
                      type="password"
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="input w-full text-xs p-2.5 rounded-xl"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full bg-[var(--primary)] hover:bg-[var(--primary-container)] text-white font-bold text-xs sm:text-sm py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Lock className="w-4 h-4" />
                  <span>
                    {authLoading
                      ? "Giriş yapılıyor..."
                      : guestCredits > 0
                      ? `Giriş Yap & ${guestCredits} Krediyi Hesabıma Yükle ➔`
                      : "Giriş Yap ➔"}
                  </span>
                </button>
              </form>
            )}

            {/* Hızlı Kayıt Formu */}
            {authTab === "REGISTER" && (
              <form onSubmit={handleQuickRegister} className="space-y-3 animate-in fade-in">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[var(--on-surface-variant)] mb-1">
                      Ad *
                    </label>
                    <input
                      type="text"
                      required
                      value={regFirstName}
                      onChange={(e) => setRegFirstName(e.target.value)}
                      placeholder="Ahmet"
                      className="input w-full text-xs p-2.5 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[var(--on-surface-variant)] mb-1">
                      Soyad *
                    </label>
                    <input
                      type="text"
                      required
                      value={regLastName}
                      onChange={(e) => setRegLastName(e.target.value)}
                      placeholder="Yılmaz"
                      className="input w-full text-xs p-2.5 rounded-xl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[var(--on-surface-variant)] mb-1">
                      Telefon Numarası *
                    </label>
                    <input
                      type="tel"
                      required
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="0532 123 45 67"
                      className="input w-full text-xs p-2.5 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[var(--on-surface-variant)] mb-1">
                      E-posta Adresi *
                    </label>
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="ornek@hobitohum.com"
                      className="input w-full text-xs p-2.5 rounded-xl"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--on-surface-variant)] mb-1">
                    Şifre (En az 6 karakter) *
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="••••••••"
                    className="input w-full text-xs p-2.5 rounded-xl"
                  />
                </div>

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>
                    {authLoading
                      ? "Kayıt yapılıyor..."
                      : guestCredits > 0
                      ? `Üye Ol & ${guestCredits} Krediyi Hesabıma Yükle ➔`
                      : "Hızlı Üye Ol ➔"}
                  </span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
