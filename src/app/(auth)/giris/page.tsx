"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        setError("Geçersiz e-posta veya şifre.");
      } else {
        window.location.href = "/";
      }
    } catch (err) {
      setError("Bir hata oluştu. Lütfen tekrar deneyin.");
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
          <div className="bg-[var(--error-container)] text-[var(--on-error-container)] p-4 rounded-xl text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-xs font-bold text-[var(--on-surface-variant)] uppercase tracking-wider block">E-posta Adresi</label>
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
            <label htmlFor="password" className="text-xs font-bold text-[var(--on-surface-variant)] uppercase tracking-wider block">Şifre</label>
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
      </div>
    </div>
  );
}
