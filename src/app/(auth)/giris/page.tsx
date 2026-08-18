"use client";

import { useState, useEffect, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import PremiumPromoCard from "@/components/shared/PremiumPromoCard";

function LoginContent() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam) {
      setError("Geçersiz e-posta adresi veya şifre.");
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 1. Önce e-posta ve şifreyi güvenli API üzerinden doğrula (NextAuth 500 çökmesini engeller)
      const verifyRes = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const verifyData = await verifyRes.json();

      if (!verifyRes.ok) {
        setError(verifyData.error || "Geçersiz e-posta adresi veya şifre.");
        setLoading(false);
        return;
      }

      // 2. Doğrulama başarılıysa NextAuth oturumunu başlat
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        setError("Geçersiz e-posta adresi veya şifre.");
      } else {
        window.location.href = "https://sor.hobitohum.com";
      }
    } catch (err: any) {
      console.error("Giriş işlemi hatası:", err);
      setError("Geçersiz e-posta adresi veya şifre.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container flex items-center justify-center min-h-[70vh] py-12">
      <div className="card w-full max-w-md p-8 md:p-10 space-y-6 shadow-xl border-t-4 border-[var(--primary)]">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-[var(--primary)] text-white font-extrabold rounded-2xl flex items-center justify-center text-2xl mx-auto shadow-md">
            🌿
          </div>
          <h1 className="text-2xl font-bold text-[var(--on-surface)]">Giriş Yap</h1>
          <p className="text-xs text-[var(--on-surface-variant)]">Tarımsal e-Danışman hesabınıza erişin</p>
        </div>

        {error && (
          <div className="bg-[var(--error-container)] text-[var(--on-error-container)] p-4 rounded-xl text-xs font-semibold space-y-2.5 border border-red-200 shadow-sm">
            <div className="flex items-center gap-1.5 text-sm font-bold">
              <span>⚠️</span> {error}
            </div>
            <div className="pt-2 border-t border-red-200/60">
              <Link
                href={`/sifremi-unuttum${email ? `?email=${encodeURIComponent(email)}` : ""}`}
                className="text-[var(--primary)] font-extrabold hover:underline underline-offset-2 flex items-center gap-1 text-xs"
              >
                🔑 Şifrenizi mi unuttunuz? Tıklayarak Şifrenizi Sıfırlayın ➔
              </Link>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-xs font-bold text-[var(--on-surface-variant)] uppercase tracking-wider block">
              E-posta Adresi
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="ornek@hobitohum.com"
              className="w-full bg-[var(--surface-container-lowest)] border border-[var(--outline-variant)] rounded-xl p-3.5 text-sm text-[var(--on-surface)] focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] transition-all outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="text-xs font-bold text-[var(--on-surface-variant)] uppercase tracking-wider block">
                Şifre
              </label>
              <Link
                href={`/sifremi-unuttum${email ? `?email=${encodeURIComponent(email)}` : ""}`}
                className="text-xs font-semibold text-[var(--primary)] hover:underline"
              >
                Şifremi Unuttum?
              </Link>
            </div>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full bg-[var(--surface-container-lowest)] border border-[var(--outline-variant)] rounded-xl p-3.5 text-sm text-[var(--on-surface)] focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] transition-all outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[var(--primary)] hover:bg-[var(--primary-container)] text-white font-bold text-sm py-4 rounded-xl shadow-lg transition-all active:scale-95 cursor-pointer mt-2"
          >
            {loading ? "Giriş yapılıyor..." : "Giriş Yap ➔"}
          </button>
        </form>

        <p className="text-center text-xs text-[var(--on-surface-variant)] pt-2 border-t border-[var(--outline-variant)]">
          Hesabınız yok mu?{" "}
          <Link href="/kayit" className="text-[var(--primary)] font-bold hover:underline">
            Hemen Kayıt Olun
          </Link>
        </p>

        {/* Formun Altında Premium Bilgilendirme Kutusu */}
        <PremiumPromoCard variant="sidebar" className="!p-4 mt-4" />
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="container flex items-center justify-center min-h-[70vh] py-12"><div className="text-sm font-semibold">Yükleniyor...</div></div>}>
      <LoginContent />
    </Suspense>
  );
}
