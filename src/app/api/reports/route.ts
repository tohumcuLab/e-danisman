import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Giriş yapmalısınız" }, { status: 401 });
    }

    const { targetType, targetId, reason } = await req.json();

    if (!targetType || !targetId || !reason) {
      return NextResponse.json({ error: "Eksik bilgi" }, { status: 400 });
    }

    const report = await prisma.report.create({
      data: {
        reporterId: session.user.id,
        targetType, // "QUESTION", "ANSWER", "USER"
        targetId,
        reason,
        status: "PENDING"
      }
    });

    return NextResponse.json({ message: "Rapor başarıyla alındı", report }, { status: 201 });
  } catch (error) {
    console.error("Rapor oluşturma hatası:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
