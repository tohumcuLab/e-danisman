"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function UserPremiumCreditControls({
  userId,
  currentPremiumUntil,
}: {
  userId: string;
  currentPremiumUntil: string | null;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [creditAmount, setCreditAmount] = useState("10");

  const isPremium = currentPremiumUntil && new Date(currentPremiumUntil) > new Date();

  const handlePremiumAction = async (months: number) => {
    if (!confirm(`Emin misiniz? Kullanıcıya ${months} aylık premium tanımlanacak.`)) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}/premium`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ months }),
      });

      if (!res.ok) throw new Error("İşlem başarısız.");
      
      alert(`${months} Aylık Premium tanımlandı!`);
      router.refresh();
    } catch (err: any) {
      alert(err.message || "Bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreditAction = async () => {
    const amount = parseInt(creditAmount, 10);
    if (!amount || amount <= 0) return alert("Geçerli bir miktar girin.");
    
    if (!confirm(`Emin misiniz? Kullanıcıya ${amount} kredi eklenecek.`)) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}/credits`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });

      if (!res.ok) throw new Error("İşlem başarısız.");
      
      alert(`${amount} Kredi başarıyla eklendi!`);
      setCreditAmount("10");
      router.refresh();
    } catch (err: any) {
      alert(err.message || "Bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card p-6 shadow-md space-y-6">
      <h3 className="font-extrabold text-base text-[var(--on-surface)] flex items-center gap-2 border-b border-[var(--outline-variant)] pb-3">
        <span>💎 Satış ve Premium İşlemleri</span>
      </h3>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Premium İşlemleri */}
        <div className="space-y-4">
          <div className="text-sm font-semibold text-[var(--on-surface)]">
            Premium Durumu:{" "}
            {isPremium ? (
              <span className="text-green-600">Aktif ({new Date(currentPremiumUntil!).toLocaleDateString("tr-TR")}'e kadar)</span>
            ) : (
              <span className="text-red-500">Pasif</span>
            )}
          </div>
          
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handlePremiumAction(1)}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all disabled:opacity-50"
            >
              1 Ay Premium Yap
            </button>
            <button
              onClick={() => handlePremiumAction(6)}
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all disabled:opacity-50"
            >
              6 Ay Premium Yap
            </button>
            <button
              onClick={() => handlePremiumAction(12)}
              disabled={loading}
              className="bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all disabled:opacity-50"
            >
              1 Yıl Premium Yap
            </button>
          </div>
        </div>

        {/* Kredi İşlemleri */}
        <div className="space-y-4 border-l md:border-[var(--outline-variant)] md:pl-6">
          <div className="text-sm font-semibold text-[var(--on-surface)]">Kredi Ekle</div>
          
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={creditAmount}
              onChange={(e) => setCreditAmount(e.target.value)}
              className="border border-[var(--outline-variant)] rounded-xl px-3 py-2 text-sm w-24"
              min="1"
            />
            <button
              onClick={handleCreditAction}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all disabled:opacity-50"
            >
              Kredi Yükle
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
