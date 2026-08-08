import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const ad = await prisma.ad.findUnique({
      where: { id }
    });

    if (!ad || !ad.isActive) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    // Increment click count asynchronously
    await prisma.ad.update({
      where: { id },
      data: {
        clickCount: { increment: 1 }
      }
    }).catch((err) => console.error("Tıklama sayısı artırılamadı:", err));

    const destination = ad.destinationUrl || "/";
    
    // Validate protocol to prevent malicious javascript: or relative redirects
    if (destination.startsWith("http://") || destination.startsWith("https://")) {
      return NextResponse.redirect(destination);
    }

    return NextResponse.redirect(new URL(destination, req.url));
  } catch (error) {
    console.error("Reklam yönlendirme hatası:", error);
    return NextResponse.redirect(new URL("/", req.url));
  }
}
