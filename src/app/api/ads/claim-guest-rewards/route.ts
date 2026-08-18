import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkisiz erişim. Lütfen giriş yapın." }, { status: 401 });
    }

    const { credits } = await req.json();
    const parsedCredits = parseInt(credits, 10);

    if (isNaN(parsedCredits) || parsedCredits <= 0) {
      return NextResponse.json({ error: "Geçersiz kredi miktarı." }, { status: 400 });
    }

    // Maksimum tek seferde aktarılabilecek misafir kredisi güvenlik limiti (örn: max 20 kredi)
    const safeCredits = Math.min(parsedCredits, 20);

    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user) {
      return NextResponse.json({ error: "Kullanıcı bulunamadı." }, { status: 404 });
    }

    // 100 kredi tavan kontrolü
    let rewardToGive = safeCredits;
    if (user.credits + rewardToGive > 100) {
      rewardToGive = Math.max(0, 100 - user.credits);
    }

    if (rewardToGive <= 0) {
      return NextResponse.json({
        success: true,
        message: "Maksimum kredi (100) sınırına ulaştığınız için bakiye eklenemedi.",
        addedCredits: 0,
        currentCredits: user.credits,
      });
    }

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: user.id },
        data: { credits: { increment: rewardToGive } },
      });

      await tx.credit.create({
        data: {
          userId: user.id,
          amount: rewardToGive,
          type: "EARN",
          reason: "AD_REWARD",
        },
      });
    });

    return NextResponse.json({
      success: true,
      message: `🎉 Tebrikler! Misafirken kazandığınız ${rewardToGive} kredi hesabınıza aktarıldı.`,
      addedCredits: rewardToGive,
      currentCredits: user.credits + rewardToGive,
    });
  } catch (error) {
    console.error("Misafir kredi aktarma hatası:", error);
    return NextResponse.json({ error: "Sunucu hatası oluştu." }, { status: 500 });
  }
}
