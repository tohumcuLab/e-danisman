import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import WatchAdClient from "@/components/shared/WatchAdClient";

import { sortAndShuffleAds } from "@/lib/adUtils";

export const dynamic = "force-dynamic";

export default async function KrediKazanPage() {
  try {
    const session = await auth();
    const isLoggedIn = Boolean(session?.user?.id);

    let todayRewardsCount = 0;
    const setting = await prisma.systemSetting.findUnique({ where: { key: "DAILY_AD_LIMIT" } }).catch(() => null);
    const dailyLimit = setting && !isNaN(parseInt(setting.value, 10)) ? parseInt(setting.value, 10) : 5;

    // Eğer kullanıcı giriş yapmışsa bugün kaç reklam izlediğini hesapla
    if (isLoggedIn && session?.user?.id) {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      todayRewardsCount = await prisma.credit.count({
        where: {
          userId: session.user.id,
          reason: "AD_REWARD",
          createdAt: { gte: startOfDay }
        }
      }).catch(() => 0);
    }

    const dailyLimitReached = isLoggedIn && todayRewardsCount >= dailyLimit;

    let validAds: any[] = [];

    if (!dailyLimitReached) {
      let ads: any[] = [];
      try {
        ads = await prisma.ad.findMany({
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
          },
          orderBy: [
            { order: "asc" },
            { createdAt: "desc" }
          ]
        });
      } catch (dbErr) {
        console.warn("Order sıralamalı sorgu başarısız, varsayılana dönülüyor:", dbErr);
        ads = await prisma.ad.findMany({
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
          },
          orderBy: { createdAt: "desc" }
        }).catch(() => []);
      }

      validAds = ads.filter((ad: any) => ad.impressionLimit === null || ad.impressionCount < ad.impressionLimit);
    }

    return (
      <div className="container max-w-2xl py-8 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-[var(--primary)]">Kredi Kazan</h1>
          <p className="text-sm text-[var(--on-surface-variant)] max-w-lg mx-auto leading-relaxed">
            Reklam izleyerek kredi kazanabilir ve uzmanlarımıza sormak istediğiniz sorular için bu kredileri kullanabilirsiniz.
          </p>
          {isLoggedIn && !dailyLimitReached && (
            <div className="text-xs font-bold text-[var(--secondary)] bg-[var(--secondary)]/10 px-3 py-1 rounded-full inline-block">
              Bugünkü Kalan Hakkınız: {dailyLimit - todayRewardsCount} / {dailyLimit}
            </div>
          )}
        </div>

        <WatchAdClient 
          ads={validAds} 
          dailyLimitReached={dailyLimitReached}
          isLoggedIn={isLoggedIn}
          user={session?.user || null}
        />
      </div>
    );
  } catch (error) {
    console.error("KrediKazanPage yüklenme hatası:", error);
    return (
      <div className="container max-w-2xl py-8 text-center">
        <div className="card p-8">
          <div className="text-4xl mb-3">⚠️</div>
          <h1 className="text-xl font-bold mb-2">Sayfa Yüklenirken Bir Aksaklık Oluştu</h1>
          <p className="text-sm text-[var(--on-surface-variant)] mb-4">
            Sistem güncelleniyor olabilir. Lütfen birkaç saniye sonra sayfayı yenileyiniz.
          </p>
          <a
            href="/kredi-kazan"
            className="btn btn-primary px-6 py-2 rounded-lg text-sm inline-block font-semibold"
          >
            🔄 Yeniden Dene
          </a>
        </div>
      </div>
    );
  }
}
