"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface ExpertScoreSettingsFormProps {
  initialSettings: {
    tlValue: string;
    answerPoint: string;
    likePoint: string;
    bestAnswerPoint: string;
    adminHighlightPoint: string;
    spamPoint: string;
    wrongInfoPoint: string;
  };
}

export default function ExpertScoreSettingsForm({ initialSettings }: ExpertScoreSettingsFormProps) {
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
      { key: "EXPERT_POINT_TL_VALUE", value: formData.tlValue },
      { key: "EXPERT_SCORE_ANSWER", value: formData.answerPoint },
      { key: "EXPERT_ANSWER_POINT_VALUE", value: formData.answerPoint },
      { key: "EXPERT_SCORE_LIKE", value: formData.likePoint },
      { key: "EXPERT_SCORE_BEST_ANSWER", value: formData.bestAnswerPoint },
      { key: "EXPERT_SCORE_ADMIN_HIGHLIGHT", value: formData.adminHighlightPoint },
      { key: "EXPERT_SCORE_SPAM", value: formData.spamPoint },
      { key: "EXPERT_SCORE_WRONG_INFO", value: formData.wrongInfoPoint },
    ];

    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings: settingsToSave }),
      });

      if (res.ok) {
        setSuccessMsg("Uzman puan katsayıları ve kazanç ayarları başarıyla kaydedildi!");
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

  const tlNum = parseFloat(formData.tlValue) || 0;
  const ansNum = parseInt(formData.answerPoint, 10) || 0;
  const bestAnsNum = parseInt(formData.bestAnswerPoint, 10) || 0;
  const samplePoints = ansNum + bestAnsNum;
  const sampleEarnings = (samplePoints * tlNum).toFixed(2);

  return (
    <form onSubmit={handleSave} className="card p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-[var(--outline-variant)] pb-4">
        <div>
          <h2 className="text-lg font-extrabold text-[var(--on-surface)] flex items-center gap-2">
            <span>⚙️ Uzman Puanlama & Kazanç Katsayısı Ayarları</span>
          </h2>
          <p className="text-xs text-[var(--on-surface-variant)] mt-0.5">
            Uzmanların yaptıkları eylemlere göre kazanacakları puanları ve 1 Puanın TL karşılığını buradan dinamik olarak değiştirebilirsiniz.
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary px-6 py-2.5 rounded-xl font-bold text-xs shadow-md shrink-0 disabled:opacity-50"
        >
          {loading ? "Kaydediliyor..." : "💾 Katsayıları Kaydet"}
        </button>
      </div>

      {successMsg && (
        <div className="p-3 bg-green-500/10 border border-green-500/30 text-green-700 dark:text-green-300 rounded-xl text-xs font-bold flex items-center gap-2">
          <span>✅</span> {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-700 dark:text-red-300 rounded-xl text-xs font-bold flex items-center gap-2">
          <span>❌</span> {errorMsg}
        </div>
      )}

      {/* Ana Çarpan Ayarı */}
      <div className="bg-[var(--primary)]/5 border border-[var(--primary)]/20 p-4 rounded-2xl space-y-2">
        <label className="block text-sm font-extrabold text-[var(--primary)]">
          💰 1 Uzman Puanı TL Dönüşüm Katsayısı (TL / Puan)
        </label>
        <p className="text-xs text-[var(--on-surface-variant)]">
          Uzmanın kazandığı 1 puanın TL hak edişine çarpan değeridir. Değiştirildiğinde uzmanlara otomatik bilgilendirme bildirimi gönderilir.
        </p>
        <div className="flex items-center gap-3 pt-1">
          <input
            type="number"
            step="0.1"
            min="0"
            value={formData.tlValue}
            onChange={(e) => handleChange("tlValue", e.target.value)}
            required
            className="w-36 p-2.5 text-sm font-bold border border-[var(--outline-variant)] rounded-xl bg-[var(--surface)] text-[var(--on-surface)]"
          />
          <span className="text-xs font-semibold text-[var(--on-surface-variant)]">
            TL / Puan (Örn: 2.0 TL ➔ 10 Puan = 20.00 TL)
          </span>
        </div>
      </div>

      {/* Puan Katsayıları Izgarası */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Kazanım Puanları */}
        <div className="space-y-4 p-4 rounded-2xl bg-[var(--surface-container-low)] border border-[var(--outline-variant)]">
          <h3 className="text-xs font-bold uppercase tracking-wider text-green-600 dark:text-green-400 flex items-center gap-1.5">
            <span>📈 Pozitif Puan Kazanım Katsayıları</span>
          </h3>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[var(--on-surface)]">
              ✍️ Soru Yanıtlama Puanı
            </label>
            <input
              type="number"
              value={formData.answerPoint}
              onChange={(e) => handleChange("answerPoint", e.target.value)}
              required
              className="w-full p-2 text-xs border border-[var(--outline-variant)] rounded-lg bg-[var(--surface)] text-[var(--on-surface)]"
            />
            <span className="text-[11px] text-[var(--on-surface-variant)] block">
              Uzmanın bir soruya yazdığı yanıt başına kazanacağı puan (Varsayılan: 10)
            </span>
          </div>

          <div className="space-y-1 pt-2">
            <label className="text-xs font-bold text-[var(--on-surface)]">
              ❤️ Yanıt Beğenilme Puanı
            </label>
            <input
              type="number"
              value={formData.likePoint}
              onChange={(e) => handleChange("likePoint", e.target.value)}
              required
              className="w-full p-2 text-xs border border-[var(--outline-variant)] rounded-lg bg-[var(--surface)] text-[var(--on-surface)]"
            />
            <span className="text-[11px] text-[var(--on-surface-variant)] block">
              Uzman yanıtının bir kullanıcı tarafından beğenilmesi durumunda kazanılacak puan (Varsayılan: 3)
            </span>
          </div>

          <div className="space-y-1 pt-2">
            <label className="text-xs font-bold text-[var(--on-surface)]">
              🌟 En İyi Cevap Seçilme Puanı
            </label>
            <input
              type="number"
              value={formData.bestAnswerPoint}
              onChange={(e) => handleChange("bestAnswerPoint", e.target.value)}
              required
              className="w-full p-2 text-xs border border-[var(--outline-variant)] rounded-lg bg-[var(--surface)] text-[var(--on-surface)]"
            />
            <span className="text-[11px] text-[var(--on-surface-variant)] block">
              Yanıtın soru sahibi tarafından "En İyi Cevap / Onaylı Yanıt" işaretlenmesi bonusu (Varsayılan: 20)
            </span>
          </div>

          <div className="space-y-1 pt-2">
            <label className="text-xs font-bold text-[var(--on-surface)]">
              📌 Yönetici Tarafından Öne Çıkarılma Puanı
            </label>
            <input
              type="number"
              value={formData.adminHighlightPoint}
              onChange={(e) => handleChange("adminHighlightPoint", e.target.value)}
              required
              className="w-full p-2 text-xs border border-[var(--outline-variant)] rounded-lg bg-[var(--surface)] text-[var(--on-surface)]"
            />
            <span className="text-[11px] text-[var(--on-surface-variant)] block">
              Yanıtın admin tarafından öne çıkarılması bonusu (Varsayılan: 15)
            </span>
          </div>
        </div>

        {/* Ceza Puanları */}
        <div className="space-y-4 p-4 rounded-2xl bg-[var(--surface-container-low)] border border-[var(--outline-variant)]">
          <h3 className="text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400 flex items-center gap-1.5">
            <span>📉 Ceza & Puan Düşüş Katsayıları</span>
          </h3>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[var(--on-surface)]">
              ⚠️ Spam İçerik Cezası (Negatif Puan)
            </label>
            <input
              type="number"
              value={formData.spamPoint}
              onChange={(e) => handleChange("spamPoint", e.target.value)}
              required
              className="w-full p-2 text-xs border border-[var(--outline-variant)] rounded-lg bg-[var(--surface)] text-[var(--on-surface)]"
            />
            <span className="text-[11px] text-[var(--on-surface-variant)] block">
              Spam tespitinde uzmandan düşülecek puan miktarı (Varsayılan: -20)
            </span>
          </div>

          <div className="space-y-1 pt-2">
            <label className="text-xs font-bold text-[var(--on-surface)]">
              ❌ Hatalı Bilgi Cezası (Negatif Puan)
            </label>
            <input
              type="number"
              value={formData.wrongInfoPoint}
              onChange={(e) => handleChange("wrongInfoPoint", e.target.value)}
              required
              className="w-full p-2 text-xs border border-[var(--outline-variant)] rounded-lg bg-[var(--surface)] text-[var(--on-surface)]"
            />
            <span className="text-[11px] text-[var(--on-surface-variant)] block">
              Yanlış / yanıltıcı içerik tespitinde uzmandan düşülecek puan (Varsayılan: -50)
            </span>
          </div>

          {/* Canlı Hesaplama Simülatörü */}
          <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl space-y-1 text-xs">
            <div className="font-extrabold text-amber-800 dark:text-amber-300">
              💡 Örnek Kazanç Simülasyonu:
            </div>
            <div className="text-[11px] text-amber-900 dark:text-amber-200 leading-relaxed">
              Bir uzman <strong>1 Yanıt ({ansNum}p)</strong> + <strong>1 En İyi Cevap ({bestAnsNum}p)</strong> kazandığında:
              <br />
              <strong>{samplePoints} Puan</strong> x <strong>{tlNum} TL</strong> = <span className="font-bold underline text-sm text-green-700 dark:text-green-300">{sampleEarnings} TL</span> haftalık hak ediş kazanır.
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
