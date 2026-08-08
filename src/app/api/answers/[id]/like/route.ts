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

    // Cevabı bul
    const answer = await prisma.answer.findUnique({
      where: { id: answerId },
      include: { user: true }
    });

    if (!answer) {
      return NextResponse.json({ error: "Cevap bulunamadı" }, { status: 404 });
    }

    // Kendi cevabını beğenme engeli (opsiyonel ama sağlıklı)
    if (answer.userId === userId) {
      return NextResponse.json({ error: "Kendi cevabınızı beğenemezsiniz" }, { status: 400 });
    }

    // Beğeni kontrolü
    const existingLike = await prisma.answerLike.findUnique({
      where: {
        answerId_userId: {
          answerId,
          userId
        }
      }
    });

    if (existingLike) {
      return NextResponse.json({ error: "Bu cevabı zaten beğendiniz" }, { status: 400 });
    }

    // Transaction: Beğeni ekle, beğeni sayısını artır ve cevap sahibinin kredisi 100'den küçükse 1 ekle (max 100)
    await prisma.$transaction(async (tx) => {
      // 1. Beğeni kaydı oluştur
      await tx.answerLike.create({
        data: {
          answerId,
          userId
        }
      });

      // 2. Beğeni sayısını artır
      await tx.answer.update({
        where: { id: answerId },
        data: { likeCount: { increment: 1 } }
      });

      // 3. Cevap yazan kullanıcının kredisini kontrol et ve artır (Maksimum 100 kredi)
      const answerAuthor = await tx.user.findUnique({
        where: { id: answer.userId }
      });

      if (answerAuthor && answerAuthor.credits < 100) {
        await tx.user.update({
          where: { id: answer.userId },
          data: { credits: { increment: 1 } }
        });

        await tx.credit.create({
          data: {
            userId: answer.userId,
            amount: 1,
            type: "EARN",
            reason: "Cevabınız bir kullanıcı tarafından beğenildi (+1 Kredi)"
          }
        });
      }
    });

    // UZMAN DANIŞMAN PUAN SİSTEMİ
    if (answer.user.role === "EXPERT") {
      // Spam kontrolü: Bu kullanıcı bu hafta bu uzmanın cevaplarını kaç kez beğenmiş?
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const recentLikes = await prisma.answerLike.count({
        where: {
          userId: userId,
          answer: {
            userId: answer.userId
          },
          createdAt: {
            gte: oneWeekAgo
          }
        }
      });

      // Eğer 3'ten az beğeni yaptıysa puan ver
      if (recentLikes <= 3) {
        const { addExpertScore } = await import("@/lib/expertScore");
        await addExpertScore(answer.userId, "LIKE", answerId);
      }
    }

    // Cevap sahibine bildirim gönder (Kendi cevabı değilse)
    if (answer.userId !== userId) {
      await prisma.notification.create({
        data: {
          userId: answer.userId,
          type: "ANSWER_LIKED",
          message: "Cevabınız bir kullanıcı tarafından beğenildi. 👍 (+1 Kredi)",
          relatedId: answer.questionId,
        }
      });
    }

    return NextResponse.json({ message: "Beğenildi" }, { status: 200 });

  } catch (error) {
    console.error("Beğeni hatası:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
