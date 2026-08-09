"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Uygulama Hatası:", error);
  }, [error]);

  return (
    <div className="container max-w-lg mx-auto py-16 px-4 text-center space-y-6">
      <div className="text-6xl">⚠️</div>
      <h1 className="text-xl font-extrabold text-[var(--on-surface)]">Bir Hata Oluştu</h1>
      <p className="text-xs text-[var(--on-surface-variant)] leading-relaxed">
        Sayfa yüklenirken geçici bir aksaklık yaşandı. Lütfen tekrar deneyiniz.
      </p>
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={() => reset()}
          className="bg-[var(--primary)] text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow hover:opacity-90 transition-all cursor-pointer"
        >
          🔄 Yeniden Dene
        </button>
        <Link 
          href="/" 
          className="bg-[var(--surface-container-high)] text-[var(--on-surface)] font-bold px-5 py-2.5 rounded-xl text-xs border border-[var(--outline-variant)] hover:bg-[var(--surface-variant)] transition-all"
        >
          🏠 Ana Sayfaya Dön
        </Link>
      </div>
    </div>
  );
}
