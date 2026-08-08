"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function PaymentButton({ expertId, amountTl, points, weekStartDate }: { expertId: string, amountTl: number, points: number, weekStartDate: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handlePayment = async () => {
    if (!confirm("Bu haftanın ödemesini yapıldı olarak işaretlemek istiyor musunuz?")) return;
    
    setLoading(true);
    try {
      const res = await fetch("/api/admin/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ expertId, amountTl, points, weekStartDate })
      });
      
      if (res.ok) {
        router.refresh();
      } else {
        alert("Bir hata oluştu");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handlePayment} 
      disabled={loading}
      className="btn bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white text-xs px-3 py-1 border-none disabled:opacity-50"
    >
      {loading ? "..." : "Ödendi İşaretle"}
    </button>
  );
}
