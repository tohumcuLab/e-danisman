import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Giriş yapmalısınız" }, { status: 401 });
    }

    const expert = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        expertPayments: true,
      },
    });
    if (!expert || expert.role !== "EXPERT") {
      return NextResponse.json({ error: "Bu sayfaya erişim yetkiniz yok" }, { status: 403 });
    }

    const expertId = expert.id;

    // Tarihleri hesapla
    const now = new Date();
    const startOfWeek = new Date(now);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);
    startOfWeek.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Tüm logları çek
    const logs = await prisma.expertScoreLog.findMany({
      where: { expertId },
    });

    // Haftalık İstatistikler
    let weeklyAnswers = 0;
    let weeklyLikes = 0;
    let weeklyBestAnswers = 0;
    let weeklyScore = 0;

    // Aylık Puan
    let monthlyScore = 0;

    // Tüm Zamanlar Puan
    let totalScore = 0;

    for (const log of logs) {
      totalScore += log.points;

      const isThisWeek = log.createdAt >= startOfWeek;
      const isThisMonth = log.createdAt >= startOfMonth;

      if (isThisMonth) {
        monthlyScore += log.points;
      }

      if (isThisWeek) {
        weeklyScore += log.points;
        if (log.action === "ANSWER") weeklyAnswers++;
        if (log.action === "LIKE") weeklyLikes++;
        if (log.action === "BEST_ANSWER") weeklyBestAnswers++;
      }
    }

    // TL Çarpanını Ayarlardan Çek
    const tlMultiplierSetting = await prisma.systemSetting.findUnique({
      where: { key: "EXPERT_POINT_TL_VALUE" },
    });
    const tlMultiplier = tlMultiplierSetting ? parseFloat(tlMultiplierSetting.value) : 2.0;

    // Toplam Ödenmiş Puanlar & Alacak Bakiyesi
    const totalPaidPoints = expert.expertPayments.reduce((sum, p) => sum + p.totalPoints, 0);
    const unpaidPoints = Math.max(0, totalScore - totalPaidPoints);
    const totalBalanceTL = unpaidPoints * tlMultiplier;
    const estimatedPayment = weeklyScore * tlMultiplier;

    // Sayfalama (Pagination)
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const take = 24;
    const skip = (page - 1) * take;

    const sortedLogs = logs.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    const paginatedLogs = sortedLogs.slice(skip, skip + take);
    const totalPages = Math.ceil(logs.length / take);

    return NextResponse.json({
      stats: {
        weeklyAnswers,
        weeklyLikes,
        weeklyBestAnswers,
        weeklyScore,
        monthlyScore,
        totalScore,
        unpaidPoints,
        totalBalanceTL,
        estimatedPayment,
        tlMultiplier,
      },
      recentLogs: paginatedLogs,
      pagination: {
        page,
        totalPages,
        totalItems: logs.length
      }
    });
  } catch (error) {
    console.error("Uzman dashboard hatası:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
