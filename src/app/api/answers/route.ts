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

    // Kullanıcı ban kontrolü, rol, kredi ve premium çekimi
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, isBanned: true, bannedUntil: true, banReason: true, credits: true, premiumUntil: true }
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

    let updatedCredits: number | undefined;

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
      const [updatedUser] = await prisma.$transaction([
        prisma.user.update({
          where: { id: userId },
          data: { credits: { decrement: 1 } },
          select: { credits: true }
        }),
        prisma.credit.create({
          data: {
            userId,
            amount: -1,
            type: "SPEND",
            reason: "Cevaba yanıt verme (-1 Kredi)"
          }
        })
      ]);

      updatedCredits = updatedUser.credits;

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

    const isExpert = currentUser?.role === "EXPERT" || currentUser?.role === "ADMIN" || session.user?.role === "EXPERT" || session.user?.role === "ADMIN";

    // 2.5 Standart kullanıcı ana cevabı için 4 Kredi / Premium kontrolü
    if (!parentId && !isExpert) {
      const isPremium = currentUser?.premiumUntil && new Date(currentUser.premiumUntil) > new Date();
      if (!isPremium) {
        if ((currentUser?.credits ?? 0) < 4) {
          return NextResponse.json(
            { error: "Yetersiz bakiye! Cevap gönderebilmek için en az 4 krediniz olmalıdır.", currentCredits: currentUser?.credits || 0, requiredCredits: 4 },
            { status: 403 }
          );
        }

        // 4 Kredi düş
        const [updatedUser] = await prisma.$transaction([
          prisma.user.update({
            where: { id: userId },
            data: { credits: { decrement: 4 } },
            select: { credits: true }
          }),
          prisma.credit.create({
            data: {
              userId,
              amount: -4,
              type: "SPEND",
              reason: "Soruya cevap gönderme (-4 Kredi)"
            }
          })
        ]);

        updatedCredits = updatedUser.credits;
      }
    }

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
        answer,
        updatedCredits
      }, { status: 201 });
    }

    if (body.length >= 50 && isExpert) {
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

    return NextResponse.json({
      message: parentId ? "Yanıtınız eklendi (-1 Kredi)" : "Cevabınız eklendi (-4 Kredi)",
      answer,
      updatedCredits
    }, { status: 201 });
  } catch (error) {
    console.error("Cevap ekleme hatası:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
