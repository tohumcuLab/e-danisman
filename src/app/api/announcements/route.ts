import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

// Duyuruları Getir
export async function GET() {
  try {
    const announcements = await prisma.announcement.findMany({
      orderBy: [
        { isPinned: "desc" },
        { createdAt: "desc" },
      ],
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

    return NextResponse.json(announcements);
  } catch (error) {
    console.error("Duyurular getirme hatası:", error);
    return NextResponse.json({ error: "Duyurular alınamadı." }, { status: 500 });
  }
}

// Yeni Duyuru Ekle (Sadece Admin)
export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Bu işlemi sadece yöneticiler gerçekleştirebilir." }, { status: 403 });
    }

    const { title, content, isPinned } = await req.json();

    if (!title || !content) {
      return NextResponse.json({ error: "Başlık ve içerik alanları zorunludur." }, { status: 400 });
    }

    const announcement = await prisma.announcement.create({
      data: {
        title,
        content,
        isPinned: !!isPinned,
        authorId: session.user.id,
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

    return NextResponse.json({ message: "Duyuru başarıyla yayınlandı", announcement }, { status: 201 });
  } catch (error) {
    console.error("Duyuru oluşturma hatası:", error);
    return NextResponse.json({ error: "Duyuru kaydedilemedi." }, { status: 500 });
  }
}
