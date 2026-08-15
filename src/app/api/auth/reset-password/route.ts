import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { email, token, newPassword } = await req.json();

    if (!email || !token || !newPassword) {
      return NextResponse.json({ error: "Eksik bilgi gönderildi." }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: "Şifreniz en az 6 karakter olmalıdır." }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Verify token record in database
    const resetRecord = await prisma.passwordResetToken.findUnique({
      where: { token },
    });

    if (!resetRecord || resetRecord.email !== cleanEmail) {
      return NextResponse.json({ error: "Geçersiz veya süresi dolmuş sıfırlama bağlantısı." }, { status: 400 });
    }

    if (new Date() > resetRecord.expires) {
      // Clean up expired token
      await prisma.passwordResetToken.delete({ where: { id: resetRecord.id } });
      return NextResponse.json({ error: "Bu sıfırlama bağlantısının süresi dolmuş. Lütfen tekrar talep edin." }, { status: 400 });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user's password
    await prisma.user.update({
      where: { email: cleanEmail },
      data: { passwordHash: hashedPassword },
    });

    // Delete used token
    await prisma.passwordResetToken.delete({
      where: { id: resetRecord.id },
    });

    return NextResponse.json({
      success: true,
      message: "Şifreniz başarıyla güncellendi. Yeni şifrenizle giriş yapabilirsiniz.",
    });
  } catch (error) {
    console.error("Şifre sıfırlama hatası:", error);
    return NextResponse.json({ error: "Sunucu hatası oluştu." }, { status: 500 });
  }
}
