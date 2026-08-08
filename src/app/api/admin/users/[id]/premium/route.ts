import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { addMonths } from "date-fns";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { months } = body;

    if (!months || typeof months !== "number") {
      return NextResponse.json({ error: "Geçersiz süre." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return NextResponse.json({ error: "Kullanıcı bulunamadı." }, { status: 404 });
    }

    // Determine the new premiumUntil date
    // If the user is already premium, add months to the existing date.
    // If not, add months to the current date.
    const now = new Date();
    const currentPremium = user.premiumUntil && user.premiumUntil > now ? user.premiumUntil : now;
    const newPremiumUntil = addMonths(currentPremium, months);

    await prisma.user.update({
      where: { id },
      data: { premiumUntil: newPremiumUntil },
    });

    // Create a transaction record for manual assignment
    await prisma.transaction.create({
      data: {
        userId: id,
        amount: 0, // Admin manuel ataması
        type: "PREMIUM",
        status: "COMPLETED",
        details: `ADMIN_MANUAL_ASSIGN_${months}_MONTHS`,
      },
    });

    // Send Notification
    await prisma.notification.create({
      data: {
        userId: id,
        type: "PREMIUM_ACTIVATED",
        message: `Tebrikler! ${months} Aylık Premium üyeliğiniz aktifleştirildi. Reklamsız deneyimin tadını çıkarın. Bitiş tarihi: ${newPremiumUntil.toLocaleDateString("tr-TR")}`,
      },
    });

    return NextResponse.json({ success: true, premiumUntil: newPremiumUntil });
  } catch (error: any) {
    console.error("Premium assignment error:", error);
    return NextResponse.json(
      { error: "İşlem sırasında bir hata oluştu." },
      { status: 500 }
    );
  }
}
