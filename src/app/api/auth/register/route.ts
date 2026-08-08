import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import dns from "dns";

// Türkiye Cumhuriyeti Kimlik Numarası Algoritması Doğrulaması
function validateTcNo(tc: string): boolean {
  if (!/^[1-9]\d{10}$/.test(tc)) return false;
  
  const digits = tc.split("").map(Number);
  const sumOdd = digits[0] + digits[2] + digits[4] + digits[6] + digits[8];
  const sumEven = digits[1] + digits[3] + digits[5] + digits[7];

  const check10 = (sumOdd * 7 - sumEven) % 10;
  const check11 = (digits.slice(0, 10).reduce((a, b) => a + b, 0)) % 10;

  return check10 === digits[9] && check11 === digits[10];
}

// Türkiye Cep Telefonu Numarası Doğrulaması (5XX XXX XX XX)
function validateTurkishPhone(phone: string): { isValid: boolean; cleanPhone: string } {
  const cleaned = phone.replace(/\D/g, "");
  let formatted = cleaned;

  // Baştaki 90 veya 0 eklerini temizle
  if (formatted.startsWith("90") && formatted.length === 12) {
    formatted = formatted.substring(2);
  } else if (formatted.startsWith("0") && formatted.length === 11) {
    formatted = formatted.substring(1);
  }

  // 10 haneli ve 5 ile başlayan geçerli Türkiye mobil numarası kontrolü
  const isValid = /^5\d{9}$/.test(formatted);
  return { isValid, cleanPhone: formatted };
}

// E-posta Adresi Format ve Gerçek Domain (MX Kaydı) Doğrulaması
async function validateEmail(email: string): Promise<{ isValid: boolean; message?: string }> {
  const cleanEmail = email.trim().toLowerCase();
  
  // Format Kontrolü
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(cleanEmail)) {
    return { isValid: false, message: "Geçersiz e-posta adresi formatı." };
  }

  const domain = cleanEmail.split("@")[1];

  // Geçici / Sahte E-posta Servislerini Engelleme
  const disposableDomains = [
    "mailinator.com", "tempmail.com", "10minutemail.com", "guerrillamail.com",
    "dispostable.com", "yopmail.com", "trashmail.com", "getnada.com",
    "fakemailgenerator.com", "sharklasers.com", "throwawaymail.com", "temp-mail.org",
    "mailnesia.com", "maildrop.cc"
  ];

  if (disposableDomains.includes(domain)) {
    return { isValid: false, message: "Geçici veya kullan-at e-posta adresleri kabul edilmemektedir." };
  }

  // E-posta Sunucusu (MX Kaydı) Gerçeklik Kontrolü
  try {
    const mxRecords = await dns.promises.resolveMx(domain);
    if (!mxRecords || mxRecords.length === 0) {
      return { isValid: false, message: "Girdiğiniz e-posta adresinin alan adı (domain) veya e-posta sunucusu bulunamadı." };
    }
  } catch (err) {
    return { isValid: false, message: "E-posta sunucusu doğrulanamadı. Lütfen geçerli bir e-posta adresi giriniz." };
  }

  return { isValid: true };
}

export async function POST(req: Request) {
  try {
    const { firstName, lastName, username, email, phone, password, tcNo, agreedTerms } = await req.json();

    if (!firstName || !lastName) {
      return NextResponse.json(
        { error: "Ad ve Soyad alanları zorunludur." },
        { status: 400 }
      );
    }

    if (!email || !phone || !password || !tcNo) {
      return NextResponse.json(
        { error: "E-posta, Telefon Numarası, Şifre ve T.C. Kimlik Numarası zorunludur." },
        { status: 400 }
      );
    }

    if (!agreedTerms) {
      return NextResponse.json(
        { error: "Kayıt olmak için Kullanıcı Sözleşmesi'ni kabul etmeniz gerekmektedir." },
        { status: 400 }
      );
    }

    // 1. E-posta Gerçeklik Doğrulaması
    const emailValidation = await validateEmail(email);
    if (!emailValidation.isValid) {
      return NextResponse.json(
        { error: emailValidation.message || "Lütfen geçerli bir e-posta adresi giriniz." },
        { status: 400 }
      );
    }

    // 2. Telefon Numarası Doğrulaması
    const { isValid: isPhoneValid, cleanPhone } = validateTurkishPhone(phone);
    if (!isPhoneValid) {
      return NextResponse.json(
        { error: "Lütfen geçerli bir Türkiye mobil telefon numarası giriniz. (Örn: 5XX XXX XX XX)" },
        { status: 400 }
      );
    }

    // 3. T.C. Kimlik No Algoritma Kontrolü
    const cleanTcNo = String(tcNo).trim();
    if (!validateTcNo(cleanTcNo)) {
      return NextResponse.json(
        { error: "Lütfen geçerli 11 haneli T.C. Kimlik Numarası giriniz." },
        { status: 400 }
      );
    }

    // E-posta mükerrerlik kontrolü
    const existingEmail = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });

    if (existingEmail) {
      return NextResponse.json(
        { error: "Bu e-posta adresi zaten kullanılıyor." },
        { status: 400 }
      );
    }

    // Telefon mükerrerlik kontrolü
    const existingPhone = await prisma.user.findFirst({
      where: { phone: cleanPhone },
    });

    if (existingPhone) {
      return NextResponse.json(
        { error: "Bu telefon numarası ile daha önce kayıt olunmuş." },
        { status: 400 }
      );
    }

    // T.C. Kimlik No mükerrerlik kontrolü
    const existingTc = await prisma.user.findFirst({
      where: { tcNo: cleanTcNo },
    });

    if (existingTc) {
      return NextResponse.json(
        { error: "Bu T.C. Kimlik Numarası ile daha önce kayıt olunmuş." },
        { status: 400 }
      );
    }

    // Görüntülenecek İsim (Kullanıcı adı girildiyse o, girilmediyse "Ad Soyad")
    const computedName = username && username.trim() !== "" 
      ? username.trim() 
      : `${firstName.trim()} ${lastName.trim()}`;

    const passwordHash = await bcrypt.hash(password, 10);

    const welcomeSetting = await prisma.systemSetting.findUnique({
      where: { key: "USER_WELCOME_CREDIT" },
    });
    const welcomeCredits = welcomeSetting && !isNaN(parseInt(welcomeSetting.value, 10))
      ? parseInt(welcomeSetting.value, 10)
      : 10;

    const user = await prisma.user.create({
      data: {
        email: email.trim().toLowerCase(),
        phone: cleanPhone,
        tcNo: cleanTcNo,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        username: username?.trim() || null,
        name: computedName,
        passwordHash,
        credits: welcomeCredits,
      },
    });

    if (welcomeCredits > 0) {
      await prisma.credit.create({
        data: {
          userId: user.id,
          amount: welcomeCredits,
          type: "EARN",
          reason: "Yeni Üyelik Hoş Geldin Hediyesi",
        },
      });
    }

    return NextResponse.json(
      { message: "Kayıt başarılı", user: { id: user.id, email: user.email, name: user.name } },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Kayıt hatası:", error);
    return NextResponse.json(
      { error: error?.message || "Bir sunucu hatası oluştu." },
      { status: 500 }
    );
  }
}
