"use client";

import { useState } from "react";
import { approveAdRequest } from "@/app/actions/contact";

export default function ApproveAdButton({ 
  requestId, 
  packageId 
}: { 
  requestId: string; 
  packageId: string; 
}) {
  const [loading, setLoading] = useState(false);

  const handleApprove = async () => {
    if (!confirm("Ödemenin İyzico üzerinden geldiğini teyit ettiniz mi? Reklam yayına alınacaktır.")) return;
    
    setLoading(true);
    let limit = 0;
    if (packageId === "10K") limit = 10000;
    else if (packageId === "50K") limit = 50000;
    else if (packageId === "100K") limit = 100000;

    const res = await approveAdRequest(requestId, limit);
    if (!res.success) {
      alert(res.error);
    } else {
      alert("Reklam başarıyla onaylandı ve yayına alındı!");
    }
    setLoading(false);
  };

  return (
    <button 
      onClick={handleApprove}
      disabled={loading}
      className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
    >
      {loading ? "İşleniyor..." : "✅ Ödemeyi Onayla ve Yayına Al"}
    </button>
  );
}
