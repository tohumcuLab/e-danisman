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

// GET: Tüm kategorileri soru sayılarıyla birlikte getir
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 403 });
    }

    const categories = await prisma.category.findMany({
      orderBy: { order: "asc" },
      include: {
        _count: {
          select: { questions: true }
        }
      }
    });

    return NextResponse.json({ categories });
  } catch (error) {
    console.error("Admin kategori listesi hatası:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

// POST: Yeni Kategori Oluştur
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 403 });
    }

    const body = await req.json();
    const { name, icon, description, order } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ error: "Kategori adı zorunludur." }, { status: 400 });
    }

    let slug = body.slug ? slugify(body.slug) : slugify(name);
    if (!slug) {
      slug = `kategori-${Date.now()}`;
    }

    // Slug benzersizlik kontrolü
    const existingSlug = await prisma.category.findUnique({
      where: { slug }
    });

    if (existingSlug) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    const newCategory = await prisma.category.create({
      data: {
        name: name.trim(),
        slug,
        icon: icon ? icon.trim() : null,
        description: description ? description.trim() : null,
        order: typeof order === "number" ? order : 0,
      },
      include: {
        _count: {
          select: { questions: true }
        }
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: "Kategori başarıyla oluşturuldu.", 
      category: newCategory 
    });
  } catch (error) {
    console.error("Admin kategori oluşturma hatası:", error);
    return NextResponse.json({ error: "Kategori oluşturulurken bir hata meydana geldi." }, { status: 500 });
  }
}
