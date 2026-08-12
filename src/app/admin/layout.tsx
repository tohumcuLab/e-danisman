import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  // Rol kontrolü: Sadece ADMIN girebilir
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <div className="container py-8 flex flex-col md:flex-row gap-8 min-h-[80vh]">
      {/* Admin Sidebar */}
      <aside className="w-full md:w-64 flex-shrink-0">
        <div className="card p-4 sticky top-24">
          <h2 className="font-bold text-lg mb-4 px-2 border-b border-[var(--outline-variant)] pb-2 text-[var(--primary)]">
            Admin Paneli
          </h2>
          <nav className="flex flex-col gap-1">
            <Link href="/admin" className="px-3 py-2 rounded-md hover:bg-[var(--surface-variant)] transition-colors">
              Dashboard
            </Link>
            <Link href="/admin/soru-onaylari" className="px-3 py-2 rounded-md hover:bg-[var(--surface-variant)] transition-colors font-bold text-amber-600 dark:text-amber-400 flex items-center justify-between">
              <span>❓ Soru Onayları</span>
              <span className="text-[10px] bg-amber-500/20 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full">Yeni</span>
            </Link>
            <Link href="/admin/reports" className="px-3 py-2 rounded-md hover:bg-[var(--surface-variant)] transition-colors">
              Şikayetler / Raporlar
            </Link>
            <Link href="/admin/users" className="px-3 py-2 rounded-md hover:bg-[var(--surface-variant)] transition-colors">
              Kullanıcı Yönetimi
            </Link>
            <Link href="/admin/uzmanlar" className="px-3 py-2 rounded-md hover:bg-[var(--surface-variant)] transition-colors">
              Uzman Yönetimi
            </Link>
            <Link href="/admin/ads" className="px-3 py-2 rounded-md hover:bg-[var(--surface-variant)] transition-colors">
              Yayındaki Reklamlar
            </Link>
            <Link href="/admin/reklam-basvurulari" className="px-3 py-2 rounded-md hover:bg-[var(--surface-variant)] transition-colors font-semibold text-amber-600">
              Reklam Başvuruları
            </Link>
            <Link href="/admin/duyurular" className="px-3 py-2 rounded-md hover:bg-[var(--surface-variant)] transition-colors font-bold text-emerald-700 dark:text-emerald-400">
              📢 Duyuru Yönetimi
            </Link>
            <Link href="/admin/iletisim" className="px-3 py-2 rounded-md hover:bg-[var(--surface-variant)] transition-colors">
              İletişim & Başvurular
            </Link>
            <Link href="/admin/settings" className="px-3 py-2 rounded-md hover:bg-[var(--surface-variant)] transition-colors">
              Sistem Ayarları
            </Link>
          </nav>
        </div>
      </aside>

      {/* Admin Content */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
