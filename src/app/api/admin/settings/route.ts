import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 403 });
    }

    const body = await req.json();

    // Toplu ayar güncellemesi desteği (Batch settings update)
    if (body.settings && Array.isArray(body.settings)) {
      const items: { key: string; value: string }[] = body.settings;
      
      let tlValueUpdated = false;
      let newTlValue = "";

      let userCreditSettingsUpdated = false;

      for (const item of items) {
        if (!item.key || item.value === undefined) continue;

        if (item.key === "EXPERT_POINT_TL_VALUE") {
          const oldSetting = await prisma.systemSetting.findUnique({ where: { key: item.key } });
          if (!oldSetting || oldSetting.value !== item.value) {
            tlValueUpdated = true;
            newTlValue = item.value;
          }
        }

        if (["USER_WELCOME_CREDIT", "USER_AD_REWARD_CREDIT", "DAILY_AD_LIMIT", "QUESTION_BASE_CREDIT_COST"].includes(item.key)) {
          const oldSetting = await prisma.systemSetting.findUnique({ where: { key: item.key } });
          if (!oldSetting || oldSetting.value !== item.value) {
            userCreditSettingsUpdated = true;
          }
        }

        await prisma.systemSetting.upsert({
          where: { key: item.key },
          update: { value: String(item.value) },
          create: { key: item.key, value: String(item.value) },
        });
      }

      // 1. Uzman TL Çarpanı Bildirimi
      if (tlValueUpdated && newTlValue) {
        const experts = await prisma.user.findMany({ where: { role: "EXPERT" } });
        const notifications = experts.map((expert) => ({
          userId: expert.id,
          type: "SYSTEM",
          message: `Uzman Puan Çarpanı güncellendi: 1 Puan = ${newTlValue} TL oldu.`,
        }));

        if (notifications.length > 0) {
          await prisma.notification.createMany({
            data: notifications,
          });
        }
      }

      // 2. Üye Kredi Sistemi Güncelleme Bildirimi
      if (userCreditSettingsUpdated) {
        const allSettings = await prisma.systemSetting.findMany();
        const sMap = allSettings.reduce((acc, curr) => {
          acc[curr.key] = curr.value;
          return acc;
        }, {} as Record<string, string>);

        const adReward = sMap["USER_AD_REWARD_CREDIT"] || "5";
        const adLimit = sMap["DAILY_AD_LIMIT"] || "5";
        const qCost = sMap["QUESTION_BASE_CREDIT_COST"] || "4";

        const allUsers = await prisma.user.findMany({ select: { id: true } });
        const userNotifications = allUsers.map((u) => ({
          userId: u.id,
          type: "SYSTEM",
          message: `📢 Kredi Kazanım & Harcama Kuralları Güncellendi! Reklam izleme ödülü ${adReward} Kredi (Günlük limit: ${adLimit}), Soru sorma maliyeti ${qCost} Kredi oldu.`,
        }));

        if (userNotifications.length > 0) {
          await prisma.notification.createMany({
            data: userNotifications,
          });
        }
      }

      return NextResponse.json({ message: "Tüm ayarlar kaydedildi" }, { status: 200 });
    }

    // Tekli ayar güncellemesi
    const { key, value } = body;

    if (!key || value === undefined) {
      return NextResponse.json({ error: "Anahtar ve değer zorunludur" }, { status: 400 });
    }

    const oldSetting = await prisma.systemSetting.findUnique({ where: { key } });

    const setting = await prisma.systemSetting.upsert({
      where: { key },
      update: { value: String(value) },
      create: { key, value: String(value) },
    });

    if (key === "EXPERT_POINT_TL_VALUE" && oldSetting?.value !== String(value)) {
      const experts = await prisma.user.findMany({ where: { role: "EXPERT" } });
      const notifications = experts.map((expert) => ({
        userId: expert.id,
        type: "SYSTEM",
        message: `Uzman Puan Çarpanı güncellendi: 1 Puan = ${value} TL oldu.`,
      }));

      if (notifications.length > 0) {
        await prisma.notification.createMany({
          data: notifications,
        });
      }
    }

    return NextResponse.json({ message: "Ayar kaydedildi", setting }, { status: 200 });
  } catch (error) {
    console.error("Ayar kaydetme hatası:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
