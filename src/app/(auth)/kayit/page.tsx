"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";

export default function RegisterPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [tcNo, setTcNo] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!firstName.trim() || !lastName.trim()) {
      setError("Lütfen adınızı ve soyadınızı giriniz.");
      return;
    }

    if (!tcNo || tcNo.trim().length !== 11 || !/^\d{11}$/.test(tcNo.trim())) {
      setError("Lütfen geçerli 11 haneli T.C. Kimlik Numaranızı giriniz.");
      return;
    }

    // Telefon doğrulama ön kontrolü
    const cleanPhone = phone.replace(/\D/g, "");
    if (!cleanPhone || (cleanPhone.length !== 10 && cleanPhone.length !== 11)) {
      setError("Lütfen geçerli 10 haneli Türkiye cep telefonu numaranızı giriniz. (Örn: 05XX XXX XX XX)");
      return;
    }

    if (!agreedTerms) {
      setError("Lütfen Kullanıcı Sözleşmesi'ni okuyup kabul ettiğinizi onaylayın.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          username: username.trim(),
          email: email.trim(),
          phone: phone.trim(),
          password,
          tcNo: tcNo.trim(),
          agreedTerms,
        }),
      });

      if (res.ok) {
        // Kayıt sonrası otomatik giriş
        const signInRes = await signIn("credentials", {
          redirect: false,
          email,
          password,
        });
        
        if (!signInRes?.error) {
          window.location.href = "/";
        } else {
          router.push("/giris");
        }
      } else {
        const data = await res.json();
        setError(data.error || "Kayıt olurken bir hata oluştu.");
      }
    } catch (err) {
      setError("Bağlantı hatası. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container flex items-center justify-center min-h-[85vh] py-8">
      <div className="card w-full max-w-lg p-6 sm:p-8 space-y-6 shadow-xl border-t-4 border-[var(--primary)]">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-[var(--primary)] text-white font-extrabold rounded-2xl flex items-center justify-center text-2xl mx-auto shadow-md">
            🌱
          </div>
          <h1 className="text-2xl font-bold text-[var(--on-surface)]">Hesap Oluştur</h1>
          <p className="text-xs text-[var(--on-surface-variant)]">Güvenli topluluğumuza üye olun, hemen soru sorun</p>
        </div>
        
        {error && (
          <div className="bg-[var(--error-container)] text-[var(--on-error-container)] p-4 rounded-xl text-xs font-semibold">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Ad ve Soyad (Yan Yana Ayrı Kutular) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label htmlFor="firstName" className="text-xs font-bold text-[var(--on-surface-variant)] uppercase tracking-wider block">Ad *</label>
              <input
                id="firstName"
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Ahmet"
                className="w-full bg-[var(--surface-container-lowest)] border border-[var(--outline-variant)] rounded-xl p-3 text-sm text-[var(--on-surface)] focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] transition-all outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="lastName" className="text-xs font-bold text-[var(--on-surface-variant)] uppercase tracking-wider block">Soyad *</label>
              <input
                id="lastName"
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Yılmaz"
                className="w-full bg-[var(--surface-container-lowest)] border border-[var(--outline-variant)] rounded-xl p-3 text-sm text-[var(--on-surface)] focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] transition-all outline-none"
              />
            </div>
          </div>

          {/* Kullanıcı Adı / Rumuz (İsteğe Bağlı) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="username" className="text-xs font-bold text-[var(--on-surface-variant)] uppercase tracking-wider block">Kullanıcı Adı (Rumuz)</label>
              <span className="text-[10px] text-[var(--on-surface-variant)] font-medium">İsteğe Bağlı</span>
            </div>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="örneğin: tarimci_ahmet"
              className="w-full bg-[var(--surface-container-lowest)] border border-[var(--outline-variant)] rounded-xl p-3.5 text-sm text-[var(--on-surface)] focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] transition-all outline-none"
            />
            <p className="text-[11px] text-[var(--on-surface-variant)] leading-tight">
              💡 <em>Boş bırakırsanız sitede adınız ve soyadınız (<strong>{firstName || "Ad"} {lastName || "Soyad"}</strong>) görüntülenecektir.</em>
            </p>
          </div>

          {/* T.C. Kimlik Numarası (Zorunlu Alan) */}
          <div className="space-y-1.5">
            <label htmlFor="tcNo" className="text-xs font-bold text-[var(--on-surface-variant)] uppercase tracking-wider block flex items-center justify-between">
              <span>T.C. Kimlik Numarası *</span>
              <span className="text-[10px] text-amber-700 dark:text-amber-400 font-semibold normal-case">11 Haneli Rakam</span>
            </label>
            <input
              id="tcNo"
              type="text"
              required
              maxLength={11}
              value={tcNo}
              onChange={(e) => setTcNo(e.target.value.replace(/\D/g, ""))}
              placeholder="11111111111"
              className="w-full bg-[var(--surface-container-lowest)] border border-[var(--outline-variant)] rounded-xl p-3.5 text-sm text-[var(--on-surface)] focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] transition-all outline-none font-mono tracking-wider"
            />
            {/* T.C. Kimlik İsteme Nedeni Açıklama Kutusu */}
            <div className="bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 p-3 rounded-xl text-[11px] leading-relaxed space-y-1">
              <div className="font-bold flex items-center gap-1 text-xs">
                <span>🛡️ T.C. Kimlik Numarası Neden İsteniyor?</span>
              </div>
              <p>
                Platformumuzda gerçek ve güvenli bir topluluk ortamı oluşturmak, hakaret, küfür ve uygunsuz içerik paylaşımlarını önlemek amacıyla T.C. Kimlik Numarası doğrulanmaktadır. Bilgileriniz 6698 sayılı <strong>KVKK</strong> uyarınca kesinlikle gizli tutulur ve 3. şahıslarla paylaşılmaz.
              </p>
            </div>
          </div>

          {/* Türkiye İçi Telefon Numarası (Zorunlu Alan) */}
          <div className="space-y-1.5">
            <label htmlFor="phone" className="text-xs font-bold text-[var(--on-surface-variant)] uppercase tracking-wider block flex items-center justify-between">
              <span>Telefon Numarası (Türkiye İçi) *</span>
              <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold normal-case">🇹🇷 +90 Mobil Hat</span>
            </label>
            <input
              id="phone"
              type="tel"
              required
              maxLength={14}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0532 123 45 67"
              className="w-full bg-[var(--surface-container-lowest)] border border-[var(--outline-variant)] rounded-xl p-3.5 text-sm text-[var(--on-surface)] focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] transition-all outline-none font-mono tracking-wide"
            />
          </div>

          {/* E-posta Adresi (Gerçek Zamanlı Doğrulama) */}
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-xs font-bold text-[var(--on-surface-variant)] uppercase tracking-wider block flex items-center justify-between">
              <span>E-posta Adresi *</span>
              <span className="text-[10px] text-[var(--on-surface-variant)] normal-case">Gerçek e-posta kontrolü yapılır</span>
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

          {/* Şifre */}
          <div className="space-y-1.5">
            <label htmlFor="password" className="text-xs font-bold text-[var(--on-surface-variant)] uppercase tracking-wider block">Şifre *</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              placeholder="En az 6 karakter"
              className="w-full bg-[var(--surface-container-lowest)] border border-[var(--outline-variant)] rounded-xl p-3.5 text-sm text-[var(--on-surface)] focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] transition-all outline-none"
            />
          </div>

          {/* Kullanıcı Sözleşmesi Metin Kutusu */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[var(--on-surface-variant)] uppercase tracking-wider">Kullanıcı Sözleşmesi ve Kurallar</span>
              <Link href="/kullanici-sozlesmesi" target="_blank" className="text-[11px] text-[var(--primary)] font-bold hover:underline">
                Tamamını Oku ↗
              </Link>
            </div>
            <div className="max-h-32 overflow-y-auto bg-[var(--surface-container-low)] border border-[var(--outline-variant)] rounded-xl p-3 text-[11px] text-[var(--on-surface-variant)] space-y-2 leading-relaxed scrollbar-thin">
              <p className="font-bold text-[var(--on-surface)]">Tarımsal e-Danışman Üyelik ve Kullanım Sözleşmesi Özeti:</p>
              <p>1. <strong>Topluluk Saygısı:</strong> Platformda küfür, hakaret, tehdit, reklam veya genel ahlaka aykırı paylaşım yapılması kesinlikle yasaktır.</p>
              <p>2. <strong>Doğru Bilgi & Sorumluluk:</strong> Kullanıcılar üyelik esnasında verdikleri kimlik, telefon ve iletişim bilgilerinin doğruluğunu taahhüt ederler.</p>
              <p>3. <strong>İçerik Moderasyonu:</strong> Kurallara uymayan kullanıcıların hesapları uyarı yapılmaksızın askıya alınabilir veya silinebilir.</p>
              <p>4. <strong>KVKK Gizlilik Güvencesi:</strong> Kişisel verileriniz 6698 sayılı kanun kapsamında korunmakta ve üçüncü taraflara aktarılmamaktadır.</p>
            </div>
          </div>

          {/* Onay Checkbox'ı */}
          <div className="flex items-start gap-2.5 pt-1">
            <input
              id="agreedTerms"
              type="checkbox"
              checked={agreedTerms}
              onChange={(e) => setAgreedTerms(e.target.checked)}
              required
              className="w-4 h-4 mt-0.5 accent-[var(--primary)] rounded cursor-pointer"
            />
            <label htmlFor="agreedTerms" className="text-xs text-[var(--on-surface)] cursor-pointer leading-tight select-none">
              <Link href="/kullanici-sozlesmesi" target="_blank" className="font-bold text-[var(--primary)] hover:underline">
                Kullanıcı Sözleşmesi
              </Link>
              'ni ve{" "}
              <Link href="/topluluk-kurallari" target="_blank" className="font-bold text-[var(--primary)] hover:underline">
                Topluluk Kuralları
              </Link>
              'nı okudum, anladım ve kabul ediyorum. *
            </label>
          </div>

          <button
            type="submit"
            disabled={loading || !agreedTerms}
            className={`w-full font-bold text-sm py-4 rounded-xl shadow-lg transition-all active:scale-95 cursor-pointer mt-2 ${
              agreedTerms 
                ? "bg-[var(--primary)] hover:bg-[var(--primary-container)] text-white" 
                : "bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed opacity-70"
            }`}
          >
            {loading ? "Kayıt yapılıyor..." : "Kayıt Ol & Başla ➔"}
          </button>
        </form>

        <p className="text-center text-xs text-[var(--on-surface-variant)] pt-2 border-t border-[var(--outline-variant)]">
          Zaten hesabınız var mı?{" "}
          <Link href="/giris" className="text-[var(--primary)] font-bold hover:underline">
            Giriş Yapın
          </Link>
        </p>
      </div>
    </div>
  );
}
