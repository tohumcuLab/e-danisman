"use client";

interface AdDashboardProps {
  ads: Array<{
    id: string;
    type: string;
    isActive: boolean;
    impressionCount: number;
    clickCount: number;
  }>;
}

export default function AdDashboard({ ads }: AdDashboardProps) {
  const totalAds = ads.length;
  const activeGoogleAds = ads.filter(a => a.isActive && a.type === "GOOGLE").length;
  const activeManualAds = ads.filter(a => a.isActive && (a.type === "MANUAL" || a.type === "FEED")).length;
  const totalImpressions = ads.reduce((acc, a) => acc + (a.impressionCount || 0), 0);
  const totalClicks = ads.reduce((acc, a) => acc + (a.clickCount || 0), 0);

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
      <div className="card p-4 bg-[var(--surface-variant)]/60 border border-[var(--outline-variant)] rounded-xl">
        <span className="text-xs font-semibold text-[var(--on-surface-variant)] uppercase tracking-wider">
          Toplam Reklam
        </span>
        <div className="text-2xl font-extrabold mt-1">{totalAds}</div>
      </div>

      <div className="card p-4 bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-xl">
        <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
          Aktif Google Ads
        </span>
        <div className="text-2xl font-extrabold text-blue-700 dark:text-blue-300 mt-1">
          {activeGoogleAds}
        </div>
      </div>

      <div className="card p-4 bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-xl">
        <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
          Aktif Manuel Reklam
        </span>
        <div className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-300 mt-1">
          {activeManualAds}
        </div>
      </div>

      <div className="card p-4 bg-purple-50/60 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 rounded-xl">
        <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
          Toplam Gösterim
        </span>
        <div className="text-2xl font-extrabold text-purple-700 dark:text-purple-300 mt-1">
          {totalImpressions.toLocaleString("tr-TR")}
        </div>
      </div>

      <div className="card p-4 bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl col-span-2 md:col-span-1">
        <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
          Toplam Tıklama
        </span>
        <div className="text-2xl font-extrabold text-amber-700 dark:text-amber-300 mt-1 flex items-center justify-between">
          <span>{totalClicks.toLocaleString("tr-TR")}</span>
          <span className="text-xs px-2 py-0.5 bg-amber-200 text-amber-900 rounded font-normal">
            🎯 Tık Oranı
          </span>
        </div>
      </div>
    </div>
  );
}
