import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container max-w-lg mx-auto py-16 px-4 text-center space-y-6">
      <div className="text-6xl">🌱</div>
      <h1 className="text-2xl font-extrabold text-[var(--primary)]">Soru Veya Sayfa Bulunamadı</h1>
      <p className="text-xs text-[var(--on-surface-variant)] leading-relaxed">
        Aradığınız içerik kaldırılmış, silinmiş veya henüz onaylanmamış olabilir.
      </p>
      <Link 
        href="/" 
        className="inline-block bg-[var(--primary)] text-white font-bold px-6 py-3 rounded-xl text-xs shadow hover:opacity-90 transition-all"
      >
        🏠 Ana Sayfaya Dön
      </Link>
    </div>
  );
}
