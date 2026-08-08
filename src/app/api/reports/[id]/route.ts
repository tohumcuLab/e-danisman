import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 403 });
    }

    const { id } = await params;
    const { status } = await req.json();

    if (!["RESOLVED", "DISMISSED"].includes(status)) {
      return NextResponse.json({ error: "Geçersiz durum" }, { status: 400 });
    }

    const report = await prisma.report.update({
      where: { id },
      data: { status }
    });

    return NextResponse.json({ message: "Rapor güncellendi", report }, { status: 200 });
  } catch (error) {
    console.error("Rapor güncelleme hatası:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 403 });
    }

    const { id } = await params;
    
    // Find the report to get target type and target id
    const report = await prisma.report.findUnique({
      where: { id }
    });

    if (!report) {
      return NextResponse.json({ error: "Rapor bulunamadı" }, { status: 404 });
    }

    // Delete the underlying content based on targetType
    if (report.targetType === "QUESTION") {
      await prisma.question.delete({ where: { id: report.targetId } });
    } else if (report.targetType === "ANSWER") {
      const answer = await prisma.answer.findUnique({
        where: { id: report.targetId },
        include: { user: true }
      });
      
      if (answer) {
        // Revert credits (🪙)
        if (answer.likeCount > 0) {
          const newCredits = Math.max(0, answer.user.credits - answer.likeCount);
          await prisma.user.update({
            where: { id: answer.userId },
            data: { credits: newCredits }
          });
          
          await prisma.credit.create({
            data: {
              userId: answer.userId,
              amount: answer.likeCount,
              type: "SPEND",
              reason: "Şikayet üzerine silinen cevabınızdan kazandığınız krediler geri alındı."
            }
          });
        }

        // Revert Expert Scores
        if (answer.user.role === "EXPERT") {
          const { removeExpertScore } = await import("@/lib/expertScore");
          await removeExpertScore(answer.userId, "ANSWER", answer.id);
          if (answer.isAccepted) {
            await removeExpertScore(answer.userId, "BEST_ANSWER", answer.id);
          }
          if (answer.likeCount > 0) {
            for (let i = 0; i < answer.likeCount; i++) {
              await removeExpertScore(answer.userId, "LIKE", answer.id);
            }
          }
        }
      }

      await prisma.answer.delete({ where: { id: report.targetId } });
    } else if (report.targetType === "USER") {
      await prisma.user.delete({ where: { id: report.targetId } });
    }

    // 3. Mark the report as resolved since action was taken
    await prisma.report.update({
      where: { id },
      data: { status: "RESOLVED" }
    });

    // 4. Reward the reporter with 1 credit for valid report
    await prisma.user.update({
      where: { id: report.reporterId },
      data: { credits: { increment: 1 } }
    });

    await prisma.credit.create({
      data: {
        userId: report.reporterId,
        amount: 1,
        type: "EARN",
        reason: "Yaptığınız şikayet haklı bulundu ve ilgili içerik silindi. Topluluğa katkınız için teşekkürler! (+1 Kredi)"
      }
    });

    await prisma.notification.create({
      data: {
        userId: report.reporterId,
        type: "CREDIT_EARNED",
        message: "Yaptığınız şikayet haklı bulundu. Topluluğa katkınız için +1 Kredi kazandınız!",
      }
    });

    return NextResponse.json({ message: "İçerik kalıcı olarak silindi ve şikayet çözüldü. Şikayetçiye 1 kredi verildi." }, { status: 200 });
  } catch (error) {
    console.error("İçerik silme hatası:", error);
    return NextResponse.json({ error: "Sunucu hatası veya içerik zaten silinmiş" }, { status: 500 });
  }
}
