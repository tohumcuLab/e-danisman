import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

// Duyuru Güncelle (Sadece Admin)
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 403 });
    }

    const { id } = await params;
    const { title, content, isPinned } = await req.json();

    const existing = await prisma.announcement.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Duyuru bulunamadı." }, { status: 404 });
    }

    const updated = await prisma.announcement.update({
      where: { id },
      data: {
        title: title !== undefined ? title : existing.title,
        content: content !== undefined ? content : existing.content,
        isPinned: isPinned !== undefined ? !!isPinned : existing.isPinned,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
            avatarUrl: true,
            role: true,
          },
        },
      },
    });

    return NextResponse.json({ message: "Duyuru güncellendi", announcement: updated });
  } catch (error) {
    console.error("Duyuru güncelleme hatası:", error);
    return NextResponse.json({ error: "Güncelleme başarısız." }, { status: 500 });
  }
}

// Duyuru Sil (Sadece Admin)
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 403 });
    }

    const { id } = await params;

    await prisma.announcement.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Duyuru silindi." });
  } catch (error) {
    console.error("Duyuru silme hatası:", error);
    return NextResponse.json({ error: "Silme başarısız." }, { status: 500 });
  }
}
