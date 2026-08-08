import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 403 });
    }

    const { id: expertId } = await params;

    const expert = await prisma.user.findUnique({
      where: { id: expertId },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        image: true,
        role: true,
      },
    });

    if (!expert) {
      return NextResponse.json({ error: "Uzman bulunamadı" }, { status: 404 });
    }

    const logs = await prisma.expertScoreLog.findMany({
      where: { expertId },
      orderBy: { createdAt: "desc" },
    });

    const enrichedLogs = await Promise.all(
      logs.map(async (log) => {
        let questionInfo = null;

        if (log.relatedId) {
          // relatedId bir answerId mi kontrol et
          const answer = await prisma.answer.findUnique({
            where: { id: log.relatedId },
            include: {
              question: {
                select: { id: true, title: true },
              },
            },
          });

          if (answer && answer.question) {
            questionInfo = {
              id: answer.question.id,
              title: answer.question.title,
              answerId: answer.id,
              answerSnippet: answer.body.length > 80 ? answer.body.substring(0, 80) + "..." : answer.body,
            };
          } else {
            // relatedId bir questionId mi kontrol et
            const question = await prisma.question.findUnique({
              where: { id: log.relatedId },
              select: { id: true, title: true },
            });
            if (question) {
              questionInfo = {
                id: question.id,
                title: question.title,
              };
            }
          }
        }

        return {
          id: log.id,
          action: log.action,
          points: log.points,
          createdAt: log.createdAt,
          relatedId: log.relatedId,
          questionInfo,
        };
      })
    );

    return NextResponse.json({
      expert,
      logs: enrichedLogs,
    });
  } catch (error) {
    console.error("Score logs get error:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
