import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import ProfileEditForm from "@/components/shared/ProfileEditForm";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/giris");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) {
    redirect("/giris");
  }

  return (
    <div className="container max-w-4xl py-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-[var(--outline-variant)]">
        <div>
          <h1 className="text-2xl font-bold text-[var(--on-surface)]">Profil Ayarlarım 👤</h1>
          <p className="text-xs text-[var(--on-surface-variant)]">Hesap bilgilerinizi ve üyelik detaylarınızı yönetin.</p>
        </div>
        <Link 
          href={`/kullanici/${user.id}`} 
          className="btn bg-[var(--primary)] text-white hover:bg-[var(--primary-container)] text-xs font-bold px-4 py-2.5 rounded-xl shadow"
        >
          👁️ Topluluk Profilimi Görüntüle
        </Link>
      </div>
      
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          <div className="card text-center p-6 space-y-4">
            <div className="w-24 h-24 bg-[var(--primary)] text-white rounded-full flex items-center justify-center text-3xl mx-auto font-extrabold shadow-md border-4 border-white dark:border-gray-800">
              {user.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <div>
              <h2 className="text-xl font-bold text-[var(--on-surface)]">{user.name}</h2>
              <p className="text-[var(--on-surface-variant)] text-xs">{user.email}</p>
            </div>

            <div className="bg-[var(--surface-container-low)] border border-[var(--outline-variant)] rounded-2xl p-4 mt-4">
              <div className="text-[11px] text-[var(--on-surface-variant)] uppercase tracking-wider font-extrabold mb-1">
                MEVCUT KREDİ
              </div>
              <div className="text-3xl font-extrabold text-[var(--primary)]">
                {user.credits} 🪙
              </div>
              <Link href="/kredi-kazan" className="text-xs font-bold text-[var(--secondary)] hover:underline mt-2 inline-block">
                + Kredi Kazan ➔
              </Link>
            </div>
          </div>

          {user.bio && (
            <div className="card p-5 text-xs italic text-[var(--on-surface-variant)] leading-relaxed border-l-4 border-[var(--primary)]">
              "{user.bio}"
            </div>
          )}
        </div>
        
        <div className="md:col-span-2">
          <div className="card p-6 md:p-8 space-y-4">
            <h3 className="text-base font-bold text-[var(--on-surface)] border-b border-[var(--outline-variant)] pb-3">
              Profil Bilgilerini Düzenle
            </h3>
            <ProfileEditForm user={user} />
          </div>
        </div>
      </div>
    </div>
  );
}
