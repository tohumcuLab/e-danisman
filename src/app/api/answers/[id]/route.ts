import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { removeExpertScore } from "@/lib/expertScore";

// CEVAP DÜZENLE (PUT)
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Giriş yapmalısınız" }, { status: 401 });
    }

    const { id: answerId } = await params;
    const { body } = await req.json();

    if (!body || body.trim().length === 0) {
      return NextResponse.json({ error: "Cevap metni boş olamaz" }, { status: 400 });
    }

    const answer = await prisma.answer.findUnique({
      where: { id: answerId },
      include: { user: true, likes: true }
    });

    if (!answer) {
      return NextResponse.json({ error: "Cevap bulunamadı" }, { status: 404 });
    }

    // Sahibi veya Admin mi?
    if (answer.userId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Bu cevabı düzenleme yetkiniz yok" }, { status: 403 });
    }

    const previousLikeCount = answer.likeCount;

    // Transaction: Cevap içeriğini güncelle, beğenileri sil, beğeni sayısını 0 yap
    const updatedAnswer = await prisma.$transaction(async (tx) => {
      // 1. Tüm beğenileri sil
      await tx.answerLike.deleteMany({
        where: { answerId }
      });

      // 2. Cevabı güncelle
      return await tx.answer.update({
        where: { id: answerId },
        data: {
          body,
          likeCount: 0
        }
      });
    });

    // UZMAN DANIŞMAN PUAN SİSTEMİ - Beğeniler sıfırlandığı için puanları düş
    if (answer.user.role === "EXPERT" && previousLikeCount > 0) {
      // Önceki her beğeni için silme logu atıyoruz
      for (let i = 0; i < previousLikeCount; i++) {
        await removeExpertScore(answer.userId, "LIKE", answerId);
      }
    }

    return NextResponse.json({ message: "Cevabınız düzenlendi. Beğeniler sıfırlandı.", answer: updatedAnswer }, { status: 200 });

  } catch (error) {
    console.error("Cevap düzenleme hatası:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

// CEVAP SİL (DELETE)
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Giriş yapmalısınız" }, { status: 401 });
    }

    const { id: answerId } = await params;

    const answer = await prisma.answer.findUnique({
      where: { id: answerId },
      include: { user: true }
    });

    if (!answer) {
      return NextResponse.json({ error: "Cevap bulunamadı" }, { status: 404 });
    }

    // Sahibi veya Admin mi?
    if (answer.userId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Bu cevabı silme yetkiniz yok" }, { status: 403 });
    }

    // UZMAN DANIŞMAN PUAN SİSTEMİ - Cevap silindiği için puanları düş
    if (answer.user.role === "EXPERT") {
      await removeExpertScore(answer.userId, "ANSWER", answerId);
      if (answer.isAccepted) {
        await removeExpertScore(answer.userId, "BEST_ANSWER", answerId);
      }
      if (answer.likeCount > 0) {
        for (let i = 0; i < answer.likeCount; i++) {
          await removeExpertScore(answer.userId, "LIKE", answerId);
        }
      }
    }

    // Cevabı sil (cascade ile answerLike'lar silinir)
    await prisma.answer.delete({
      where: { id: answerId }
    });

    return NextResponse.json({ message: "Cevap silindi" }, { status: 200 });

  } catch (error) {
    console.error("Cevap silme hatası:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
