import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }

    const { id } = await params;
    const data = await req.json();

    const existingPackage = await prisma.adPackage.findUnique({
      where: { id },
    });

    if (!existingPackage) {
      return NextResponse.json({ error: "Reklam paketi bulunamadı" }, { status: 404 });
    }

    const updatedPackage = await prisma.adPackage.update({
      where: { id },
      data: {
        title: data.title !== undefined ? data.title : existingPackage.title,
        views: data.views !== undefined ? data.views : existingPackage.views,
        impressionLimit: data.impressionLimit !== undefined ? Number(data.impressionLimit) : existingPackage.impressionLimit,
        price: data.price !== undefined ? Number(data.price) : existingPackage.price,
        estimatedTime: data.estimatedTime !== undefined ? data.estimatedTime : existingPackage.estimatedTime,
        description: data.description !== undefined ? data.description : existingPackage.description,
        imageUrl: data.imageUrl !== undefined ? data.imageUrl : existingPackage.imageUrl,
        iyzicoLink: data.iyzicoLink !== undefined ? data.iyzicoLink : existingPackage.iyzicoLink,
        isPopular: data.isPopular !== undefined ? Boolean(data.isPopular) : existingPackage.isPopular,
        order: data.order !== undefined ? Number(data.order) : existingPackage.order,
        isActive: data.isActive !== undefined ? Boolean(data.isActive) : existingPackage.isActive,
      },
    });

    return NextResponse.json({ message: "Reklam paketi güncellendi", package: updatedPackage });
  } catch (error) {
    console.error("Reklam paketi güncelleme hatası:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }

    const { id } = await params;

    const existingPackage = await prisma.adPackage.findUnique({
      where: { id },
    });

    if (!existingPackage) {
      return NextResponse.json({ error: "Reklam paketi bulunamadı" }, { status: 404 });
    }

    await prisma.adPackage.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Reklam paketi silindi" });
  } catch (error) {
    console.error("Reklam paketi silme hatası:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
