import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(req: Request) {
  try {
    const session = await auth();
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

    // Ödül miktarını belirle
    let baseReward = ad.creditReward && ad.creditReward > 0 ? ad.creditReward : 0;
    if (baseReward <= 0) {
      const adRewardSetting = await prisma.systemSetting.findUnique({
        where: { key: "USER_AD_REWARD_CREDIT" },
      });
      baseReward = adRewardSetting && !isNaN(parseInt(adRewardSetting.value, 10))
        ? parseInt(adRewardSetting.value, 10)
        : 1;
    }

    // 1. DURUM: MİSAFİR KULLANICI (Oturum Açmamış)
    if (!session?.user?.id) {
      // Reklam gösterimini artır
      await prisma.$transaction(async (tx) => {
        await tx.ad.update({
          where: { id: ad.id },
          data: { impressionCount: { increment: 1 } }
        });

        if (ad.impressionLimit && ad.impressionCount + 1 >= ad.impressionLimit) {
          await tx.ad.update({
            where: { id: ad.id },
            data: { isActive: false }
          });
        }
      });

      return NextResponse.json({
        success: true,
        isGuest: true,
        reward: baseReward,
        message: `Tebrikler! +${baseReward} Kredi kazandınız.`,
        adId: ad.id,
      }, { status: 200 });
    }

    // 2. DURUM: GİRİŞ YAPMIŞ KULLANICI
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

    // Kredi miktarını hesapla (100 bakiye sınırı aşılmayacak şekilde)
    let rewardToGive = baseReward;
    if (user.credits + rewardToGive > 100) {
      rewardToGive = Math.max(0, 100 - user.credits);
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

      // Kullanıcıya kredi ver
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
      success: true,
      isGuest: false,
      message: `Tebrikler! ${rewardToGive} kredi hesabınıza yüklendi.`,
      reward: rewardToGive
    }, { status: 200 });

  } catch (error) {
    console.error("Ödül kazanma hatası:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
