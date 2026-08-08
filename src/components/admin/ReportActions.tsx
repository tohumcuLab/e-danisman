"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ReportActions({ reportId }: { reportId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleUpdate = async (status: "RESOLVED" | "DISMISSED") => {
    if (loading) return;
    setLoading(true);
    
    try {
      const res = await fetch(`/api/reports/${reportId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });

      if (res.ok) {
        router.refresh();
      } else {
        alert("Güncelleme başarısız oldu.");
      }
    } catch (error) {
      alert("Bağlantı hatası.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTarget = async () => {
    if (loading) return;
    if (!confirm("Dikkat! Şikayet edilen bu içerik (Soru, Cevap veya Kullanıcı) veritabanından kalıcı olarak SİLİNECEKTİR. Emin misiniz?")) return;
    
    setLoading(true);
    try {
      const res = await fetch(`/api/reports/${reportId}`, {
        method: "DELETE"
      });

      if (res.ok) {
        router.refresh();
      } else {
        alert("Silme işlemi başarısız oldu.");
      }
    } catch (error) {
      alert("Bağlantı hatası.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-2">
      <button 
        onClick={() => handleUpdate("RESOLVED")}
        disabled={loading}
        className="btn bg-green-100 text-green-700 hover:bg-green-200 px-3 py-1.5 text-xs disabled:opacity-50"
      >
        Çözüldü
      </button>
      <button 
        onClick={() => handleUpdate("DISMISSED")}
        disabled={loading}
        className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 px-3 py-1.5 text-xs disabled:opacity-50"
      >
        Reddet
      </button>
      <button 
        onClick={handleDeleteTarget}
        disabled={loading}
        className="btn bg-red-100 text-red-700 hover:bg-red-200 px-3 py-1.5 text-xs font-bold disabled:opacity-50"
        title="İçeriği kalıcı olarak siler ve raporu çözüldü işaretler"
      >
        İçeriği Sil
      </button>
    </div>
  );
}
