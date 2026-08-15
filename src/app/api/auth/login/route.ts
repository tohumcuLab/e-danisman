import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "E-posta ve şifre zorunludur." }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Find user in database
    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (!user || !user.passwordHash) {
      return NextResponse.json({ error: "Geçersiz e-posta adresi veya şifre." }, { status: 400 });
    }

    // Compare bcrypt password hash
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return NextResponse.json({ error: "Geçersiz e-posta adresi veya şifre." }, { status: 400 });
    }

    // Check if user is banned
    if (user.isBanned) {
      return NextResponse.json({ error: user.banReason || "Hesabınız askıya alınmıştır." }, { status: 403 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Login verification error:", error);
    return NextResponse.json({ error: "Giriş doğrulanırken bir hata oluştu." }, { status: 500 });
  }
}
