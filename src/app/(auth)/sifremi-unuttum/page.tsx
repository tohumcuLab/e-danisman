"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function ForgotPasswordContent() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const initialEmail = searchParams.get("email");
    if (initialEmail) {
      setEmail(initialEmail);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Bir hata oluştu.");
      }

      setMessage(data.message || "Sıfırlama e-postası başarıyla gönderildi.");
    } catch (err: any) {
      setError(err.message || "İşlem sırasında bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container flex items-center justify-center min-h-[70vh] py-12">
      <div className="card w-full max-w-md p-8 md:p-10 space-y-6 shadow-xl border-t-4 border-[var(--primary)]">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-[var(--primary)] text-white font-extrabold rounded-2xl flex items-center justify-center text-2xl mx-auto shadow-md">
            🔑
          </div>
          <h1 className="text-2xl font-bold text-[var(--on-surface)]">Şifremi Unuttum</h1>
          <p className="text-xs text-[var(--on-surface-variant)]">
            E-posta adresinizi girin, size şifre sıfırlama bağlantısı gönderelim.
          </p>
        </div>

        {message && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-xs font-semibold space-y-2">
            <div className="flex items-center gap-2 text-sm font-bold">
              <span>✅</span> E-posta Gönderildi
            </div>
            <p>{message}</p>
          </div>
        )}

        {error && (
          <div className="bg-[var(--error-container)] text-[var(--on-error-container)] p-4 rounded-xl text-xs font-semibold">
            {error}
          </div>
        )}

        {!message ? (
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

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[var(--primary)] hover:bg-[var(--primary-container)] text-white font-bold text-sm py-4 rounded-xl shadow-lg transition-all active:scale-95 cursor-pointer mt-2"
            >
              {loading ? "Bağlantı Gönderiliyor..." : "Sıfırlama Bağlantısı Gönder ➔"}
            </button>
          </form>
        ) : (
          <div className="pt-2 text-center">
            <Link
              href="/giris"
              className="inline-block bg-[var(--surface-container)] hover:bg-[var(--surface-container-high)] text-[var(--on-surface)] font-bold text-xs px-6 py-3 rounded-xl transition-all"
            >
              ← Giriş Sayfasına Dön
            </Link>
          </div>
        )}

        <p className="text-center text-xs text-[var(--on-surface-variant)] pt-2 border-t border-[var(--outline-variant)]">
          Şifrenizi hatırladınız mı?{" "}
          <Link href="/giris" className="text-[var(--primary)] font-bold hover:underline">
            Giriş Yapın
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<div className="container flex items-center justify-center min-h-[70vh] py-12"><div className="text-sm font-semibold">Yükleniyor...</div></div>}>
      <ForgotPasswordContent />
    </Suspense>
  );
}
