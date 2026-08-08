import LeftSidebarWidgets from "@/components/layout/LeftSidebarWidgets";
import RightSidebarWidgets from "@/components/layout/RightSidebarWidgets";
import IletisimForm from "@/components/iletisim/IletisimForm";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function İletisimPage() {
  const settings = await prisma.systemSetting.findMany();
  const settingsMap = settings.reduce((acc, curr) => {
    acc[curr.key] = curr.value;
    return acc;
  }, {} as Record<string, string>);

  let dbPackages = await prisma.adPackage.findMany({
    where: { isActive: true },
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
  });

  return (
    <div className="container mx-auto px-4">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sol Kolon */}
        <LeftSidebarWidgets />

        {/* Orta Kolon: İletişim Formları */}
        <section className="col-span-12 lg:col-span-6 space-y-6">
          <Suspense fallback={<div className="card p-6">Yükleniyor...</div>}>
            <IletisimForm adSettings={settingsMap} initialPackages={dbPackages} />
          </Suspense>
        </section>

        {/* Sağ Kolon */}
        <RightSidebarWidgets />
      </div>
    </div>
  );
}
