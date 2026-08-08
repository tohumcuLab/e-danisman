import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }

    const { body, questionId, parentId } = await req.json();

    if (!body || !questionId) {
      return NextResponse.json({ error: "Gerekli alanları doldurun" }, { status: 400 });
    }

    const userId = session.user.id;

    // Kullanıcı ban kontrolü ve rol çekimi
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, isBanned: true, bannedUntil: true, banReason: true }
    });

    if (currentUser?.isBanned && (!currentUser.bannedUntil || new Date(currentUser.bannedUntil) > new Date())) {
      return NextResponse.json(
        { error: `Hesabınız kısıtlanmıştır: ${currentUser.banReason || 'Topluluk kuralları ihlali.'}` },
        { status: 403 }
      );
    }

    // 1. Sorunun var olup olmadığını kontrol et
    const question = await prisma.question.findUnique({
      where: { id: questionId }
    });

    if (!question) {
      return NextResponse.json({ error: "Soru bulunamadı" }, { status: 404 });
    }

    // 2. Eğer bir cevaba YANIT veriliyorsa (parentId varsa), 1 Kredi kontrolü yap ve düş
    if (parentId) {
      const parentAnswer = await prisma.answer.findUnique({
        where: { id: parentId },
        include: { user: true }
      });

      if (!parentAnswer) {
        return NextResponse.json({ error: "Yanıtlanmak istenen cevap bulunamadı" }, { status: 404 });
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { credits: true }
      });

      if (!user || user.credits < 1) {
        return NextResponse.json({ error: "Yetersiz kredi! Bir cevaba yanıt vermek için en az 1 krediniz olmalıdır." }, { status: 403 });
      }

      // 1 Kredi düş
      await prisma.$transaction([
        prisma.user.update({
          where: { id: userId },
          data: { credits: { decrement: 1 } }
        }),
        prisma.credit.create({
          data: {
            userId,
            amount: -1,
            type: "SPENT",
            reason: "Cevaba yanıt verme (-1 Kredi)"
          }
        })
      ]);

      // Cevap sahibine bildirim gönder
      if (parentAnswer.userId !== userId) {
        await prisma.notification.create({
          data: {
            userId: parentAnswer.userId,
            type: "NEW_ANSWER",
            message: `Yazdığınız cevaba yeni bir yanıt geldi: "${body.substring(0, 30)}..."`,
            relatedId: question.id,
          }
        });
      }
    }

    const isExpert = currentUser?.role === "EXPERT" || session.user?.role === "EXPERT";
    const initialStatus = isExpert ? "PENDING_APPROVAL" : "APPROVED";

    // 3. Cevabı / Yanıtı oluştur
    const answer = await prisma.answer.create({
      data: {
        body,
        questionId,
        userId,
        parentId: parentId || null,
        status: initialStatus,
      },
      include: {
        user: { select: { id: true, name: true, image: true, avatarUrl: true, role: true } }
      }
    });

    if (initialStatus === "PENDING_APPROVAL") {
      // Uzmana bildirim gönder
      await prisma.notification.create({
        data: {
          userId,
          type: "ANSWER_PENDING",
          message: `Cevabınız yönetici onayına gönderilmiştir. Admin onayladıktan sonra yayına alınacaktır.`,
          relatedId: question.id,
        }
      });

      return NextResponse.json({
        message: "Cevabınız yönetici onayına gönderilmiştir. Admin onayladıktan sonra yayınlanacak ve puanınız eklenecektir.",
        pendingApproval: true,
        answer
      }, { status: 201 });
    }

    if (body.length >= 50) {
      const { addExpertScore } = await import("@/lib/expertScore");
      await addExpertScore(userId, "ANSWER", answer.id);
    }

    // Soruyu soran kullanıcıya bildirim gönder (Kendi cevabı değilse)
    if (question.userId !== userId && !parentId) {
      await prisma.notification.create({
        data: {
          userId: question.userId,
          type: "NEW_ANSWER",
          message: `"${question.title.substring(0, 35)}..." sorunuza yeni bir cevap verildi.`,
          relatedId: question.id,
        }
      });
    }

    return NextResponse.json({ message: parentId ? "Yanıtınız eklendi (-1 Kredi)" : "Cevabınız eklendi", answer }, { status: 201 });
  } catch (error) {
    console.error("Cevap ekleme hatası:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
