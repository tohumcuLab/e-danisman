"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function UzmanDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/giris");
    } else if (status === "authenticated") {
      if (session?.user?.role !== "EXPERT") {
        router.push("/");
        return;
      }
      
      setLoading(true);
      fetch(`/api/expert/dashboard?page=${page}`)
        .then((res) => res.json())
        .then((json) => {
          if (!json.error) {
            setData(json);
          }
        })
        .finally(() => setLoading(false));
    }
  }, [status, router, session, page]);

  if (status === "loading" || (!data && loading)) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (!data) return null;

  const { stats, recentLogs, pagination } = data;

  const actionLabels: Record<string, string> = {
    ANSWER: "Onaylı Cevap",
    LIKE: "Cevap Beğenisi",
    BEST_ANSWER: "En İyi Cevap Seçimi",
    ADMIN_HIGHLIGHT: "Admin Öne Çıkarma",
    SPAM: "Spam Cezası",
    WRONG_INFO: "Yanlış Bilgi Cezası"
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Uzman Danışman Paneli</h1>
        <Link href={`/kullanici/${session?.user?.id}`} className="text-sm font-medium text-[var(--primary)] hover:underline">
          Profilimi Gör
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-5 bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-200 dark:border-green-900/30">
          <p className="text-sm text-green-700 dark:text-green-400 font-semibold mb-1">Toplam Alacak Bakiyesi</p>
          <p className="text-3xl font-extrabold text-green-800 dark:text-green-300">
            {(stats.totalBalanceTL || 0).toLocaleString("tr-TR", { minimumFractionDigits: 2 })} TL
          </p>
          <p className="text-xs text-green-600 dark:text-green-400 mt-1">
            {stats.unpaidPoints || 0} ödenmemiş puan (1 Puan = {stats.tlMultiplier} TL)
          </p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-[var(--on-surface-variant)] font-semibold mb-1">Haftalık Puan</p>
          <p className="text-3xl font-bold text-[var(--primary)]">+{stats.weeklyScore}</p>
          <p className="text-xs text-[var(--on-surface-variant)] mt-1">
            Haftalık Hak Ediş: {(stats.estimatedPayment || 0).toLocaleString("tr-TR", { minimumFractionDigits: 2 })} TL
          </p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-[var(--on-surface-variant)] font-semibold mb-1">Aylık Puan</p>
          <p className="text-3xl font-bold text-[var(--on-surface)]">+{stats.monthlyScore}</p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-[var(--on-surface-variant)] font-semibold mb-1">Tüm Zamanlar Toplam Puan</p>
          <p className="text-3xl font-bold text-[var(--on-surface)]">{stats.totalScore} Puan</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-4 flex justify-between items-center">
          <span className="font-medium text-gray-600 dark:text-gray-300">Bu Hafta Yazılan Cevap</span>
          <span className="text-xl font-bold bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">{stats.weeklyAnswers}</span>
        </div>
        <div className="card p-4 flex justify-between items-center">
          <span className="font-medium text-gray-600 dark:text-gray-300">Bu Hafta Alınan Beğeni</span>
          <span className="text-xl font-bold bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">{stats.weeklyLikes}</span>
        </div>
        <div className="card p-4 flex justify-between items-center">
          <span className="font-medium text-gray-600 dark:text-gray-300">Bu Hafta En İyi Cevap</span>
          <span className="text-xl font-bold bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500 px-3 py-1 rounded-full">{stats.weeklyBestAnswers}</span>
        </div>
      </div>

      <div className="card p-6 relative">
        {loading && (
          <div className="absolute inset-0 bg-[var(--surface)]/50 backdrop-blur-sm z-10 flex items-center justify-center rounded-xl">
            <LoadingSpinner />
          </div>
        )}
        <h2 className="text-lg font-bold mb-4">Son İşlemler</h2>
        {recentLogs.length === 0 ? (
          <p className="text-gray-500 text-sm">Henüz bir puan hareketiniz bulunmuyor.</p>
        ) : (
          <div className="space-y-3">
            {recentLogs.map((log: any) => (
              <div key={log.id} className="flex justify-between items-center p-3 rounded-lg bg-[var(--surface-variant)] border border-[var(--outline-variant)]">
                <div>
                  <p className="font-medium text-sm">{actionLabels[log.action] || log.action}</p>
                  <p className="text-xs text-gray-500">{new Date(log.createdAt).toLocaleString("tr-TR")}</p>
                </div>
                <div className={`font-bold ${log.points > 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                  {log.points > 0 ? "+" : ""}{log.points}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Sayfalama Kontrolleri */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 mt-6 pt-4 border-t border-[var(--outline-variant)]">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 text-sm font-medium border border-[var(--outline-variant)] rounded-lg hover:bg-[var(--surface-variant)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Önceki
            </button>
            <span className="text-sm text-[var(--on-surface-variant)]">
              Sayfa {page} / {pagination.totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
              disabled={page === pagination.totalPages}
              className="px-4 py-2 text-sm font-medium border border-[var(--outline-variant)] rounded-lg hover:bg-[var(--surface-variant)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Sonraki
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
