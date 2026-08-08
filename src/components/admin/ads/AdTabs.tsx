"use client";

export type AdTabType = "ALL" | "GOOGLE" | "MANUAL" | "PACKAGES";

interface AdTabsProps {
  activeTab: AdTabType;
  onTabChange: (tab: AdTabType) => void;
  counts: {
    all: number;
    google: number;
    manual: number;
  };
}

export default function AdTabs({ activeTab, onTabChange, counts }: AdTabsProps) {
  return (
    <div className="flex border-b border-[var(--outline-variant)] mb-6 gap-2 flex-wrap">
      <button
        onClick={() => onTabChange("ALL")}
        className={`pb-3 px-4 font-semibold text-sm transition relative flex items-center gap-2 ${
          activeTab === "ALL"
            ? "text-[var(--primary)] border-b-2 border-[var(--primary)]"
            : "text-[var(--on-surface-variant)] hover:text-[var(--on-surface)]"
        }`}
      >
        <span>Tüm Reklamlar</span>
        <span className="px-2 py-0.5 text-xs bg-[var(--surface-variant)] rounded-full">
          {counts.all}
        </span>
      </button>

      <button
        onClick={() => onTabChange("GOOGLE")}
        className={`pb-3 px-4 font-semibold text-sm transition relative flex items-center gap-2 ${
          activeTab === "GOOGLE"
            ? "text-[var(--primary)] border-b-2 border-[var(--primary)]"
            : "text-[var(--on-surface-variant)] hover:text-[var(--on-surface)]"
        }`}
      >
        <span>🌐 Google Ads</span>
        <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full font-bold">
          {counts.google}
        </span>
      </button>

      <button
        onClick={() => onTabChange("MANUAL")}
        className={`pb-3 px-4 font-semibold text-sm transition relative flex items-center gap-2 ${
          activeTab === "MANUAL"
            ? "text-[var(--primary)] border-b-2 border-[var(--primary)]"
            : "text-[var(--on-surface-variant)] hover:text-[var(--on-surface)]"
        }`}
      >
        <span>🖼️ Manuel Reklamlar</span>
        <span className="px-2 py-0.5 text-xs bg-emerald-100 text-emerald-700 rounded-full font-bold">
          {counts.manual}
        </span>
      </button>

      <button
        onClick={() => onTabChange("PACKAGES")}
        className={`pb-3 px-4 font-semibold text-sm transition relative flex items-center gap-2 ${
          activeTab === "PACKAGES"
            ? "text-amber-600 border-b-2 border-amber-600 font-extrabold"
            : "text-[var(--on-surface-variant)] hover:text-[var(--on-surface)]"
        }`}
      >
        <span>📦 Reklam Paketleri (Satış)</span>
      </button>
    </div>
  );
}
