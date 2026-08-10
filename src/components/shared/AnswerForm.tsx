"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import InsufficientCreditsModal from "./InsufficientCreditsModal";
import PremiumModal from "./PremiumModal";

export default function AnswerForm({ 
  questionId, 
  userRole 
}: { 
  questionId: string; 
  userRole?: string; 
}) {
  const { data: session, status } = useSession();
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [draftNotice, setDraftNotice] = useState("");
  const [userCredits, setUserCredits] = useState<number | null>(null);
  const [isPremium, setIsPremium] = useState<boolean>(false);
  const [isCreditModalOpen, setIsCreditModalOpen] = useState(false);
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);
  const router = useRouter();

  const currentRole = session?.user?.role || userRole;
  const isExpert = currentRole === "EXPERT" || currentRole === "ADMIN";

  // Sayfa yüklendiğinde sessionStorage'dan taslak cevabı geri yükle
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedDraft = sessionStorage.getItem(`draft_answer_${questionId}`);
      const isPendingSubmit = sessionStorage.getItem(`pending_submit_${questionId}`);

      if (savedDraft) {
        setBody(savedDraft);
        if (isPendingSubmit && status === "authenticated") {
          setDraftNotice("💡 Giriş yapmadan önce yazdığınız cevabınız korundu. Aşağıdan kontrol edip onaylayarak gönderebilirsiniz.");
          sessionStorage.removeItem(`pending_submit_${questionId}`);
        }
      }
    }
  }, [questionId, status]);

  // Oturum açıldığında kullanıcı kredilerini ve premium durumunu çek
  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/user/me")
        .then((res) => res.json())
        .then((data) => {
          if (data?.user) {
            setUserCredits(data.user.credits ?? 0);
            if (data.user.premiumUntil && new Date(data.user.premiumUntil) > new Date()) {
              setIsPremium(true);
            }
          }
        })
        .catch(() => {});
    }
  }, [status]);

  // Metin değiştikçe sessionStorage'a otomatik kaydet
  const handleBodyChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setBody(text);
    if (typeof window !== "undefined") {
      if (text.trim()) {
        sessionStorage.setItem(`draft_answer_${questionId}`, text);
      } else {
        sessionStorage.removeItem(`draft_answer_${questionId}`);
      }
    }
  };

  const executeSubmit = async () => {
    setLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      const res = await fetch("/api/answers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body, questionId }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 403 && data.currentCredits !== undefined && data.requiredCredits) {
          setUserCredits(data.currentCredits);
          setIsCreditModalOpen(true);
          return;
        }
        throw new Error(data.error || "Cevap eklenemedi.");
      }

      // Başarılı gönderimde taslağı ve form alanını temizle
      setBody("");
      setDraftNotice("");
      if (typeof window !== "undefined") {
        sessionStorage.removeItem(`draft_answer_${questionId}`);
        sessionStorage.removeItem(`pending_submit_${questionId}`);
      }

      if (data.pendingApproval) {
        setSuccessMessage(data.message || "Cevabınız yönetici onayına gönderilmiştir.");
      } else {
        setSuccessMessage("Cevabınız başarıyla yayınlandı.");
      }

      if (data.updatedCredits !== undefined) {
        setUserCredits(data.updatedCredits);
      } else if (!isExpert && !isPremium && userCredits !== null) {
        setUserCredits((prev) => (prev !== null ? Math.max(0, prev - 4) : prev));
      }

      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("user:credits-updated"));
      }

      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Üye girişi yapmayan kullanıcı için: taslağı işaretle ve giriş popup'ı aç
    if (status === "unauthenticated" || !session?.user) {
      if (typeof window !== "undefined" && body.trim()) {
        sessionStorage.setItem(`draft_answer_${questionId}`, body);
        sessionStorage.setItem(`pending_submit_${questionId}`, "true");
      }
      window.dispatchEvent(new Event("prompt-guest-login"));
      return;
    }

    // 2. Giriş yapmış fakat yeterli bakiyesi olmayan standart kullanıcı için: kredi/reklam modalını aç
    if (!isExpert && !isPremium && userCredits !== null && userCredits < 4) {
      setIsCreditModalOpen(true);
      return;
    }

    // 3. Yeterli kredi veya uzman/premium hakkı varsa gönder
    await executeSubmit();
  };

  const getButtonText = () => {
    if (loading) return "Gönderiliyor...";
    if (status === "unauthenticated" || !session?.user) return "Cevabı Gönder (Giriş Yap)";
    if (isExpert) return "Cevabı Gönder";
    if (isPremium) return "Cevabı Gönder (👑 Premium)";
    return "Cevabı Gönder (-4 Kredi)";
  };

  return (
    <div className="card p-6 mt-8">
      <h3 className="text-xl font-bold mb-4 flex items-center justify-between flex-wrap gap-2">
        <span>Cevap Yaz</span>
        {status === "authenticated" && !isExpert && !isPremium && userCredits !== null && (
          <span className="text-xs font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 px-3 py-1 rounded-full border border-emerald-500/20">
            Mevcut Bakiyeniz: <strong>{userCredits} 🪙</strong> (Ücret: 4 Kredi)
          </span>
        )}
      </h3>

      {draftNotice && (
        <div className="bg-blue-500/10 border border-blue-500/30 text-blue-800 dark:text-blue-200 p-3.5 rounded-xl mb-4 text-xs font-semibold flex items-center gap-2">
          <span>{draftNotice}</span>
        </div>
      )}

      {isExpert ? (
        /* Uzman Danışman Yanıt Rehberi & Dikkat Edilmesi Gerekenler Kutusu */
        <div className="mb-5 p-4 bg-amber-50/80 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/60 rounded-2xl shadow-sm space-y-2.5">
          <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-extrabold text-sm border-b border-amber-200 dark:border-amber-800/60 pb-2">
            <span className="text-lg">🎓</span>
            <span>Uzman Danışman Yanıt Rehberi & Dikkat Edilmesi Gerekenler</span>
          </div>
          
          <ul className="text-xs text-amber-950 dark:text-amber-300 space-y-1.5 font-medium leading-relaxed">
            <li className="flex items-start gap-2">
              <span className="shrink-0 text-amber-700 dark:text-amber-400 font-bold">•</span>
              <span><strong>Detaylı Açıklama:</strong> Cevaplar çok kısa ve yetersiz olmamalıdır. Üreticinin sorununu tam olarak çözecek kapsamlı açıklamalar yazınız (Karakter sayısına dikkat ediniz).</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="shrink-0 text-amber-700 dark:text-amber-400 font-bold">•</span>
              <span><strong>Üslup Kuralları:</strong> Cevap içerisinde küfür, hakaret, aşağılama veya topluluk kurallarına aykırı ifadelere kesinlikle yer verilmemelidir.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="shrink-0 text-amber-700 dark:text-amber-400 font-bold">•</span>
              <span><strong>Ticari Marka/İlaç Yasağı:</strong> Cevap içerisinde doğrudan ticari marka, ticari ilaç ve gübre marka isimleri bulunmamalıdır. Sadece <em>aktif etken maddeler</em> ve <em>garanti edilen içerikler</em> (örneğin NPK, iz element vb.) belirtilmelidir.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="shrink-0 text-amber-700 dark:text-amber-400 font-bold">•</span>
              <span><strong>Kişisel İletişim Bilgisi Yasağı:</strong> Cevap metninde kendi sosyal medya hesaplarınız, telefon numaranız, e-posta adresiniz veya harici iletişim bilgileri paylaşılmamalıdır.</span>
            </li>
          </ul>
        </div>
      ) : (
        /* Standart Kullanıcı Topluluk Kuralları Uyarı Kutusu */
        <div className="mb-5 p-4 bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700/60 rounded-2xl shadow-sm space-y-2.5">
          <div className="flex items-center justify-between border-b border-emerald-200 dark:border-emerald-800/60 pb-2">
            <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-200 font-extrabold text-sm">
              <span className="text-lg">🤝</span>
              <span>Cevap Yazarken Dikkat Edilmesi Gereken Topluluk Kuralları</span>
            </div>
            <Link 
              href="/topluluk-kurallari" 
              target="_blank" 
              className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 hover:underline shrink-0"
            >
              Tüm Kurallar →
            </Link>
          </div>
          
          <ul className="text-xs text-emerald-950 dark:text-emerald-300 space-y-1.5 font-medium leading-relaxed">
            <li className="flex items-start gap-2">
              <span className="shrink-0 text-emerald-700 dark:text-emerald-400 font-bold">•</span>
              <span><strong>Nezaket ve Saygı:</strong> Cevabınızda küfür, hakaret, aşağılama veya topluluk huzurunu bozacak söylemlere kesinlikle yer vermeyiniz.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="shrink-0 text-emerald-700 dark:text-emerald-400 font-bold">•</span>
              <span><strong>Faydalı Bilgi Paylaşımı:</strong> Çiftçilerimize ve tarım gönüllülerimize yardımcı olacak net, anlaşılır ve yapıcı tecrübelerinizi aktarınız.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="shrink-0 text-emerald-700 dark:text-emerald-400 font-bold">•</span>
              <span><strong>Reklam ve İletişim Bilgisi Yasağı:</strong> Cevabınızda ticari reklam, telefon numarası veya kişisel iletişim bilgisi paylaşmayınız.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="shrink-0 text-emerald-700 dark:text-emerald-400 font-bold">•</span>
              <span><strong>Tavsiye Niteliği:</strong> Paylaşılan cevapların genel bilgilendirme amaçlı olduğunu, resmi zirai reçete yerine geçmediğini unutmayınız.</span>
            </li>
          </ul>
        </div>
      )}

      {successMessage && (
        <div className="bg-emerald-500/10 border-2 border-emerald-500/40 text-emerald-800 dark:text-emerald-300 p-4 rounded-xl mb-4 text-xs md:text-sm font-bold flex items-center gap-3">
          <span className="text-xl">⏳</span>
          <div>{successMessage}</div>
        </div>
      )}

      {error && (
        <div className="bg-[var(--error-container)] text-[var(--on-error-container)] p-3 rounded-md mb-4 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <textarea
          required
          rows={5}
          value={body}
          onChange={handleBodyChange}
          placeholder="Çözüm önerinizi veya tavsiyenizi detaylı şekilde buraya yazın..."
          className="p-3 border border-[var(--outline-variant)] rounded-xl bg-[var(--surface)] text-[var(--on-surface)] focus:ring-2 focus:ring-[var(--primary)] focus:outline-none transition-all"
        />
        
        <div className="flex items-center justify-between flex-wrap gap-2">
          <span className="text-xs text-[var(--on-surface-variant)] font-semibold">
            Karakter Sayısı: <strong className="text-[var(--on-surface)]">{body.length}</strong>
          </span>

          <button
            type="submit"
            disabled={loading || !body.trim()}
            className="bg-[#006537] hover:bg-[#74db98] text-white hover:text-[#00391d] font-extrabold text-sm px-6 py-3 rounded-xl transition-all shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {getButtonText()}
          </button>
        </div>
      </form>

      {/* Kredi Yetersiz & Reklam İzleme Modalı */}
      <InsufficientCreditsModal
        isOpen={isCreditModalOpen}
        onClose={() => setIsCreditModalOpen(false)}
        currentCredits={userCredits ?? 0}
        onCreditUpdated={(newCredits) => setUserCredits(newCredits)}
        onReadyToSubmit={() => {
          setIsCreditModalOpen(false);
          executeSubmit();
        }}
        onOpenPremium={() => {
          setIsCreditModalOpen(false);
          setIsPremiumModalOpen(true);
        }}
      />

      {/* Premium Üyelik Modalı */}
      <PremiumModal
        isOpen={isPremiumModalOpen}
        onClose={() => setIsPremiumModalOpen(false)}
      />
    </div>
  );
}
