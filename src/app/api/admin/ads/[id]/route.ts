import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { storageService } from "@/lib/storage";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();

    const {
      title,
      type,
      placement,
      networkCode,
      imageUrl,
      destinationUrl,
      videoUrl,
      impressionLimit,
      creditReward,
      order,
      startDate,
      endDate,
      isActive
    } = body;

    const existingAd = await prisma.ad.findUnique({ where: { id } });
    if (!existingAd) {
      return NextResponse.json({ error: "Reklam bulunamadı" }, { status: 404 });
    }

    const updatedAd = await prisma.ad.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(type !== undefined && { type }),
        ...(placement !== undefined && { placement }),
        ...(networkCode !== undefined && { networkCode }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(destinationUrl !== undefined && { destinationUrl }),
        ...(videoUrl !== undefined && { videoUrl }),
        ...(impressionLimit !== undefined && {
          impressionLimit: impressionLimit ? parseInt(impressionLimit.toString()) : null
        }),
        ...(creditReward !== undefined && {
          creditReward: creditReward ? parseInt(creditReward.toString()) : 0
        }),
        ...(order !== undefined && {
          order: order ? parseInt(order.toString()) : 0
        }),
        ...(startDate !== undefined && {
          startDate: startDate ? new Date(startDate) : null
        }),
        ...(endDate !== undefined && {
          endDate: endDate ? new Date(endDate) : null
        }),
        ...(isActive !== undefined && { isActive })
      }
    });

    return NextResponse.json({ message: "Reklam güncellendi", ad: updatedAd }, { status: 200 });
  } catch (error) {
    console.error("Reklam güncelleme hatası:", error);
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

    const ad = await prisma.ad.findUnique({
      where: { id }
    });

    if (!ad) {
      return NextResponse.json({ error: "Reklam bulunamadı" }, { status: 404 });
    }

    // Reklamı veritabanından sil
    await prisma.ad.delete({
      where: { id }
    });

    // Eğer yüklenmiş bir dosya ise StorageService üzerinden sil
    if (ad.videoUrl) {
      await storageService.deleteFile(ad.videoUrl).catch(() => null);
    }
    if (ad.imageUrl && ad.imageUrl.startsWith("/uploads/")) {
      await storageService.deleteFile(ad.imageUrl).catch(() => null);
    }

    return NextResponse.json({ message: "Reklam başarıyla silindi" }, { status: 200 });
  } catch (error) {
    console.error("Reklam silme hatası:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
