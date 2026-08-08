import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { addExpertScore } from "@/lib/expertScore";

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
        question: { select: { id: true, title: true, userId: true } },
        user: { select: { id: true, role: true } },
      },
    });

    if (!answer) {
      return NextResponse.json({ error: "Cevap bulunamadı" }, { status: 404 });
    }

    // Cevabı Onayla
    await prisma.answer.update({
      where: { id },
      data: { status: "APPROVED" },
    });

    // Eğer uzmansa ve puan daha önce eklenmediyse puan ver
    if (answer.user.role === "EXPERT") {
      await addExpertScore(answer.userId, "ANSWER", answer.id);
    }

    // Uzmana bildirim gönder
    await prisma.notification.create({
      data: {
        userId: answer.userId,
        type: "ANSWER_APPROVED",
        message: `Tebrikler! "${answer.question.title.substring(0, 30)}..." sorusuna verdiğiniz cevap onaylandı ve puanınız tanımlandı.`,
        relatedId: answer.question.id,
      },
    });

    // Soruyu soran kullanıcıya da bildirim gönder
    if (answer.question.userId !== answer.userId) {
      await prisma.notification.create({
        data: {
          userId: answer.question.userId,
          type: "NEW_ANSWER",
          message: `"${answer.question.title.substring(0, 30)}..." sorunuza bir uzman cevabı yayınlandı.`,
          relatedId: answer.question.id,
        },
      });
    }

    return NextResponse.json({ success: true, message: "Cevap onaylandı ve yayınlandı." });
  } catch (error) {
    console.error("Answer approval error:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
