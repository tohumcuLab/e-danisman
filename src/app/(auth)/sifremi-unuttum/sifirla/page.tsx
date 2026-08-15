"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const token = searchParams.get("token") || "";
  const email = searchParams.get("email") || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    if (newPassword.length < 6) {
      setError("Şifreniz en az 6 karakter olmalıdır.");
      setLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Şifreler uyuşmuyor. Lütfen tekrar kontrol edin.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          email,
          newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Şifre sıfırlama işlemi başarısız.");
      }

      setMessage(data.message || "Şifreniz başarıyla güncellendi.");
    } catch (err: any) {
      setError(err.message || "Bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  if (!token || !email) {
    return (
      <div className="container flex items-center justify-center min-h-[70vh] py-12">
        <div className="card w-full max-w-md p-8 text-center space-y-4 shadow-xl border-t-4 border-amber-500">
          <div className="text-3xl">⚠️</div>
          <h1 className="text-xl font-bold text-[var(--on-surface)]">Geçersiz Bağlantı</h1>
          <p className="text-xs text-[var(--on-surface-variant)]">
            Şifre sıfırlama bağlantısı eksik veya geçersiz. Lütfen tekrar şifre sıfırlama talebinde bulunun.
          </p>
          <div className="pt-2">
            <Link
              href="/sifremi-unuttum"
              className="inline-block bg-[var(--primary)] text-white font-bold text-xs px-6 py-3 rounded-xl shadow transition-all hover:opacity-90"
            >
              Şifremi Unuttum Sayfasına Git ➔
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container flex items-center justify-center min-h-[70vh] py-12">
      <div className="card w-full max-w-md p-8 md:p-10 space-y-6 shadow-xl border-t-4 border-[var(--primary)]">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-[var(--primary)] text-white font-extrabold rounded-2xl flex items-center justify-center text-2xl mx-auto shadow-md">
            🔒
          </div>
          <h1 className="text-2xl font-bold text-[var(--on-surface)]">Yeni Şifre Oluştur</h1>
          <p className="text-xs text-[var(--on-surface-variant)]">
            <span className="font-semibold text-[var(--primary)]">{email}</span> hesabı için yeni şifrenizi girin.
          </p>
        </div>

        {message && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-xs font-semibold space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold">
              <span>🎉</span> İşlem Başarılı
            </div>
            <p>{message}</p>
            <div className="pt-2">
              <Link
                href="/giris"
                className="block text-center bg-[var(--primary)] text-white font-bold text-xs py-3 rounded-xl shadow hover:opacity-90 transition-all"
              >
                Giriş Yapmak İçin Tıklayın ➔
              </Link>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-[var(--error-container)] text-[var(--on-error-container)] p-4 rounded-xl text-xs font-semibold">
            {error}
          </div>
        )}

        {!message && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="newPassword" className="text-xs font-bold text-[var(--on-surface-variant)] uppercase tracking-wider block">
                Yeni Şifre
              </label>
              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full bg-[var(--surface-container-lowest)] border border-[var(--outline-variant)] rounded-xl p-3.5 text-sm text-[var(--on-surface)] focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] transition-all outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="confirmPassword" className="text-xs font-bold text-[var(--on-surface-variant)] uppercase tracking-wider block">
                Yeni Şifre (Tekrar)
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
              {loading ? "Şifre Güncelleniyor..." : "Şifreyi Güncelle ➔"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="container flex items-center justify-center min-h-[70vh] py-12"><div className="text-sm font-semibold">Yükleniyor...</div></div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
