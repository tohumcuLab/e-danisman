import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    let categories = await prisma.category.findMany({
      orderBy: { order: "asc" }
    });

    // Varsayılan kategoriler yoksa oluştur
    if (categories.length === 0) {
      const defaultCategories = [
        { name: "Hastalıklar", slug: "hastaliklar", description: "Bitkilerdeki mantar, bakteri ve virüs hastalıkları", order: 1 },
        { name: "Zararlılar", slug: "zararlilar", description: "Böcek, akar ve diğer zararlılar", order: 2 },
        { name: "Beslenme Eksikliği", slug: "beslenme-eksikligi", description: "Makro ve mikro besin elementi eksiklikleri", order: 3 },
        { name: "Yabancı Otlar", slug: "yabanci-otlar", description: "İstenmeyen otlar ve mücadele yöntemleri", order: 4 },
        { name: "Emin Değilim", slug: "emin-degilim", description: "Hastalık veya zararlı türünden emin olamadığınız durumlar", order: 5 },
        { name: "Diğer", slug: "diger", description: "Diğer tarımsal sorunlar", order: 99 }
      ];

      await prisma.category.createMany({
        data: defaultCategories
      });

      categories = await prisma.category.findMany({
        orderBy: { order: "asc" }
      });
    }

    // "Diğer" kategorisini her zaman listenin en sonuna sabitleyelim
    categories.sort((a, b) => {
      if (a.name === "Diğer" || a.slug === "diger") return 1;
      if (b.name === "Diğer" || b.slug === "diger") return -1;
      return (a.order || 0) - (b.order || 0);
    });

    return NextResponse.json({ categories });
  } catch (error) {
    console.error("Kategori getirme hatası:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
