import { auth } from "@/auth";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function LeftSidebarWidgets() {
  const session = await auth();

  // 1. En çok kredi kazanan ilk 5 aktif danışmanı getir
  const topUsers = await prisma.user.findMany({
    take: 5,
    orderBy: { credits: "desc" },
    select: { id: true, name: true, credits: true }
  });

  // 2. En popüler en fazla 5 etiketi veritabanından getir
  let popularTags: string[] = [];
  try {
    const dbTags = await prisma.tag.findMany({
      take: 5,
      include: {
        _count: { select: { questions: true } }
      },
      orderBy: {
        questions: { _count: "desc" }
      }
    });
    popularTags = dbTags.map(t => t.name);
  } catch (err) {
    console.error("Etiketler getirilemedi:", err);
  }

  const defaultTags = ["OrganikGübre", "DamlaSulama", "HasatVakti", "FideBakımı", "ZararlıMücadelesi"];
  
  // Eksik kalan yerleri varsayılan etiketlerle tamamla ve KESİNLİKLE EN FAZLA 5 ETİKET ile sınırla
  const displayTags = [
    ...popularTags,
    ...defaultTags.filter(dt => !popularTags.some(pt => pt.toLowerCase() === dt.toLowerCase()))
  ].slice(0, 5);

  return (
    <section className="col-span-12 lg:col-span-3 space-y-6 lg:sticky lg:top-20 lg:self-start">
      {/* 1. Hoş Geldiniz Kartı */}
      <div className="card p-5 border-l-4 border-[var(--primary)] space-y-4">
        <div>
          <h2 className="text-xl font-bold text-[var(--primary)] mb-1">
            {session?.user ? `Hoş Geldiniz, ${session.user.name?.split(" ")[0]}! 🌿` : "Hoş Geldiniz 🌿"}
          </h2>
          <p className="text-xs text-[var(--on-surface-variant)] leading-relaxed">
            Bugün bahçenizde ve tarlanızda neler yetiştiriyorsunuz? Uzmanlarımız her zaman yanınızda.
          </p>
        </div>

        {session?.user ? (
          <Link 
            href="/profil" 
            className="flex items-center justify-between w-full bg-[#006537] hover:bg-[#74db98] hover:text-[#00391d] transition-all text-white p-3 rounded-xl font-bold text-xs shadow group"
          >
            <div className="flex items-center gap-2.5 overflow-hidden">
              {session.user.image ? (
                <img 
                  src={session.user.image} 
                  alt={session.user.name || "Kullanıcı"} 
                  className="w-7 h-7 rounded-full object-cover border border-white/50 group-hover:border-[#00391d]/50 shrink-0" 
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-white/20 group-hover:bg-[#00391d]/20 text-white group-hover:text-[#00391d] font-extrabold flex items-center justify-center text-xs shrink-0 border border-white/30 group-hover:border-[#00391d]/30">
                  {session.user.name?.charAt(0).toUpperCase() || "U"}
                </div>
              )}
              <span className="truncate font-extrabold text-white group-hover:text-[#00391d] text-xs">
                {session.user.name}
              </span>
            </div>
            <span className="text-[11px] text-white/80 group-hover:text-[#00391d] transition-colors shrink-0 font-bold">
              Profilim ➔
            </span>
          </Link>
        ) : (
          <Link 
            href="/giris" 
            className="flex items-center justify-between w-full bg-[#006537] hover:bg-[#74db98] hover:text-[#00391d] transition-all text-white px-4 py-3 rounded-xl font-bold text-xs shadow"
          >
            <span>🔑 Giriş Yap / Kayıt Ol</span>
            <span>➔</span>
          </Link>
        )}
      </div>

      {/* 2. En Aktif Danışmanlar Kutusu (Sadece Masaüstü Versiyonunda) */}
      <div className="hidden lg:flex card p-5 flex-col justify-between">
        <div>
          <h3 className="font-bold text-sm mb-3 flex items-center gap-1.5 text-[var(--on-surface)]">
            🏆 En Aktif Danışmanlar
          </h3>
          <div className="space-y-2">
            {topUsers.map((user) => (
              <Link 
                key={user.id} 
                href={`/kullanici/${user.id}`} 
                className="flex items-center justify-between border-b border-[var(--outline-variant)] last:border-0 pb-1.5 last:pb-0 text-xs group hover:bg-[var(--surface-variant)] p-1 rounded-lg transition-colors gap-2"
              >
                <div className="font-bold truncate flex-1 min-w-0 group-hover:text-[var(--primary)]">
                  {user.name}
                </div>
                <div className="font-extrabold text-[var(--primary)] text-xs bg-[var(--primary)]/10 px-2 py-0.5 rounded-md shrink-0 ml-auto">
                  {user.credits} 🪙
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* TÜMÜNÜ GÖR LİNKİ */}
        <div className="mt-3 pt-2.5 border-t border-[var(--outline-variant)] flex justify-end">
          <Link 
            href="/danismanlar" 
            className="text-xs font-bold text-[var(--primary)] hover:underline transition-colors flex items-center gap-1 group"
          >
            <span>Tümünü Gör</span>
            <span className="group-hover:translate-x-1 transition-transform">➔</span>
          </Link>
        </div>
      </div>

      {/* 3. Popüler Konular / Etiketler (Maksimum 5 Adet) */}
      <div className="hidden lg:block card p-5">
        <h3 className="text-xs font-bold text-[var(--on-surface-variant)] uppercase tracking-wider mb-3 flex items-center justify-between">
          <span>🔥 POPÜLER ETİKETLER</span>
          <span className="text-[10px] text-[var(--primary)] font-semibold lowercase">ilk 5</span>
        </h3>
        <div className="flex flex-wrap gap-2">
          {displayTags.map((tagName, idx) => (
            <Link
              key={idx}
              href={`/arama?q=${encodeURIComponent(tagName)}`}
              className="bg-[var(--surface-container-high)] px-3 py-1.5 rounded-full text-xs font-medium text-[var(--on-surface-variant)] border border-[var(--outline-variant)] hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors cursor-pointer"
            >
              #{tagName.replace(/^#/, "")}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
