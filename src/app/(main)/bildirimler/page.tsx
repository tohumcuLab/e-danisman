import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function BildirimlerPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/giris");
  }

  // Kullanıcının tüm bildirimlerini getir
  const notifications = await prisma.notification.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 100, // Şimdilik son 100 bildirimi alalım
  });

  return (
    <div className="container py-8 max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">Bildirimler</h1>

      {notifications.length === 0 ? (
        <div className="bg-[var(--surface)] border border-[var(--outline-variant)] rounded-xl p-8 text-center text-gray-500">
          Henüz hiç bildiriminiz yok.
        </div>
      ) : (
        <div className="bg-[var(--surface)] border border-[var(--outline-variant)] rounded-xl overflow-hidden">
          <ul className="divide-y divide-[var(--outline-variant)]">
            {notifications.map((notification: any) => {
              // Bildirim tipine göre yönlendirme linki oluştur
              let linkHref = "#";
              if (notification.relatedId && ["NEW_ANSWER", "ANSWER_ACCEPTED", "ANSWER_LIKED", "QUESTION_APPROVED", "QUESTION_REJECTED"].includes(notification.type)) {
                linkHref = `/soru/${notification.relatedId}`;
              }

              return (
                <li key={notification.id}>
                  {linkHref !== "#" ? (
                    <Link 
                      href={linkHref}
                      className={`block p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                        !notification.isRead ? "bg-blue-50/50 dark:bg-blue-900/20" : ""
                      }`}
                    >
                      <NotificationContent notification={notification} />
                    </Link>
                  ) : (
                    <div className={`p-4 ${!notification.isRead ? "bg-blue-50/50 dark:bg-blue-900/20" : ""}`}>
                      <NotificationContent notification={notification} />
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

function NotificationContent({ notification }: { notification: any }) {
  return (
    <div className="flex gap-4 items-start">
      <div className="mt-1 flex-shrink-0 text-[var(--primary)] text-lg">
        {notification.type === "NEW_ANSWER" && "💬"}
        {notification.type === "ANSWER_ACCEPTED" && "✅"}
        {notification.type === "ANSWER_LIKED" && "❤️"}
        {notification.type === "CREDIT_EARNED" && "💰"}
        {notification.type === "QUESTION_APPROVED" && "🎉"}
        {notification.type === "QUESTION_REJECTED" && "❌"}
        {!["NEW_ANSWER", "ANSWER_ACCEPTED", "ANSWER_LIKED", "CREDIT_EARNED", "QUESTION_APPROVED", "QUESTION_REJECTED"].includes(notification.type) && "🔔"}
      </div>
      <div>
        <p className={`text-gray-800 dark:text-gray-200 ${!notification.isRead ? "font-semibold" : ""}`}>
          {notification.message}
        </p>
        <span className="text-xs text-gray-500 mt-1 block">
          {new Date(notification.createdAt).toLocaleString('tr-TR')}
        </span>
      </div>
    </div>
  );
}
