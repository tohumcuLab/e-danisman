"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

async function verifyAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Bu işlem için yetkiniz bulunmamaktadır.");
  }
  return session.user;
}

export async function approveQuestion(questionId: string) {
  try {
    await verifyAdmin();

    const question = await prisma.question.findUnique({
      where: { id: questionId },
      select: { id: true, title: true, userId: true, status: true }
    });

    if (!question) {
      return { success: false, error: "Soru bulunamadı." };
    }

    // Sorunun durumunu OPEN yap ve bildirimi gönder
    await prisma.$transaction(async (tx) => {
      await tx.question.update({
        where: { id: questionId },
        data: { status: "OPEN" }
      });

      await tx.notification.create({
        data: {
          userId: question.userId,
          type: "QUESTION_APPROVED",
          message: `"${question.title.substring(0, 35)}..." sorunuz yönetici tarafından onaylandı ve yayına alındı! 🎉`,
          relatedId: questionId,
        }
      });
    });

    revalidatePath("/admin/soru-onaylari");
    revalidatePath("/");
    revalidatePath(`/soru/${questionId}`);

    return { success: true };
  } catch (error: any) {
    console.error("Approve question failed:", error);
    return { success: false, error: error.message || "Soru onaylanırken bir hata oluştu." };
  }
}

export async function rejectQuestion(questionId: string, reason?: string) {
  try {
    await verifyAdmin();

    const question = await prisma.question.findUnique({
      where: { id: questionId },
      select: { id: true, title: true, userId: true, creditCost: true, status: true }
    });

    if (!question) {
      return { success: false, error: "Soru bulunamadı." };
    }

    const rejectReasonText = reason ? ` (Nedeni: ${reason})` : "";

    await prisma.$transaction(async (tx) => {
      // 1. Sorunun durumunu REJECTED yap
      await tx.question.update({
        where: { id: questionId },
        data: { status: "REJECTED" }
      });

      // 2. Kullanıcıya krediyi geri iade et
      if (question.creditCost > 0) {
        await tx.user.update({
          where: { id: question.userId },
          data: { credits: { increment: question.creditCost } }
        });

        await tx.credit.create({
          data: {
            userId: question.userId,
            amount: question.creditCost,
            type: "EARN",
            reason: `Reddedilen soru için kredi iadesi${rejectReasonText}`
          }
        });
      }

      // 3. Bildirim gönder
      await tx.notification.create({
        data: {
          userId: question.userId,
          type: "QUESTION_REJECTED",
          message: `"${question.title.substring(0, 35)}..." sorunuz içerik standartlarına uymadığı için reddedildi.${rejectReasonText} ${question.creditCost} Krediniz hesabınıza iade edildi.`,
          relatedId: questionId,
        }
      });
    });

    revalidatePath("/admin/soru-onaylari");
    revalidatePath("/");
    revalidatePath(`/soru/${questionId}`);

    return { success: true };
  } catch (error: any) {
    console.error("Reject question failed:", error);
    return { success: false, error: error.message || "Soru reddedilirken bir hata oluştu." };
  }
}

export async function deleteQuestion(questionId: string) {
  try {
    await verifyAdmin();

    await prisma.question.delete({
      where: { id: questionId }
    });

    revalidatePath("/admin/soru-onaylari");
    revalidatePath("/");

    return { success: true };
  } catch (error: any) {
    console.error("Delete question failed:", error);
    return { success: false, error: error.message || "Soru silinirken bir hata oluştu." };
  }
}

export async function updatePendingQuestion({
  questionId,
  title,
  body,
  categoryId,
  cropType,
  images
}: {
  questionId: string;
  title: string;
  body: string;
  categoryId: string;
  cropType?: string;
  images?: string[];
}) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Giriş yapmanız gerekmektedir." };
    }

    const question = await prisma.question.findUnique({
      where: { id: questionId },
      select: { id: true, userId: true, status: true }
    });

    if (!question) {
      return { success: false, error: "Soru bulunamadı." };
    }

    const isOwner = question.userId === session.user.id;
    const isAdmin = session.user.role === "ADMIN";

    if (!isOwner && !isAdmin) {
      return { success: false, error: "Bu soruyu düzenleme yetkiniz bulunmamaktadır." };
    }

    if (question.status !== "PENDING_APPROVAL" && !isAdmin) {
      return { success: false, error: "Onaylanmış veya sonuçlanmış sorular düzenlenemez." };
    }

    await prisma.$transaction(async (tx) => {
      // Görselleri güncelle (varsa)
      if (images !== undefined) {
        await tx.questionImage.deleteMany({
          where: { questionId }
        });

        if (images.length > 0) {
          await tx.questionImage.createMany({
            data: images.map((url, index) => ({
              questionId,
              url,
              order: index
            }))
          });
        }
      }

      await tx.question.update({
        where: { id: questionId },
        data: {
          title,
          body,
          categoryId,
          cropType: cropType || null,
        }
      });
    });

    revalidatePath(`/soru/${questionId}`);
    revalidatePath("/admin/soru-onaylari");
    revalidatePath("/");

    return { success: true };
  } catch (error: any) {
    console.error("Update pending question failed:", error);
    return { success: false, error: error.message || "Soru güncellenirken bir hata oluştu." };
  }
}
