import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { storageService } from "@/lib/storage";

function parseSafeDate(val: any): Date | null {
  if (!val) return null;
  const d = new Date(val);
  return isNaN(d.getTime()) ? null : d;
}

function parseSafeInt(val: any, fallback: number | null = null): number | null {
  if (val === null || val === undefined || val === "") return fallback;
  const parsed = parseInt(val.toString(), 10);
  return isNaN(parsed) ? fallback : parsed;
}

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

    const updateData: Record<string, any> = {};

    if (title !== undefined) updateData.title = title;
    if (type !== undefined) updateData.type = type;
    if (placement !== undefined) updateData.placement = placement;
    if (networkCode !== undefined) updateData.networkCode = networkCode;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
    if (destinationUrl !== undefined) updateData.destinationUrl = destinationUrl;
    if (videoUrl !== undefined) updateData.videoUrl = videoUrl;
    if (isActive !== undefined) updateData.isActive = isActive;

    if (impressionLimit !== undefined) {
      updateData.impressionLimit = parseSafeInt(impressionLimit, null);
    }
    if (creditReward !== undefined) {
      updateData.creditReward = parseSafeInt(creditReward, 0) ?? 0;
    }
    if (order !== undefined) {
      updateData.order = parseSafeInt(order, 0) ?? 0;
    }
    if (startDate !== undefined) {
      updateData.startDate = parseSafeDate(startDate);
    }
    if (endDate !== undefined) {
      updateData.endDate = parseSafeDate(endDate);
    }

    const updatedAd = await prisma.ad.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json({ message: "Reklam güncellendi", ad: updatedAd }, { status: 200 });
  } catch (error: any) {
    console.error("Reklam güncelleme hatası:", error);
    return NextResponse.json(
      { error: error?.message || "Sunucu hatası" },
      { status: 500 }
    );
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
