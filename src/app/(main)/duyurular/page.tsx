import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import AnnouncementList from "@/components/shared/AnnouncementList";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Duyurular & Bilgilendirmeler | Tarımsal e-Danışman",
  description: "Tarımsal e-Danışman platform duyuruları, yenilikler ve topluluk bilgilendirmeleri.",
};

export default async function DuyurularPage() {
  const session = await auth();
  const isAdmin = session?.user?.role === "ADMIN";

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
    <div className="container max-w-4xl py-8 space-y-8">
      {/* Header */}
      <div className="card p-6 border-l-4 border-amber-500 bg-amber-50/20 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">📢</span>
            <div>
              <h1 className="text-2xl font-extrabold text-[var(--on-surface)]">Platform Duyuruları ve Bilgilendirmeler</h1>
              <p className="text-xs text-[var(--on-surface-variant)]">
                Tarımsal e-Danışman topluluğu için sistem yenilikleri, güncellemeler ve yönetici duyuruları.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Duyuru Listesi ve Yönetici Paneli Bileşeni */}
      <AnnouncementList 
        initialAnnouncements={announcements} 
        isAdmin={isAdmin}
      />
    </div>
  );
}
