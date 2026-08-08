import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }

    const [user, askedQuestionsCount, answersCount, unansweredQuestionsCount, pendingQuestionsCount] = await Promise.all([
      prisma.user.findUnique({
        where: { id: session.user.id },
        select: { id: true, name: true, email: true, image: true, avatarUrl: true, credits: true, role: true }
      }),
      prisma.question.count({
        where: { userId: session.user.id }
      }),
      prisma.answer.count({
        where: { userId: session.user.id }
      }),
      prisma.question.count({
        where: {
          userId: session.user.id,
          answers: { none: {} }
        }
      }),
      prisma.question.count({
        where: {
          userId: session.user.id,
          status: "PENDING_APPROVAL"
        }
      })
    ]);

    if (!user) {
      return NextResponse.json({ error: "Kullanıcı bulunamadı" }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        ...user,
        askedQuestionsCount,
        answersCount,
        unansweredQuestionsCount,
        pendingQuestionsCount
      }
    });
  } catch (error) {
    console.error("Kullanıcı bilgisi çekme hatası:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
