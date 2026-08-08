import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    let packages = await prisma.adPackage.findMany({
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    });

    // Eğer veritabanında hiç paket yoksa, varsayılan 3 paketi otomatik olarak oluştur (Seed)
    if (packages.length === 0) {
      await prisma.adPackage.createMany({
        data: [
          {
            title: "Başlangıç Paketi",
            views: "10.000 Gösterim",
            impressionLimit: 10000,
            price: 3000,
            estimatedTime: "Tahmini Gösterim Süresi: ~15-20 Gün",
            description: "Yeni başlayanlar veya küçük bütçeli kampanyalar için idealdir.",
            imageUrl: "/iyzico/reklam-baslangic.jpg",
            iyzicoLink: "",
            isPopular: false,
            order: 1,
            isActive: true,
          },
          {
            title: "Standart Paket",
            views: "50.000 Gösterim",
            impressionLimit: 50000,
            price: 12000,
            estimatedTime: "Tahmini Gösterim Süresi: ~2-3 Ay",
            description: "Orta ölçekli firmalar ve daha geniş kitleye ulaşmak isteyenler için.",
            imageUrl: "/iyzico/reklam-standart.jpg",
            iyzicoLink: "",
            isPopular: true,
            order: 2,
            isActive: true,
          },
          {
            title: "Pro Paket",
            views: "100.000 Gösterim",
            impressionLimit: 100000,
            price: 20000,
            estimatedTime: "Tahmini Gösterim Süresi: ~4-6 Ay",
            description: "Maksimum görünürlük ve uzun soluklu marka bilinirliği kampanyaları için.",
            imageUrl: "/iyzico/reklam-pro.jpg",
            iyzicoLink: "",
            isPopular: false,
            order: 3,
            isActive: true,
          },
        ],
      });

      packages = await prisma.adPackage.findMany({
        orderBy: [{ order: "asc" }, { createdAt: "asc" }],
      });
    }

    return NextResponse.json({ packages });
  } catch (error) {
    console.error("Reklam paketleri getirme hatası:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }

    const data = await req.json();

    if (!data.title || !data.views) {
      return NextResponse.json({ error: "Paket başlığı ve gösterim sayısı zorunludur" }, { status: 400 });
    }

    const newPackage = await prisma.adPackage.create({
      data: {
        title: data.title,
        views: data.views,
        impressionLimit: Number(data.impressionLimit) || 10000,
        price: Number(data.price) || 0,
        estimatedTime: data.estimatedTime || null,
        description: data.description || null,
        imageUrl: data.imageUrl || null,
        iyzicoLink: data.iyzicoLink || null,
        isPopular: Boolean(data.isPopular),
        order: Number(data.order) || 0,
        isActive: data.isActive !== undefined ? Boolean(data.isActive) : true,
      },
    });

    return NextResponse.json({ message: "Reklam paketi oluşturuldu", package: newPackage }, { status: 201 });
  } catch (error) {
    console.error("Reklam paketi oluşturma hatası:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
