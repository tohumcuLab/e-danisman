import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    await prisma.ad.update({
      where: { id },
      data: { impressionCount: { increment: 1 } },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Ad impression increment error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
