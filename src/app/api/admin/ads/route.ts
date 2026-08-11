import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 403 });
    }

    const ads = await prisma.ad.findMany({
      orderBy: [
        { order: "asc" },
        { createdAt: "desc" }
      ]
    });

    return NextResponse.json({ ads }, { status: 200 });
  } catch (error) {
    console.error("Reklamları getirme hatası:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 403 });
    }

    const body = await req.json();
    const {
      title,
      type, // "GOOGLE", "MANUAL", "FEED", "REWARD_VIDEO"
      placement, // "FEED", "REWARD", "GENERAL" vb.
      networkCode,
      imageUrl,
      destinationUrl,
      videoUrl,
      impressionLimit,
      creditReward,
      order,
      startDate,
      endDate,
    } = body;

    if (!title || !type) {
      return NextResponse.json({ error: "Başlık ve Tür zorunludur" }, { status: 400 });
    }

    if (type === "GOOGLE" && !networkCode) {
      return NextResponse.json({ error: "Google Reklam Kodu zorunludur" }, { status: 400 });
    }

    if (type === "MANUAL" && !imageUrl) {
      return NextResponse.json({ error: "Görsel veya Video Medyası zorunludur" }, { status: 400 });
    }

    const ad = await prisma.ad.create({
      data: {
        title,
        type,
        placement: placement || "FEED",
        networkCode: networkCode || null,
        imageUrl: imageUrl || null,
        destinationUrl: destinationUrl || null,
        videoUrl: videoUrl || null,
        impressionLimit: impressionLimit ? parseInt(impressionLimit.toString()) : null,
        creditReward: creditReward ? parseInt(creditReward.toString()) : 0,
        order: order ? parseInt(order.toString()) : 0,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
      }
    });

    return NextResponse.json({ message: "Reklam oluşturuldu", ad }, { status: 201 });
  } catch (error) {
    console.error("Reklam oluşturma hatası:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
