"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Notification = {
  id: string;
  type: string;
  message: string;
  isRead: boolean;
  relatedId: string | null;
  createdAt: string;
};

export function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications?limit=5");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (error) {
      console.error("Failed to fetch notifications", error);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Dışarıya tıklanıldığında kapatma
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleOpen = async () => {
    const newIsOpen = !isOpen;
    setIsOpen(newIsOpen);

    // Eğer menü açılıyorsa ve okunmamış bildirim varsa hepsini okundu işaretle
    if (newIsOpen && unreadCount > 0) {
      setUnreadCount(0); // Optmistic update
      
      try {
        await fetch("/api/notifications/read-all", { method: "POST" });
        // Sadece client tarafında okunmamışları okundu olarak gösterelim ki menüde soluk görünsünler
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      } catch (error) {
        console.error("Failed to mark notifications as read", error);
        // Hata olursa geri alabiliriz ama UX için pek gerek yok
      }
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    setIsOpen(false);
    if (notification.relatedId && ["NEW_ANSWER", "ANSWER_ACCEPTED", "ANSWER_LIKED", "QUESTION_APPROVED", "QUESTION_REJECTED"].includes(notification.type)) {
      router.push(`/soru/${notification.relatedId}`);
    } else {
      router.push("/bildirimler");
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={handleOpen}
        className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 text-gray-600 hover:text-[var(--primary)] hover:bg-[var(--surface-variant)] dark:hover:bg-gray-800 rounded-full transition-colors relative"
        title="Bildirimler"
        aria-label="Bildirimler Menüsü"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
        </svg>
        
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center w-4 h-4 text-[9px] font-bold text-white bg-red-500 border-2 border-[var(--surface-container)] rounded-full">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-[var(--surface-container)] rounded-xl shadow-lg border border-[var(--outline-variant)] overflow-hidden z-50">
          <div className="p-3 border-b border-[var(--outline-variant)] flex justify-between items-center bg-[var(--surface)]">
            <h3 className="font-semibold text-gray-800 dark:text-gray-200">Bildirimler</h3>
          </div>
          
          <div className="max-h-[350px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-gray-500 text-sm">
                Henüz hiç bildiriminiz yok.
              </div>
            ) : (
              <ul className="divide-y divide-[var(--outline-variant)]">
                {notifications.map((notification) => (
                  <li key={notification.id}>
                    <button
                      onClick={() => handleNotificationClick(notification)}
                      className={`w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                        !notification.isRead ? "bg-blue-50/50 dark:bg-blue-900/20" : ""
                      }`}
                    >
                      <p className={`text-sm ${!notification.isRead ? "font-semibold" : "text-gray-600 dark:text-gray-300"}`}>
                        {notification.message}
                      </p>
                      <span className="text-xs text-gray-400 mt-1 block">
                        {new Date(notification.createdAt).toLocaleString('tr-TR')}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          <div className="p-2 border-t border-[var(--outline-variant)] bg-[var(--surface)] text-center">
            <Link 
              href="/bildirimler" 
              onClick={() => setIsOpen(false)}
              className="text-sm text-[var(--primary)] font-medium hover:underline inline-block w-full"
            >
              Tümünü Gör
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
