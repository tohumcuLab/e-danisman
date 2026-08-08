import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(req: Request) {
  try {
    const session = await auth();
    // Yalnızca ADMIN yetkisi değiştirebilir
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 403 });
    }

    const { userId, role } = await req.json();

    if (!userId || !role) {
      return NextResponse.json({ error: "Kullanıcı ID ve Rol zorunludur" }, { status: 400 });
    }

    const validRoles = ["USER", "EXPERT", "ADMIN"];
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: "Geçersiz rol" }, { status: 400 });
    }

    // Kendini USER'a düşürmeyi engelle (Opsiyonel ama güvenli)
    if (userId === session.user.id && role !== "ADMIN") {
      return NextResponse.json({ error: "Kendi admin yetkinizi kaldıramazsınız" }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role }
    });

    // Kullanıcıya bildirim gönderelim
    await prisma.notification.create({
      data: {
        userId,
        type: "SYSTEM",
        message: `Hesap yetkiniz yönetici tarafından güncellendi. Yeni yetkiniz: ${role === "EXPERT" ? "Uzman Danışman" : role}`
      }
    });

    return NextResponse.json({ message: "Rol güncellendi", user: updatedUser }, { status: 200 });
  } catch (error) {
    console.error("Rol güncelleme hatası:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
