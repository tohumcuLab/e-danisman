import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import Link from "next/link";
import { Coins, CheckCircle2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function BuyCreditPage() {
  const session = await auth();

  // Ayarları veritabanından çek
  const settings = await prisma.systemSetting.findMany();
  const settingsMap = settings.reduce((acc, curr) => {
    acc[curr.key] = curr.value;
    return acc;
  }, {} as Record<string, string>);

  const creditAmount = settingsMap["CREDIT_PACKAGE_AMOUNT"] || "10";
  const creditPrice = settingsMap["CREDIT_PACKAGE_PRICE"] || "89";
  const creditLink = settingsMap["CREDIT_PACKAGE_LINK"] || "#";

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
        <h1 className="text-4xl md:text-5xl font-black text-[var(--on-surface)] pb-2">
          Kredi <span className="text-[var(--primary)]">Satın Al</span>
        </h1>
        <p className="text-lg text-[var(--on-surface-variant)]">
          Sorularınıza hızlı cevap almak veya uzmanlara soru sormak için ihtiyacınız olan kredileri hızlıca satın alabilirsiniz.
        </p>
      </div>

      <div className="max-w-md mx-auto relative flex flex-col bg-[var(--surface-container)] rounded-3xl p-8 border-2 border-[var(--primary)] shadow-lg shadow-[var(--primary)]/10 transition-all hover:-translate-y-1">
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-[var(--primary)] text-white p-3 rounded-2xl shadow-lg border-4 border-[var(--background)]">
          <Coins className="w-8 h-8" />
        </div>

        <div className="text-center mt-6 mb-8 border-b border-[var(--outline-variant)] pb-8">
          <h3 className="text-2xl font-black text-[var(--on-surface)] mb-4">{creditAmount} Kredi Paketi</h3>
          <div className="flex items-end justify-center gap-1">
            <span className="text-6xl font-black text-[var(--primary)]">{creditPrice}</span>
            <span className="text-xl text-[var(--on-surface-variant)] font-bold mb-2">TL</span>
          </div>
        </div>

        <ul className="space-y-4 mb-8 flex-grow">
          <li className="flex items-start gap-3 text-[var(--on-surface)]">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            <span className="font-medium text-sm">Hesaba Anında Yükleme (Onay Sonrası)</span>
          </li>
          <li className="flex items-start gap-3 text-[var(--on-surface)]">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            <span className="font-medium text-sm">Hiçbir Zaman Süresi Dolmaz (Süresiz)</span>
          </li>
          <li className="flex items-start gap-3 text-[var(--on-surface)]">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            <span className="font-medium text-sm">Tüm Uzmanlara Soru Sorarken Geçerli</span>
          </li>
        </ul>

        <div className="mt-auto">
          {session ? (
            <Link
              href={creditLink}
              target="_blank"
              className="block w-full text-center py-4 rounded-xl font-bold text-[15px] bg-[var(--primary)] text-white shadow-md hover:bg-[var(--primary-container)] hover:text-[var(--on-primary-container)] transition-all"
            >
              Hemen Satın Al
            </Link>
          ) : (
            <Link
              href="/login"
              className="block w-full text-center py-4 rounded-xl font-bold text-[15px] bg-[var(--surface-variant)] text-[var(--on-surface-variant)] hover:bg-[var(--primary)] hover:text-white transition-all"
            >
              Giriş Yapmanız Gerekiyor
            </Link>
          )}
        </div>
        
        {session && (
          <p className="text-[11px] text-center text-[var(--on-surface-variant)] mt-4 font-medium opacity-80">
            Ödemeniz iyzico güvencesiyle alınır. Ödemenizin ardından krediniz yöneticilerimiz tarafından kısa süre içinde bakiyenize tanımlanacaktır.
          </p>
        )}
      </div>
    </div>
  );
}
