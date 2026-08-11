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

    // Kredi kontrolü, cevap oluşturma ve bildirim gönderimini atomik transaction içinde yapıyoruz
    const result = await prisma.$transaction(async (tx) => {
      // 1. Kullanıcıyı, kredisini, ban durumunu ve rolünü kontrol et
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { id: true, role: true, isBanned: true, bannedUntil: true, banReason: true, credits: true, premiumUntil: true }
      });

      if (!user) {
        throw new Error("USER_NOT_FOUND");
      }

      if (user.isBanned && (!user.bannedUntil || new Date(user.bannedUntil) > new Date())) {
        throw new Error(`BANNED:${user.banReason || 'Topluluk kuralları ihlali.'}`);
      }

      // 2. Sorunun var olup olmadığını kontrol et
      const question = await tx.question.findUnique({
        where: { id: questionId }
      });

      if (!question) {
        throw new Error("QUESTION_NOT_FOUND");
      }

      const isExpert = user.role === "EXPERT" || user.role === "ADMIN" || session.user?.role === "EXPERT" || session.user?.role === "ADMIN";
      const isPremium = user.premiumUntil ? new Date(user.premiumUntil) > new Date() : false;

      let remainingCredits = user.credits;

      // 3. Kredi Düşme Mantığı
      if (parentId) {
        // Yanıta yanıt verme (-1 Kredi)
        const parentAnswer = await tx.answer.findUnique({
          where: { id: parentId },
          include: { user: true }
        });

        if (!parentAnswer) {
          throw new Error("PARENT_NOT_FOUND");
        }

        if (user.credits < 1) {
          throw new Error("INSUFFICIENT_CREDITS:1");
        }

        const updatedUser = await tx.user.update({
          where: { id: userId },
          data: { credits: { decrement: 1 } },
          select: { credits: true }
        });

        await tx.credit.create({
          data: {
            userId,
            amount: -1,
            type: "SPEND",
            reason: "Cevaba yanıt verme (-1 Kredi)"
          }
        });

        remainingCredits = updatedUser.credits;

        if (parentAnswer.userId !== userId) {
          await tx.notification.create({
            data: {
              userId: parentAnswer.userId,
              type: "NEW_ANSWER",
              message: `Yazdığınız cevaba yeni bir yanıt geldi: "${body.substring(0, 30)}..."`,
              relatedId: question.id,
            }
          });
        }
      } else if (!isExpert && !isPremium) {
        // Ana soruya cevap verme (-1 Kredi)
        if (user.credits < 1) {
          throw new Error("INSUFFICIENT_CREDITS:1");
        }

        const updatedUser = await tx.user.update({
          where: { id: userId },
          data: { credits: { decrement: 1 } },
          select: { credits: true }
        });

        await tx.credit.create({
          data: {
            userId,
            amount: -1,
            type: "SPEND",
            reason: "Soruya cevap gönderme (-1 Kredi)"
          }
        });

        remainingCredits = updatedUser.credits;
      }

      const initialStatus = isExpert ? "PENDING_APPROVAL" : "APPROVED";

      // 4. Cevabı / Yanıtı oluştur
      const answer = await tx.answer.create({
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
        await tx.notification.create({
          data: {
            userId,
            type: "ANSWER_PENDING",
            message: `Cevabınız yönetici onayına gönderilmiştir. Admin onayladıktan sonra yayına alınacaktır.`,
            relatedId: question.id,
          }
        });
      } else if (question.userId !== userId && !parentId) {
        await tx.notification.create({
          data: {
            userId: question.userId,
            type: "NEW_ANSWER",
            message: `"${question.title.substring(0, 35)}..." sorunuza yeni bir cevap verildi.`,
            relatedId: question.id,
          }
        });
      }

      return {
        answer,
        initialStatus,
        remainingCredits,
        isExpert
      };
    });

    if (body.length >= 50 && result.isExpert) {
      const { addExpertScore } = await import("@/lib/expertScore");
      await addExpertScore(userId, "ANSWER", result.answer.id);
    }

    if (result.initialStatus === "PENDING_APPROVAL") {
      return NextResponse.json({
        message: "Cevabınız yönetici onayına gönderilmiştir. Admin onayladıktan sonra yayınlanacak ve puanınız eklenecektir.",
        pendingApproval: true,
        answer: result.answer,
        updatedCredits: result.remainingCredits
      }, { status: 201 });
    }

    return NextResponse.json({
      message: parentId ? "Yanıtınız eklendi (-1 Kredi)" : "Cevabınız eklendi (-1 Kredi)",
      answer: result.answer,
      updatedCredits: result.remainingCredits
    }, { status: 201 });

  } catch (error: any) {
    console.error("Cevap ekleme hatası:", error);

    if (error.message === "USER_NOT_FOUND") {
      return NextResponse.json({ error: "Kullanıcı bulunamadı" }, { status: 404 });
    }
    if (error.message === "QUESTION_NOT_FOUND") {
      return NextResponse.json({ error: "Soru bulunamadı" }, { status: 404 });
    }
    if (error.message === "PARENT_NOT_FOUND") {
      return NextResponse.json({ error: "Yanıtlanmak istenen cevap bulunamadı" }, { status: 404 });
    }
    if (error.message?.startsWith("BANNED:")) {
      const reason = error.message.split(":")[1] || "Hesabınız kısıtlanmıştır.";
      return NextResponse.json({ error: `Hesabınız kısıtlanmıştır: ${reason}` }, { status: 403 });
    }
    if (error.message?.startsWith("INSUFFICIENT_CREDITS")) {
      const reqVal = error.message.split(":")[1] || "1";
      return NextResponse.json({ error: `Yetersiz bakiye! Cevap gönderebilmek için en az ${reqVal} krediniz olmalıdır.`, requiredCredits: parseInt(reqVal, 10) }, { status: 403 });
    }

    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

