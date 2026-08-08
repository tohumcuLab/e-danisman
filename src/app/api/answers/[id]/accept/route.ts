import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Giriş yapmalısınız" }, { status: 401 });
    }

    const { id: answerId } = await params;
    const userId = session.user.id;

    const answer = await prisma.answer.findUnique({
      where: { id: answerId },
      include: { question: true, user: true }
    });

    if (!answer) {
      return NextResponse.json({ error: "Cevap bulunamadı" }, { status: 404 });
    }

    if (answer.question.userId !== userId) {
      return NextResponse.json({ error: "Sadece soruyu soran kişi en iyi cevabı seçebilir" }, { status: 403 });
    }

    if (answer.isAccepted) {
      return NextResponse.json({ error: "Bu cevap zaten en iyi cevap seçilmiş" }, { status: 400 });
    }

    // Başka kabul edilmiş cevap var mı kontrolü (opsiyonel ama sağlıklı)
    const existingAccepted = await prisma.answer.findFirst({
      where: { questionId: answer.questionId, isAccepted: true }
    });

    if (existingAccepted) {
      return NextResponse.json({ error: "Bu soru için zaten en iyi cevap seçilmiş" }, { status: 400 });
    }

    // Cevabı kabul edildi olarak işaretle
    await prisma.answer.update({
      where: { id: answerId },
      data: { isAccepted: true }
    });

    // UZMAN DANIŞMAN PUAN SİSTEMİ - En iyi cevap (Teşekkür yerine geçer)
    if (answer.user.role === "EXPERT") {
      const { addExpertScore } = await import("@/lib/expertScore");
      await addExpertScore(answer.userId, "BEST_ANSWER", answerId);
    }

    // Cevap sahibine bildirim gönder (Kendi sorusu değilse)
    if (answer.userId !== userId) {
      await prisma.notification.create({
        data: {
          userId: answer.userId,
          type: "ANSWER_ACCEPTED",
          message: `"${answer.question.title.substring(0, 35)}..." sorusundaki cevabınız 'En İyi Cevap' seçildi! ⭐`,
          relatedId: answer.questionId,
        }
      });
    }

    return NextResponse.json({ message: "En iyi cevap olarak seçildi" }, { status: 200 });
  } catch (error) {
    console.error("En iyi cevap seçme hatası:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
