import { prisma } from "@/lib/prisma";
import AdminAnnouncementManager from "@/components/admin/AdminAnnouncementManager";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Duyuru Yönetimi | Admin Paneli",
  description: "Platform duyurularını ve bilgilendirme haberlerini yönetin.",
};

export default async function AdminDuyurularPage() {
  const announcements = await prisma.announcement.findMany({
    orderBy: [
      { isPinned: "desc" },
      { createdAt: "desc" },
    ],
    include: {
      author: {
        select: {
          id: true,
          name: true,
          image: true,
          avatarUrl: true,
          role: true,
        },
      },
    },
  });

  return (
    <div className="space-y-6">
      <AdminAnnouncementManager initialAnnouncements={announcements} />
    </div>
  );
}
