import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { amount } = body;

    if (!amount || typeof amount !== "number" || amount <= 0) {
      return NextResponse.json({ error: "Geçersiz kredi miktarı." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return NextResponse.json({ error: "Kullanıcı bulunamadı." }, { status: 404 });
    }

    // Update user credits
    await prisma.user.update({
      where: { id },
      data: {
        credits: { increment: amount },
      },
    });

    // Create a credit log
    await prisma.credit.create({
      data: {
        userId: id,
        amount,
        type: "EARN",
        reason: "Admin Manuel Kredi Yüklemesi",
      },
    });

    // Create a transaction record
    await prisma.transaction.create({
      data: {
        userId: id,
        amount: 0, // Admin manuel
        type: "CREDITS",
        status: "COMPLETED",
        details: `ADMIN_MANUAL_ASSIGN_${amount}_CREDITS`,
      },
    });

    // Send Notification
    await prisma.notification.create({
      data: {
        userId: id,
        type: "CREDIT_EARNED",
        message: `Hesabınıza yönetici tarafından ${amount} kredi yüklendi!`,
      },
    });

    return NextResponse.json({ success: true, added: amount });
  } catch (error: any) {
    console.error("Credit assignment error:", error);
    return NextResponse.json(
      { error: "İşlem sırasında bir hata oluştu." },
      { status: 500 }
    );
  }
}
