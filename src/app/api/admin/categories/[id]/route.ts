import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

function slugify(text: string): string {
  const trMap: Record<string, string> = {
    ç: "c", Ç: "c", ğ: "g", Ğ: "g", ı: "i", İ: "i", ö: "o", Ö: "o", ş: "s", Ş: "s", ü: "u", Ü: "u"
  };
  
  return text
    .split("")
    .map(char => trMap[char] || char)
    .join("")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// PUT: Kategoriyi Güncelle
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
    const { name, slug: customSlug, icon, description, order } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ error: "Kategori adı zorunludur." }, { status: 400 });
    }

    const existingCat = await prisma.category.findUnique({
      where: { id }
    });

    if (!existingCat) {
      return NextResponse.json({ error: "Kategori bulunamadı." }, { status: 404 });
    }

    let slug = customSlug ? slugify(customSlug) : slugify(name);
    if (!slug) slug = existingCat.slug;

    // Eğer slug değiştiyse çakışma kontrolü
    if (slug !== existingCat.slug) {
      const duplicateSlug = await prisma.category.findUnique({
        where: { slug }
      });
      if (duplicateSlug && duplicateSlug.id !== id) {
        slug = `${slug}-${Date.now().toString().slice(-4)}`;
      }
    }

    const updatedCategory = await prisma.category.update({
      where: { id },
      data: {
        name: name.trim(),
        slug,
        icon: icon !== undefined ? (icon ? icon.trim() : null) : existingCat.icon,
        description: description !== undefined ? (description ? description.trim() : null) : existingCat.description,
        order: typeof order === "number" ? order : existingCat.order,
      },
      include: {
        _count: {
          select: { questions: true }
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: "Kategori başarıyla güncellendi.",
      category: updatedCategory
    });
  } catch (error) {
    console.error("Admin kategori güncelleme hatası:", error);
    return NextResponse.json({ error: "Kategori güncellenirken bir hata oluştu." }, { status: 500 });
  }
}

// DELETE: Kategoriyi Sil
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

    const existingCat = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { questions: true }
        }
      }
    });

    if (!existingCat) {
      return NextResponse.json({ error: "Kategori bulunamadı." }, { status: 404 });
    }

    // Bu kategoriye ait soru var mı kontrolü
    if (existingCat._count.questions > 0) {
      return NextResponse.json({
        error: `Bu kategoriye ait ${existingCat._count.questions} adet soru bulunmaktadır. Soruları kaybetmemek adına önce soruların kategorisini değiştirin veya düzenleyin.`
      }, { status: 400 });
    }

    await prisma.category.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: "Kategori başarıyla silindi."
    });
  } catch (error) {
    console.error("Admin kategori silme hatası:", error);
    return NextResponse.json({ error: "Kategori silinirken bir hata oluştu." }, { status: 500 });
  }
}
