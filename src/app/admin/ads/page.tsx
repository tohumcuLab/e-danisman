import { prisma } from "@/lib/prisma";
import AdManagerContainer from "@/components/admin/ads/AdManagerContainer";

export const dynamic = "force-dynamic";

export default async function AdminAdsPage() {
  const ads = await prisma.ad.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-2 sm:p-4 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-4 border-b border-[var(--outline-variant)]">
        <div>
          <h1 className="text-2xl font-black text-[var(--on-surface)] tracking-tight">
            Reklam ve Gelir Yönetimi
          </h1>
          <p className="text-xs text-[var(--on-surface-variant)] mt-1">
            Google AdSense ve Manuel sponsorluk reklamlarını ayrı sekmelerde yönetin, gösterim ve tıklama istatistiklerini takip edin.
          </p>
        </div>
      </div>

      <AdManagerContainer initialAds={ads} />
    </div>
  );
}
