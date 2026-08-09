"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import StickyFooterBar from "./StickyFooterBar";
import { FOOTER_DISCLAIMER_TEXT, LEGAL_COPYRIGHT_SHORT } from "@/lib/constants";

// Lazy Load (Sonsuz akış / sayfalama) içeren rotalar:
const LAZY_LOAD_ROUTES = ["/", "/en-cok-okunanlar", "/cevap-bekleyenler"];

export function Footer() {
  const pathname = usePathname();

  return (
    <>
      <footer className="border-t border-[var(--outline-variant)] bg-[var(--surface-container-low)] py-6 mt-auto text-xs text-[var(--on-surface-variant)]">
      <div className="container max-w-7xl mx-auto px-4 space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center md:text-left">
            <h3 className="font-extrabold text-sm text-[var(--primary)] flex items-center justify-center md:justify-start gap-2">
              <img 
                src="/tarimsaledanisman111.svg" 
                alt="Tarımsal e-Danışman Logo" 
                className="w-5 h-5 object-contain shrink-0" 
              />
              <span>Tarımsal e-Danışman</span>
            </h3>
            <p className="text-[11px] text-[var(--on-surface-variant)]">
              Çiftçiler ve Tarım Gönüllülerinin Buluşma Noktası • Hobitohum.com Topluluk Platformu
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-semibold">
            <Link href="/duyurular" className="hover:text-[var(--primary)] text-[var(--primary)] font-bold transition-colors">📢 Duyurular</Link>
            <Link href="/telif-ve-yasal-uyari" className="hover:text-[var(--primary)] font-bold text-amber-700 dark:text-amber-400 transition-colors">⚖️ Telif</Link>
            <Link href="/topluluk-kurallari" className="hover:text-[var(--primary)] transition-colors">Topluluk Kuralları</Link>
            <Link href="/kullanici-sozlesmesi" className="hover:text-[var(--primary)] transition-colors">Kullanıcı Sözleşmesi</Link>
            <Link href="/gizlilik-politikasi" className="hover:text-[var(--primary)] transition-colors">Gizlilik Politikası</Link>
          </div>
        </div>

        <div className="border-t border-[var(--outline-variant)]/40 pt-3 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px]">
          <p>{LEGAL_COPYRIGHT_SHORT}</p>
          <p className="text-[10px] text-[var(--on-surface-variant)]/70">
            5846 Sayılı FSEK Uyarınca Korunmaktadır.
          </p>
        </div>

        {/* Ortalı Kısaltılmış Telif Uyarısı Metni ve (...) Linki */}
        <div className="pt-1 text-center text-[11px] text-[var(--on-surface-variant)] border-t border-[var(--outline-variant)]/20">
          <p>
            {FOOTER_DISCLAIMER_TEXT}
            <Link 
              href="/telif-ve-yasal-uyari" 
              className="font-extrabold text-[var(--primary)] hover:underline ml-1 px-1 py-0.5 rounded bg-[var(--primary)]/10"
              title="Yasal uyarının devamını okumak için tıklayın"
            >
              ...
            </Link>
          </p>
        </div>
      </div>
    </footer>
    <StickyFooterBar />
    </>
  );
}
