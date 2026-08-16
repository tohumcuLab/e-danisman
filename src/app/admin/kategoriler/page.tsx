import { prisma } from "@/lib/prisma";
import AdminCategoryManager from "@/components/admin/AdminCategoryManager";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Kategori Yönetimi | Admin Paneli",
  description: "Platform soru kategorilerini ve ikonlarını yönetin.",
};

export default async function AdminKategorilerPage() {
  const categories = await prisma.category.findMany({
    orderBy: { order: "asc" },
    include: {
      _count: {
        select: { questions: true }
      }
    }
  });

  return (
    <div className="space-y-6">
      <AdminCategoryManager initialCategories={categories as any} />
    </div>
  );
}
