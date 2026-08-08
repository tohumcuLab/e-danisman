"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SettingsForm({ settingKey, initialValue, label, description }: { settingKey: string, initialValue: string, label: string, description?: string }) {
  const [value, setValue] = useState(initialValue);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: settingKey, value })
      });

      if (res.ok) {
        alert("Ayar başarıyla kaydedildi");
        router.refresh();
      } else {
        alert("Ayar kaydedilemedi.");
      }
    } catch (err) {
      alert("Bağlantı hatası.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="card p-6 flex flex-col gap-4">
      <div>
        <label className="block font-bold text-lg mb-1">{label}</label>
        {description && <p className="text-sm text-[var(--on-surface-variant)] mb-3">{description}</p>}
        
        <input 
          type="text" 
          value={value}
          onChange={(e) => setValue(e.target.value)}
          required
          className="w-full p-2 border border-[var(--outline-variant)] rounded-md bg-[var(--surface)] text-[var(--on-surface)]"
        />
      </div>
      
      <div className="flex justify-end">
        <button 
          type="submit" 
          disabled={loading || value === initialValue}
          className="btn btn-primary disabled:opacity-50"
        >
          {loading ? "Kaydediliyor..." : "Kaydet"}
        </button>
      </div>
    </form>
  );
}
