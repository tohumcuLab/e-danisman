import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Geçerli bir e-posta adresi giriniz." }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (user && user.passwordHash) {
      // Delete previous tokens for this email
      await prisma.passwordResetToken.deleteMany({
        where: { email: cleanEmail },
      });

      // Generate a secure 32-byte hex token
      const token = crypto.randomBytes(32).toString("hex");
      const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour validity

      await prisma.passwordResetToken.create({
        data: {
          email: cleanEmail,
          token,
          expires,
        },
      });

      const baseUrl = process.env.NEXTAUTH_URL || "https://sor.hobitohum.com";
      const resetUrl = `${baseUrl}/sifremi-unuttum/sifirla?token=${token}&email=${encodeURIComponent(cleanEmail)}`;

      const htmlBody = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; rounded: 12px;">
          <h2 style="color: #2e7d32; text-align: center;">🌿 Tarımsal e-Danışman</h2>
          <h3 style="color: #333;">Şifre Sıfırlama Talebi</h3>
          <p>Merhaba ${user.name || user.firstName || "Kullanıcımız"},</p>
          <p>Hesabınız için şifre sıfırlama talebinde bulundunuz. Aşağıdaki butona tıklayarak yeni şifrenizi belirleyebilirsiniz:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #2e7d32; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              Şifremi Sıfırla ➔
            </a>
          </div>
          <p style="font-size: 12px; color: #666;">Eğer buton çalışmıyorsa aşağıdaki bağlantıyı tarayıcınıza yapıştırın:</p>
          <p style="font-size: 12px; color: #2e7d32; word-break: break-all;">${resetUrl}</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 11px; color: #999; text-align: center;">Bu sıfırlama bağlantısı 1 saat boyunca geçerlidir. Talebi siz yapmadıysanız bu e-postayı dikkate almayınız.</p>
        </div>
      `;

      await sendEmail({
        to: cleanEmail,
        subject: "Tarımsal e-Danışman - Şifre Sıfırlama Talebi",
        html: htmlBody,
      });
    }

    // Always return a generic success message to prevent user enumeration
    return NextResponse.json({
      success: true,
      message: "Eğer belirtilen e-posta adresi sistemde kayıtlıysa, şifre sıfırlama bağlantısı gönderilmiştir.",
    });
  } catch (error) {
    console.error("Şifremi unuttum hatası:", error);
    return NextResponse.json({ error: "Sunucu hatası oluştu." }, { status: 500 });
  }
}
