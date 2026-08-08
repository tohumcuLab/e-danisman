import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import WatchAdClient from "@/components/shared/WatchAdClient";

export const dynamic = "force-dynamic";

export default async function KrediKazanPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/giris?callbackUrl=/kredi-kazan");
  }

  // Kullanıcının bugün kaç reklam izlediğini bul
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const todayRewardsCount = await prisma.credit.count({
    where: {
      userId: session.user.id,
      reason: "AD_REWARD",
      createdAt: { gte: startOfDay }
    }
  });

  const setting = await prisma.systemSetting.findUnique({ where: { key: "DAILY_AD_LIMIT" } });
  const dailyLimit = setting && !isNaN(parseInt(setting.value, 10)) ? parseInt(setting.value, 10) : 5;

  const dailyLimitReached = todayRewardsCount >= dailyLimit;

  let validAds: any[] = [];

  if (!dailyLimitReached) {
    const ads = await prisma.ad.findMany({
      where: {
        isActive: true,
        OR: [
          { placement: "REWARD" },
          { type: "REWARD_VIDEO" }
        ],
        AND: [
          {
            OR: [
              { endDate: null },
              { endDate: { gte: new Date() } }
            ]
          }
        ]
      }
    });

    validAds = ads.filter((ad: any) => ad.impressionLimit === null || ad.impressionCount < ad.impressionLimit);
  }

  return (
    <div className="container max-w-2xl py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2 text-[var(--primary)]">Kredi Kazan</h1>
        <p className="text-[var(--on-surface-variant)]">
          Reklam izleyerek kredi kazanabilir ve sormak istediğiniz sorular için bu kredileri kullanabilirsiniz.
        </p>
        {!dailyLimitReached && (
          <div className="mt-2 text-sm font-semibold text-[var(--secondary)]">
            Bugünkü Hakkınız: {dailyLimit - todayRewardsCount} / {dailyLimit}
          </div>
        )}
      </div>

      <WatchAdClient ads={validAds} dailyLimitReached={dailyLimitReached} />
    </div>
  );
}
