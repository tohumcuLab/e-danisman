import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 403 });
    }

    const { id } = await params;
    const { action, reason } = await req.json();

    if (!action) {
      return NextResponse.json({ error: "İşlem türü zorunludur." }, { status: 400 });
    }

    const targetUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "Kullanıcı bulunamadı." }, { status: 404 });
    }

    let isBanned = targetUser.isBanned;
    let bannedUntil: Date | null = targetUser.bannedUntil;
    let banReason = targetUser.banReason;
    let notificationMsg = "";
    let notificationType = "ADMIN_WARNING";

    if (action === "WARN") {
      notificationType = "ADMIN_WARNING";
      notificationMsg = `⚠️ ADMİN UYARISI: ${reason || "Topluluk kurallarını ihlal ettiğiniz tespit edildi. Lütfen kurallara uyunuz."}`;
    } else if (action === "BAN_15_DAYS") {
      isBanned = true;
      const banDate = new Date();
      banDate.setDate(banDate.getDate() + 15);
      bannedUntil = banDate;
      banReason = reason || "Topluluk kurallarını ihlal sebebiyle 15 gün uzaklaştırma.";
      notificationType = "ADMIN_BAN_15";
      notificationMsg = `⛔ HESAP UZAKLAŞTIRILDI: Hesabınız 15 gün süreyle dondurulmuştur. Sebep: ${banReason}`;
    } else if (action === "BAN_PERMANENT") {
      isBanned = true;
      bannedUntil = new Date("2099-12-31");
      banReason = reason || "Ciddi topluluk kuralı ihlali sebebiyle süresiz uzaklaştırma.";
      notificationType = "ADMIN_BAN_PERMANENT";
      notificationMsg = `⛔ SÜRESİZ UZAKLAŞTIRMA: Hesabınız süresiz olarak engellenmiştir. Sebep: ${banReason}`;
    } else if (action === "UNBAN") {
      isBanned = false;
      bannedUntil = null;
      banReason = null;
      notificationType = "ADMIN_UNBAN";
      notificationMsg = `✅ CEZA KALDIRILDI: Hesabınızdaki engelleme kaldırılmıştır. Yeniden hoş geldiniz.`;
    } else {
      return NextResponse.json({ error: "Geçersiz işlem türü." }, { status: 400 });
    }

    // Kullanıcı durumunu güncelle
    await prisma.user.update({
      where: { id },
      data: {
        isBanned,
        bannedUntil,
        banReason,
      },
    });

    // Kullanıcıya bildirim kaydı ekle
    if (notificationMsg) {
      await prisma.notification.create({
        data: {
          userId: id,
          type: notificationType,
          message: notificationMsg,
        },
      });
    }

    return NextResponse.json({
      message: "İşlem başarıyla gerçekleştirildi.",
      user: { isBanned, bannedUntil, banReason },
    });
  } catch (error: any) {
    console.error("Moderasyon hatası:", error);
    return NextResponse.json({ error: error?.message || "Sunucu hatası" }, { status: 500 });
  }
}
