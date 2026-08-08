import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 403 });
    }

    const { expertId, amountTl, points, weekStartDate } = await req.json();

    if (!expertId || amountTl === undefined || points === undefined || !weekStartDate) {
      return NextResponse.json({ error: "Eksik bilgi" }, { status: 400 });
    }

    const start = new Date(weekStartDate);
    const end = new Date(start);
    end.setDate(end.getDate() + 7);
    end.setSeconds(end.getSeconds() - 1);

    const payment = await prisma.expertPayment.create({
      data: {
        expertId,
        amountTl,
        totalPoints: points,
        weekStartDate: start,
        weekEndDate: end,
        status: "PAID"
      }
    });

    // Uzmana bildirim gönderelim
    await prisma.notification.create({
      data: {
        userId: expertId,
        type: "PAYMENT",
        message: `Haftalık uzmanlık ödemeniz (${amountTl} TL) yapıldı olarak işaretlendi.`
      }
    });

    return NextResponse.json({ success: true, payment }, { status: 200 });

  } catch (error) {
    console.error("Ödeme ekleme hatası:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
