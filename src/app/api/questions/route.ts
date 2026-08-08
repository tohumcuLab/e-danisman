import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }

    const {
      title,
      body,
      categoryId,
      cropType,
      city,
      district,
      village,
      images,
      tags
    } = await req.json();

    if (!title || !body || !categoryId) {
      return NextResponse.json({ error: "Gerekli alanları doldurun" }, { status: 400 });
    }

    const userId = session.user.id;

    const baseCostSetting = await prisma.systemSetting.findUnique({
      where: { key: "QUESTION_BASE_CREDIT_COST" },
    });
    const baseCost = baseCostSetting && !isNaN(parseInt(baseCostSetting.value, 10))
      ? parseInt(baseCostSetting.value, 10)
      : 4;

    const imageCount = images?.length || 0;
    const extraImageCost = Math.max(0, imageCount - 2);
    const totalCreditCost = baseCost + extraImageCost;

    // Kredi kontrolü ve soru oluşturma işlemini transaction içinde yapıyoruz
    const result = await prisma.$transaction(async (tx) => {
      // 1. Kullanıcıyı, kredisini ve ban durumunu kontrol et
      const user = await tx.user.findUnique({ where: { id: userId } });
      
      if (!user) {
        throw new Error("Kullanıcı bulunamadı");
      }

      if (user.isBanned && (!user.bannedUntil || new Date(user.bannedUntil) > new Date())) {
        throw new Error(`BANNED:${user.banReason || "Hesabınız kural ihlali sebebiyle kısıtlanmıştır."}`);
      }
      
      const isPremium = user.premiumUntil && user.premiumUntil > new Date();
      const actualCreditCost = isPremium ? 0 : totalCreditCost;

      if (!isPremium) {
        if (user.credits < totalCreditCost) {
          throw new Error(`INSUFFICIENT_CREDITS:${totalCreditCost}`);
        }

        // 2. Krediyi düşür
        await tx.user.update({
          where: { id: userId },
          data: { credits: { decrement: totalCreditCost } }
        });

        // 3. Kredi işlem geçmişini ekle
        await tx.credit.create({
          data: {
            userId: userId,
            amount: totalCreditCost,
            type: "SPEND",
            reason: extraImageCost > 0 
              ? `Soru sorma ücreti (${baseCost} Kredi Temel + ${extraImageCost} Ekstra Resim Kredisi)` 
              : "Soru sorma ücreti"
          }
        });
      }

      // 4. Soruyu oluştur (Varsayılan olarak PENDING_APPROVAL statüsünde)
      const question = await tx.question.create({
        data: {
          title,
          body,
          userId,
          categoryId,
          cropType,
          city,
          district,
          village,
          status: "PENDING_APPROVAL",
          creditCost: actualCreditCost,
          // Resimleri ekle
          images: {
            create: images?.map((url: string, index: number) => ({
              url,
              order: index
            })) || []
          }
        }
      });

      // Etiketleri işle
      if (tags && Array.isArray(tags) && tags.length > 0) {
        for (const tagName of tags) {
          const slug = tagName.toLowerCase().replace(/[^a-z0-9]/g, '-');
          
          let tag = await tx.tag.findUnique({ where: { slug } });
          if (!tag) {
            tag = await tx.tag.create({ data: { name: tagName, slug } });
          }
          
          await tx.questionTag.create({
            data: {
              questionId: question.id,
              tagId: tag.id
            }
          });
        }
      }

      return question;
    });

    return NextResponse.json({ message: "Soru oluşturuldu", question: result }, { status: 201 });
  } catch (error: any) {
    console.error("Soru oluşturma hatası:", error);
    
    if (error.message?.startsWith("BANNED:")) {
      const reason = error.message.split(":")[1] || "Hesabınız kısıtlanmıştır.";
      return NextResponse.json({ error: `Hesabınız kısıtlanmıştır: ${reason}` }, { status: 403 });
    }

    if (error.message?.startsWith("INSUFFICIENT_CREDITS")) {
      const required = error.message.split(":")[1] || "4";
      return NextResponse.json({ error: `Yeterli krediniz bulunmamaktadır (Gereken: ${required} Kredi)` }, { status: 403 });
    }
    
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
