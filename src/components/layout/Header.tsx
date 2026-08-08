import Link from "next/link";
import { auth } from "@/auth";
import { HeaderSearch } from "./HeaderSearch";
import { NotificationDropdown } from "./NotificationDropdown";
import { ContactDropdown } from "./ContactDropdown";
import { SideMenu } from "./SideMenu";

export async function Header() {
  const session = await auth();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[var(--outline-variant)] bg-[var(--surface-container)]">
      {/* Ana Header Alanı */}
      <div className="container py-2 sm:py-2.5 md:py-0 min-h-14 sm:min-h-16 flex flex-col md:flex-row items-center justify-between gap-2 md:gap-0">
        
        {/* Mobil & Desktop Üst Bar (Sol: Menü & Logo, Sağ (Mobilde): İkonlar) */}
        <div className="flex items-center justify-between w-full md:w-auto shrink-0 gap-2">
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            <SideMenu user={session?.user || null} />
            <Link href="/" className="flex items-center gap-1.5 sm:gap-2 font-bold text-base md:text-xl text-[var(--primary)] shrink-0 group">
              <img 
                src="/tarimsaledanisman111.svg" 
                alt="Tarımsal e-Danışman Logo" 
                className="w-7 h-7 sm:w-8 sm:h-8 object-contain shrink-0 transition-transform group-hover:scale-105" 
              />
              <div className="flex flex-col leading-none">
                <span className="text-[15px] sm:text-lg md:text-xl font-black tracking-tight whitespace-nowrap">
                  Tarımsal e-Danışman
                </span>
                <span className="text-[8px] sm:text-[9px] font-black tracking-wider text-amber-600 dark:text-amber-400 uppercase mt-0.5 whitespace-nowrap">
                  ÜRETİCİ DOSTU!
                </span>
              </div>
            </Link>
          </div>

          {/* Sağ İkonlar (Mobilde logo hizasında en sağda) */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 md:hidden">
            <ContactDropdown />
            {session?.user && (
              <NotificationDropdown />
            )}
          </div>
        </div>
        
        {/* Arama Alanı */}
        <div className="w-full md:flex-1 md:max-w-md md:mx-4">
          <HeaderSearch />
        </div>

        {/* Sağ İkonlar (Masaüstü görünüm için) */}
        <div className="hidden md:flex items-center gap-1.5 shrink-0">
          <ContactDropdown />
          {session?.user && (
            <NotificationDropdown />
          )}
        </div>
      </div>

      {/* İkinci Header (Second Header Bar - Dinamik Genişleyen) */}
      <div className="w-full bg-[#006537] text-white text-[11px] sm:text-xs font-bold py-1.5 px-3 sm:px-4 text-center border-t border-[#74db98]/30 flex items-center justify-center gap-1.5 shadow-inner">
        <span className="shrink-0 text-xs self-start sm:self-center mt-0.5 sm:mt-0">🌾</span>
        <span className="leading-snug sm:leading-normal">
          Türkiye'nin çeşitli bölgelerinde 20 yılda edindiğimiz tecrübemizi siz değerli üreticilerimizle paylaşıyoruz..
        </span>
      </div>
    </header>
  );
}
