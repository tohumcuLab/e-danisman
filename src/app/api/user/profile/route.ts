import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }

    const { name, bio, city, district, village, avatarUrl, website, twitter, instagram, linkedin, facebook, youtube } = await req.json();

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name,
        bio,
        city,
        district,
        village,
        avatarUrl,
        image: avatarUrl, // Sync image with avatarUrl
        website,
        twitter,
        instagram,
        linkedin,
        facebook,
        youtube
      }
    });

    return NextResponse.json({ message: "Profil başarıyla güncellendi", user: updatedUser });
  } catch (error) {
    console.error("Profil güncelleme hatası:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
