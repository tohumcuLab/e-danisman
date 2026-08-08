import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function PremiumPage() {
  const session = await auth();

  // Ayarları veritabanından çek
  const settings = await prisma.systemSetting.findMany();
  const settingsMap = settings.reduce((acc, curr) => {
    acc[curr.key] = curr.value;
    return acc;
  }, {} as Record<string, string>);

  // Kullanıcı durumunu çek
  let isPremium = false;
  let premiumUntilDate = null;
  
  if (session?.user?.id) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { premiumUntil: true }
    });
    
    if (user?.premiumUntil && user.premiumUntil > new Date()) {
      isPremium = true;
      premiumUntilDate = user.premiumUntil;
    }
  }

  const packages = [
    {
      id: "1_MONTH",
      title: "1 Aylık Premium",
      price: settingsMap["PREMIUM_1_MONTH_PRICE"] || "379",
      link: settingsMap["PREMIUM_1_MONTH_LINK"] || "#",
      features: ["Sınırsız Reklamsız Deneyim", "Kesintisiz Soru & Cevap", "Tüm Alanlarda Öncelik"],
      recommended: false,
    },
    {
      id: "6_MONTHS",
      title: "6 Aylık Premium",
      price: settingsMap["PREMIUM_6_MONTHS_PRICE"] || "1000",
      link: settingsMap["PREMIUM_6_MONTHS_LINK"] || "#",
      features: ["Sınırsız Reklamsız Deneyim", "Kesintisiz Soru & Cevap", "Tüm Alanlarda Öncelik", "Uzun Süreli Avantaj"],
      recommended: true,
      badge: "En Popüler",
    },
    {
      id: "12_MONTHS",
      title: "1 Yıllık Premium",
      price: settingsMap["PREMIUM_12_MONTHS_PRICE"] || "1500",
      link: settingsMap["PREMIUM_12_MONTHS_LINK"] || "#",
      features: ["Sınırsız Reklamsız Deneyim", "Kesintisiz Soru & Cevap", "Tüm Alanlarda Öncelik", "En Uygun Fiyat Garantisi"],
      recommended: false,
    },
  ];

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
        <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-[var(--primary)] to-amber-500 bg-clip-text text-transparent pb-2">
          Premium Ayrıcalığını Yaşayın
        </h1>
        <p className="text-lg text-[var(--on-surface-variant)]">
          Tarımsal Danışmanlık sistemini reklamsız, kesintisiz ve ayrıcalıklı kullanmak için Premium'a geçiş yapın.
        </p>
      </div>

      {isPremium && (
        <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-2xl p-6 text-center max-w-2xl mx-auto mb-12 shadow-sm">
          <div className="text-emerald-600 text-5xl mb-4">👑</div>
          <h2 className="text-2xl font-bold text-[var(--on-surface)] mb-2">Zaten Premium Üyesiniz!</h2>
          <p className="text-[var(--on-surface-variant)]">
            Premium aboneliğiniz <strong>{premiumUntilDate?.toLocaleDateString("tr-TR")}</strong> tarihine kadar devam ediyor. Reklamsız deneyimin keyfini çıkarın.
          </p>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-8 items-stretch">
        {packages.map((pkg) => (
          <div
            key={pkg.id}
            className={`relative flex flex-col bg-[var(--surface-container)] rounded-3xl p-8 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
              pkg.recommended
                ? "border-2 border-[var(--primary)] shadow-lg shadow-[var(--primary)]/20 scale-105 z-10 md:-mt-4 md:mb-4"
                : "border border-[var(--outline-variant)]"
            }`}
          >
            {pkg.badge && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[var(--primary)] text-white text-xs font-black uppercase tracking-wider px-4 py-1.5 rounded-full shadow-md">
                {pkg.badge}
              </div>
            )}

            <div className="text-center mb-8">
              <h3 className="text-xl font-bold text-[var(--on-surface)] mb-4">{pkg.title}</h3>
              <div className="flex items-end justify-center gap-1">
                <span className="text-5xl font-black text-[var(--primary)]">{pkg.price}</span>
                <span className="text-lg text-[var(--on-surface-variant)] font-medium mb-1.5">TL</span>
              </div>
            </div>

            <ul className="space-y-4 mb-8 flex-grow">
              {pkg.features.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-3 text-[var(--on-surface)]">
                  <CheckCircle2 className="w-5 h-5 text-[var(--primary)] shrink-0 mt-0.5" />
                  <span className="font-medium text-sm leading-relaxed">{feature}</span>
                </li>
              ))}
            </ul>

            <div className="mt-auto">
              {session ? (
                <Link
                  href={pkg.link}
                  target="_blank"
                  className={`block w-full text-center py-4 rounded-xl font-bold text-sm transition-all ${
                    pkg.recommended
                      ? "bg-[var(--primary)] text-white shadow-md hover:bg-[var(--primary-container)] hover:text-[var(--on-primary-container)] hover:shadow-lg"
                      : "bg-[var(--surface-variant)] text-[var(--on-surface-variant)] hover:bg-[var(--primary)] hover:text-white"
                  }`}
                >
                  Hemen Satın Al
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="block w-full text-center py-4 rounded-xl font-bold text-sm bg-[var(--surface-variant)] text-[var(--on-surface-variant)] hover:bg-[var(--primary)] hover:text-white transition-all"
                >
                  Satın Almak İçin Giriş Yapın
                </Link>
              )}
            </div>
            
            {session && (
              <p className="text-[10px] text-center text-[var(--on-surface-variant)] mt-4 opacity-70">
                Satın alma işlemi tamamlandıktan sonra yöneticilerimiz tarafından hesabınız en kısa sürede Premium statüsüne yükseltilecektir.
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
