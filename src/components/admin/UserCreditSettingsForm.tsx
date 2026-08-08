"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface UserCreditSettingsFormProps {
  initialSettings: {
    welcomeCredit: string;
    adRewardCredit: string;
    dailyAdLimit: string;
    questionCost: string;
  };
}

export default function UserCreditSettingsForm({ initialSettings }: UserCreditSettingsFormProps) {
  const [formData, setFormData] = useState(initialSettings);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const router = useRouter();

  const handleChange = (field: keyof typeof initialSettings, val: string) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    const settingsToSave = [
      { key: "USER_WELCOME_CREDIT", value: formData.welcomeCredit },
      { key: "USER_AD_REWARD_CREDIT", value: formData.adRewardCredit },
      { key: "DAILY_AD_LIMIT", value: formData.dailyAdLimit },
      { key: "QUESTION_BASE_CREDIT_COST", value: formData.questionCost },
    ];

    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings: settingsToSave }),
      });

      if (res.ok) {
        setSuccessMsg(
          "Üyelik kredi ayarları başarıyla kaydedildi! Tüm üyelere bilgilendirme bildirimi iletildi."
        );
        router.refresh();
      } else {
        const data = await res.json();
        setErrorMsg(data.error || "Ayarlar kaydedilemedi.");
      }
    } catch (err) {
      setErrorMsg("Bağlantı hatası oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const welcomeNum = parseInt(formData.welcomeCredit, 10) || 0;
  const adRewardNum = parseInt(formData.adRewardCredit, 10) || 0;
  const adLimitNum = parseInt(formData.dailyAdLimit, 10) || 0;
  const questionCostNum = parseInt(formData.questionCost, 10) || 0;
  const dailyMaxAdCredits = adRewardNum * adLimitNum;

  return (
    <form onSubmit={handleSave} className="card p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-[var(--outline-variant)] pb-4">
        <div>
          <h2 className="text-lg font-extrabold text-[var(--on-surface)] flex items-center gap-2">
            <span>⚙️ Üye Kredi & Kazanım Ayarları</span>
          </h2>
          <p className="text-xs text-[var(--on-surface-variant)] mt-0.5">
            Üyelerin kayıt olurken, reklam izlerken ve soru sorarken kullanacağı kredi miktarlarını buradan dinamik olarak yönetebilirsiniz.
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary px-6 py-2.5 rounded-xl font-bold text-xs shadow-md shrink-0 disabled:opacity-50 cursor-pointer"
        >
          {loading ? "Kaydediliyor..." : "💾 Kredi Ayarlarını Kaydet"}
        </button>
      </div>

      {successMsg && (
        <div className="p-3.5 bg-green-500/10 border border-green-500/30 text-green-700 dark:text-green-300 rounded-xl text-xs font-bold flex items-center gap-2">
          <span>✅</span> {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 bg-red-500/10 border border-red-500/30 text-red-700 dark:text-red-300 rounded-xl text-xs font-bold flex items-center gap-2">
          <span>❌</span> {errorMsg}
        </div>
      )}

      {/* Form Kredi Alanları */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Sol Kolon - Kazanım Kredileri */}
        <div className="space-y-4 p-4 rounded-2xl bg-[var(--surface-container-low)] border border-[var(--outline-variant)]">
          <h3 className="text-xs font-bold uppercase tracking-wider text-green-600 dark:text-green-400 flex items-center gap-1.5">
            <span>🎁 Kredi Kazanım Oranları</span>
          </h3>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[var(--on-surface)]">
              🎉 Yeni Üye Hoş Geldin Kredisi
            </label>
            <input
              type="number"
              min="0"
              value={formData.welcomeCredit}
              onChange={(e) => handleChange("welcomeCredit", e.target.value)}
              required
              className="w-full p-2 text-xs border border-[var(--outline-variant)] rounded-lg bg-[var(--surface)] text-[var(--on-surface)]"
            />
            <span className="text-[11px] text-[var(--on-surface-variant)] block">
              Sisteme yeni kayıt olan kullanıcılara hediye edilecek başlangıç kredisi (Varsayılan: 10)
            </span>
          </div>

          <div className="space-y-1 pt-2">
            <label className="text-xs font-bold text-[var(--on-surface)]">
              🎬 Reklam İzleme Kredi Ödülü
            </label>
            <input
              type="number"
              min="0"
              value={formData.adRewardCredit}
              onChange={(e) => handleChange("adRewardCredit", e.target.value)}
              required
              className="w-full p-2 text-xs border border-[var(--outline-variant)] rounded-lg bg-[var(--surface)] text-[var(--on-surface)]"
            />
            <span className="text-[11px] text-[var(--on-surface-variant)] block">
              Kullanıcının 1 ödüllü reklam izlediğinde kazanacağı kredi miktarı (Varsayılan: 5)
            </span>
          </div>

          <div className="space-y-1 pt-2">
            <label className="text-xs font-bold text-[var(--on-surface)]">
              📅 Günlük Reklam İzleme Limiti
            </label>
            <input
              type="number"
              min="1"
              value={formData.dailyAdLimit}
              onChange={(e) => handleChange("dailyAdLimit", e.target.value)}
              required
              className="w-full p-2 text-xs border border-[var(--outline-variant)] rounded-lg bg-[var(--surface)] text-[var(--on-surface)]"
            />
            <span className="text-[11px] text-[var(--on-surface-variant)] block">
              Bir üyenin bir günde en fazla izleyebileceği ödüllü reklam sayısı (Varsayılan: 5)
            </span>
          </div>
        </div>

        {/* Sağ Kolon - Harcama ve Simülasyon */}
        <div className="space-y-4 p-4 rounded-2xl bg-[var(--surface-container-low)] border border-[var(--outline-variant)]">
          <h3 className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
            <span>❓ Kredi Harcama Maliyetleri</span>
          </h3>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[var(--on-surface)]">
              ❓ Soru Sorma Temel Kredi Maliyeti
            </label>
            <input
              type="number"
              min="1"
              value={formData.questionCost}
              onChange={(e) => handleChange("questionCost", e.target.value)}
              required
              className="w-full p-2 text-xs border border-[var(--outline-variant)] rounded-lg bg-[var(--surface)] text-[var(--on-surface)]"
            />
            <span className="text-[11px] text-[var(--on-surface-variant)] block">
              Kullanıcının soru gönderirken bakiyesinden düşülecek temel kredi tutarı (Varsayılan: 4)
            </span>
          </div>

          {/* Canlı Simülatör Kutusu */}
          <div className="mt-6 p-3.5 bg-[var(--primary)]/10 border border-[var(--primary)]/30 rounded-xl space-y-1 text-xs">
            <div className="font-extrabold text-[var(--primary)]">
              💡 Örnek Üye Kredi Akışı Simülasyonu:
            </div>
            <div className="text-[11px] text-[var(--on-surface)] leading-relaxed">
              • Yeni üye olan kullanıcı <strong>{welcomeNum} Kredi</strong> ile başlar.
              <br />
              • Günde en fazla {adLimitNum} reklam izleyerek <strong>+{dailyMaxAdCredits} Kredi</strong> kazanabilir.
              <br />
              • Her soru sorma işlemi <strong>-{questionCostNum} Kredi</strong> harcar.
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
