"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteAdButton({ adId }: { adId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm("Bu reklamı ve varsa ekli fiziksel medyasını tamamen silmek istediğinize emin misiniz?")) return;
    
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/ads/${adId}`, {
        method: "DELETE"
      });

      if (res.ok) {
        router.refresh();
      } else {
        alert("Silme işlemi başarısız.");
      }
    } catch (err) {
      alert("Bağlantı hatası");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleDelete}
      disabled={loading}
      className="btn bg-red-100 text-red-700 hover:bg-red-200 px-3 py-1 text-xs font-semibold"
    >
      {loading ? "Siliniyor..." : "Sil"}
    </button>
  );
}
