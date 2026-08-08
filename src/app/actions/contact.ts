"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function submitContactMessage(data: {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  type: "GENERAL" | "CONSULTANT_APP";
}) {
  try {
    await prisma.contactMessage.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        subject: data.subject || null,
        message: data.message,
        type: data.type,
      },
    });
    return { success: true };
  } catch (error) {
    console.error("Contact message creation failed:", error);
    return { success: false, error: "Mesajınız gönderilirken bir hata oluştu." };
  }
}

export async function submitAdRequest(data: {
  name: string;
  email: string;
  phone: string;
  companyName?: string;
  adTitle: string;
  destinationUrl: string;
  imageUrl?: string;
  packageId: string;
  price: number;
}) {
  try {
    const request = await prisma.adRequest.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        companyName: data.companyName || null,
        adTitle: data.adTitle,
        destinationUrl: data.destinationUrl,
        imageUrl: data.imageUrl || null,
        packageId: data.packageId,
        price: data.price,
        status: "PENDING_PAYMENT",
      },
    });
    
    return { success: true, requestId: request.id };
  } catch (error) {
    console.error("Ad request creation failed:", error);
    return { success: false, error: "Reklam başvurusu oluşturulurken bir hata oluştu." };
  }
}

export async function approveAdRequest(requestId: string, impressionLimit: number) {
  try {
    const request = await prisma.adRequest.findUnique({
      where: { id: requestId }
    });

    if (!request) {
      throw new Error("Reklam başvurusu bulunamadı.");
    }

    // Reklam başvurusu onaylandığında gerçek bir "Ad" oluştur.
    const newAd = await prisma.ad.create({
      data: {
        type: "MANUAL",
        placement: "FEED",
        title: request.adTitle,
        destinationUrl: request.destinationUrl,
        imageUrl: request.imageUrl,
        impressionLimit: impressionLimit,
        impressionCount: 0,
        clickCount: 0,
        isActive: true,
      }
    });

    // Başvurunun durumunu güncelle
    await prisma.adRequest.update({
      where: { id: requestId },
      data: { status: "APPROVED" }
    });

    revalidatePath("/admin/reklam-basvurulari");
    return { success: true, adId: newAd.id };
  } catch (error) {
    console.error("Ad request approval failed:", error);
    return { success: false, error: "Reklam onaylanırken bir hata oluştu." };
  }
}
