import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { RoleChangeDropdown } from "@/components/admin/RoleChangeDropdown";
import UserCreditSettingsForm from "@/components/admin/UserCreditSettingsForm";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 50;

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const resolvedParams = await searchParams;
  const query = resolvedParams.q?.trim() || "";
  const rawPage = parseInt(resolvedParams.page || "1", 10);
  const currentPage = isNaN(rawPage) || rawPage < 1 ? 1 : rawPage;

  const allSettings = await prisma.systemSetting.findMany();
  const settingsMap = allSettings.reduce((acc, curr) => {
    acc[curr.key] = curr.value;
    return acc;
  }, {} as Record<string, string>);

  const initialCreditSettings = {
    welcomeCredit: settingsMap["USER_WELCOME_CREDIT"] || "10",
    adRewardCredit: settingsMap["USER_AD_REWARD_CREDIT"] || "5",
    dailyAdLimit: settingsMap["DAILY_AD_LIMIT"] || "5",
    questionCost: settingsMap["QUESTION_BASE_CREDIT_COST"] || "4",
  };

  const whereCondition = query
    ? {
        OR: [
          { name: { contains: query } },
          { firstName: { contains: query } },
          { lastName: { contains: query } },
          { username: { contains: query } },
          { phone: { contains: query } },
          { tcNo: { contains: query } },
          { email: { contains: query } },
        ],
      }
    : {};

  // Sayfalama hesabı
  const totalUsers = await prisma.user.count({ where: whereCondition });
  const totalPages = Math.max(1, Math.ceil(totalUsers / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const skip = (safePage - 1) * PAGE_SIZE;

  const users = await prisma.user.findMany({
    where: whereCondition,
    orderBy: { createdAt: "desc" },
    skip,
    take: PAGE_SIZE,
    include: {
      _count: { select: { questions: true, answers: true } },
    },
  });

  const rangeStart = totalUsers > 0 ? skip + 1 : 0;
  const rangeEnd = Math.min(skip + PAGE_SIZE, totalUsers);

  // Sayfa numarası butonlarını oluşturma (max 7 sayfa çipi)
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (safePage > 3) pages.push("...");
      const start = Math.max(2, safePage - 1);
      const end = Math.min(totalPages - 1, safePage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (safePage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  const createPageUrl = (pageNumber: number) => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    params.set("page", pageNumber.toString());
    return `/admin/users?${params.toString()}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--on-surface)]">Kullanıcı Yönetimi ve Kredi İşlemleri</h1>
          <p className="text-xs text-[var(--on-surface-variant)] mt-1">
            Üye hesaplarını sorgulayabilir, rollerini düzenleyebilir ve üye kredi kazanım/harcama katsayılarını yönetebilirsiniz.
          </p>
        </div>

        {/* Arama Kutusu */}
        <form method="GET" className="flex items-center gap-2">
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Ad, Rumuz, Tel, TC veya E-posta ara..."
            className="bg-[var(--surface-container-lowest)] border border-[var(--outline-variant)] rounded-xl px-4 py-2.5 text-xs text-[var(--on-surface)] focus:border-[var(--primary)] outline-none min-w-[260px]"
          />
          <button
            type="submit"
            className="bg-[var(--primary)] text-white font-bold text-xs px-4 py-2.5 rounded-xl hover:bg-[var(--primary-container)] transition-all cursor-pointer shrink-0"
          >
            Ara 🔍
          </button>
          {query && (
            <Link
              href="/admin/users"
              className="bg-gray-200 dark:bg-gray-700 text-xs font-bold px-3 py-2.5 rounded-xl hover:bg-gray-300 transition-all shrink-0"
            >
              Temizle ✕
            </Link>
          )}
        </form>
      </div>

      {/* Dinamik Üye Kredi Ayarları Formu */}
      <UserCreditSettingsForm initialSettings={initialCreditSettings} />

      {/* Kullanıcı Tablosu */}
      <div className="card overflow-hidden shadow-md space-y-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[var(--surface-variant)] text-[var(--on-surface-variant)] border-b border-[var(--outline-variant)] text-xs uppercase tracking-wider">
              <tr>
                <th className="p-4 font-bold">Kullanıcı & Rumuz</th>
                <th className="p-4 font-bold">İletişim & TC</th>
                <th className="p-4 font-bold">Durum</th>
                <th className="p-4 font-bold">Rol</th>
                <th className="p-4 font-bold">Kredi</th>
                <th className="p-4 font-bold">Sorular / Cevaplar</th>
                <th className="p-4 font-bold text-right">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--outline-variant)]">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-xs text-[var(--on-surface-variant)]">
                    Arama kriterine uygun kullanıcı bulunamadı.
                  </td>
                </tr>
              ) : (
                users.map((user) => {
                  const now = new Date();
                  const isCurrentlyBanned = user.isBanned && (!user.bannedUntil || new Date(user.bannedUntil) > now);

                  return (
                    <tr key={user.id} className="hover:bg-[var(--surface-container)] transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-sm text-[var(--on-surface)] flex items-center gap-2">
                          <span>{user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.name || "İsimsiz"}</span>
                        </div>
                        <div className="text-xs text-[var(--primary)] font-semibold">
                          @{user.username || user.name || "rumuzsuz"}
                        </div>
                      </td>
                      <td className="p-4 text-xs space-y-0.5">
                        <div className="font-mono text-[var(--on-surface)]">📞 {user.phone || "—"}</div>
                        <div className="text-[var(--on-surface-variant)]">✉️ {user.email}</div>
                        {user.tcNo && <div className="text-[10px] text-gray-500 font-mono">🆔 TC: {user.tcNo}</div>}
                      </td>
                      <td className="p-4">
                        {isCurrentlyBanned ? (
                          <span className="bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300 text-[11px] font-extrabold px-2.5 py-1 rounded-md">
                            ⛔ BANLI
                          </span>
                        ) : (
                          <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 text-[11px] font-extrabold px-2.5 py-1 rounded-md">
                            ✅ Aktif
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        <RoleChangeDropdown userId={user.id} currentRole={user.role} />
                      </td>
                      <td className="p-4 font-extrabold text-[var(--primary)]">{user.credits} 🪙</td>
                      <td className="p-4 text-xs text-[var(--on-surface-variant)] font-semibold">
                        ❓ {user._count.questions} / 💬 {user._count.answers}
                      </td>
                      <td className="p-4 text-right whitespace-nowrap">
                        <Link
                          href={`/admin/users/${user.id}`}
                          className="btn bg-[var(--primary)]/10 hover:bg-[var(--primary)] text-[var(--primary)] hover:text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-all"
                        >
                          Profil & Detay ➔
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Alt Bilgi & Kontrol Alanı */}
        <div className="p-4 bg-[var(--surface-container-low)] border-t border-[var(--outline-variant)] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-[var(--on-surface-variant)] font-medium">
            Toplam <strong className="text-[var(--on-surface)]">{totalUsers}</strong> üyeden{" "}
            <strong className="text-[var(--on-surface)]">{rangeStart} - {rangeEnd}</strong> arası gösteriliyor (Sayfa {safePage} / {totalPages})
          </div>

          {totalPages > 1 && (
            <div className="flex items-center gap-1.5">
              {/* Önceki Butonu */}
              {safePage > 1 ? (
                <Link
                  href={createPageUrl(safePage - 1)}
                  className="px-3 py-1.5 text-xs font-bold bg-[var(--surface)] hover:bg-[var(--primary)]/10 text-[var(--on-surface)] hover:text-[var(--primary)] rounded-xl border border-[var(--outline-variant)] transition-all"
                >
                  ← Önceki
                </Link>
              ) : (
                <span className="px-3 py-1.5 text-xs font-bold text-[var(--on-surface-variant)] opacity-40 bg-[var(--surface-container-lowest)] rounded-xl border border-[var(--outline-variant)] cursor-not-allowed">
                  ← Önceki
                </span>
              )}

              {/* Sayfa Çipleri */}
              {getPageNumbers().map((pNum, idx) =>
                typeof pNum === "number" ? (
                  <Link
                    key={idx}
                    href={createPageUrl(pNum)}
                    className={`px-3 py-1.5 text-xs font-black rounded-xl border transition-all ${
                      pNum === safePage
                        ? "bg-[var(--primary)] text-white border-[var(--primary)] shadow-sm"
                        : "bg-[var(--surface)] hover:bg-[var(--primary)]/10 text-[var(--on-surface)] border-[var(--outline-variant)]"
                    }`}
                  >
                    {pNum}
                  </Link>
                ) : (
                  <span key={idx} className="px-2 py-1.5 text-xs text-[var(--on-surface-variant)]">
                    ...
                  </span>
                )
              )}

              {/* Sonraki Butonu */}
              {safePage < totalPages ? (
                <Link
                  href={createPageUrl(safePage + 1)}
                  className="px-3 py-1.5 text-xs font-bold bg-[var(--surface)] hover:bg-[var(--primary)]/10 text-[var(--on-surface)] hover:text-[var(--primary)] rounded-xl border border-[var(--outline-variant)] transition-all"
                >
                  Sonraki →
                </Link>
              ) : (
                <span className="px-3 py-1.5 text-xs font-bold text-[var(--on-surface-variant)] opacity-40 bg-[var(--surface-container-lowest)] rounded-xl border border-[var(--outline-variant)] cursor-not-allowed">
                  Sonraki →
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
