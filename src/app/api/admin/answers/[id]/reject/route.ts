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

    const answer = await prisma.answer.findUnique({
      where: { id },
      include: {
        question: { select: { id: true, title: true } },
      },
    });

    if (!answer) {
      return NextResponse.json({ error: "Cevap bulunamadı" }, { status: 404 });
    }

    // Uzmana bildirim gönder
    await prisma.notification.create({
      data: {
        userId: answer.userId,
        type: "ANSWER_REJECTED",
        message: `"${answer.question.title.substring(0, 30)}..." sorusuna yazdığınız cevap içerik kurallarına uymadığı için reddedilmiştir.`,
        relatedId: answer.question.id,
      },
    });

    // Cevabı Sil veya Statüsünü REJECTED yap
    await prisma.answer.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Cevap reddedildi ve silindi." });
  } catch (error) {
    console.error("Answer rejection error:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
