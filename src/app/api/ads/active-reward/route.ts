import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

import { sortAndShuffleAds } from "@/lib/adUtils";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }

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
    const dailyLimit = setting ? parseInt(setting.value) : 4;

    if (todayRewardsCount >= dailyLimit) {
      return NextResponse.json({ ad: null, dailyLimitReached: true });
    }

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
      console.warn("Order li sorgu başarısız, varsayılan sorguya dönülüyor:", dbErr);
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

    const filtered = ads.filter(ad => ad.impressionLimit === null || ad.impressionCount < ad.impressionLimit);
    const activeAd = filtered.length > 0 ? filtered[0] : null;

    return NextResponse.json({ ad: activeAd, ads: filtered, dailyLimitReached: false });
  } catch (error) {
    console.error("Aktif reklam alma hatası:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
