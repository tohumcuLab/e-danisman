import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }

    const { adId } = await req.json();
    if (!adId) {
      return NextResponse.json({ error: "Reklam ID zorunludur" }, { status: 400 });
    }

    // Reklamı bul
    const ad = await prisma.ad.findUnique({ where: { id: adId } });
    if (!ad || (ad.placement !== "REWARD" && ad.type !== "REWARD_VIDEO") || !ad.isActive) {
      return NextResponse.json({ error: "Geçersiz veya pasif reklam" }, { status: 400 });
    }

    // Limit ve Tarih Kontrolü
    if (ad.endDate && new Date() > ad.endDate) {
      return NextResponse.json({ error: "Reklamın süresi dolmuş" }, { status: 400 });
    }
    if (ad.impressionLimit && ad.impressionCount >= ad.impressionLimit) {
      return NextResponse.json({ error: "Reklam gösterim limitine ulaştı" }, { status: 400 });
    }

    // Kullanıcının mevcut kredisi
    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user) {
      return NextResponse.json({ error: "Kullanıcı bulunamadı" }, { status: 404 });
    }

    // 100 Kredi Sınırı Kontrolü
    if (user.credits >= 100) {
      return NextResponse.json({ error: "Maksimum kredi (100) sınırına ulaştınız." }, { status: 400 });
    }

    // Günlük İzleme Limiti Kontrolü
    const setting = await prisma.systemSetting.findUnique({ where: { key: "DAILY_AD_LIMIT" } });
    const dailyLimit = setting ? parseInt(setting.value) : 4; // Varsayılan 4

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const todayRewardsCount = await prisma.credit.count({
      where: {
        userId: user.id,
        reason: "AD_REWARD",
        createdAt: { gte: startOfDay }
      }
    });

    if (todayRewardsCount >= dailyLimit) {
      return NextResponse.json({ error: `Günlük reklam izleme limitinize (${dailyLimit}) ulaştınız. Lütfen yarın tekrar deneyin.` }, { status: 400 });
    }

    // Dynamically fetch ad reward setting
    const adRewardSetting = await prisma.systemSetting.findUnique({
      where: { key: "USER_AD_REWARD_CREDIT" },
    });
    const customAdReward = adRewardSetting && !isNaN(parseInt(adRewardSetting.value, 10))
      ? parseInt(adRewardSetting.value, 10)
      : (ad.creditReward > 0 ? ad.creditReward : 5);

    // Kredi miktarını hesapla (100'ü geçmeyecek şekilde)
    let rewardToGive = customAdReward;
    if (user.credits + rewardToGive > 100) {
      rewardToGive = 100 - user.credits;
    }

    // İşlemi gerçekleştir
    await prisma.$transaction(async (tx) => {
      // Reklam gösterimini artır
      await tx.ad.update({
        where: { id: ad.id },
        data: { impressionCount: { increment: 1 } }
      });

      // Eğer bu gösterim ile limit dolduysa reklamı inaktif yap
      if (ad.impressionLimit && ad.impressionCount + 1 >= ad.impressionLimit) {
        await tx.ad.update({
          where: { id: ad.id },
          data: { isActive: false }
        });
      }

      // Kullanıcıya kredi ver (Sadece verilecek ödül > 0 ise, ama 0 olsa bile gösterim sayılır)
      if (rewardToGive > 0) {
        await tx.user.update({
          where: { id: user.id },
          data: { credits: { increment: rewardToGive } }
        });

        await tx.credit.create({
          data: {
            userId: user.id,
            amount: rewardToGive,
            type: "EARN",
            reason: "AD_REWARD"
          }
        });
      }
    });

    return NextResponse.json({ 
      message: `Tebrikler! ${rewardToGive} kredi kazandınız.`,
      reward: rewardToGive
    }, { status: 200 });

  } catch (error) {
    console.error("Ödül kazanma hatası:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
