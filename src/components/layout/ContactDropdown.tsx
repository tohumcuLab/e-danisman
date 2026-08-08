"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

export function ContactDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Buton Icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full hover:bg-[var(--surface-variant)] text-[var(--on-surface-variant)] transition-colors relative"
        title="İletişim & Reklam"
        aria-label="İletişim ve Reklam Menüsü"
      >
        {/* İletişim / Hoparlör İkonu */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-6 h-6 text-[var(--primary)]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
      </button>

      {/* Menü İçeriği */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-[var(--surface)] text-[var(--on-surface)] border border-[var(--outline-variant)] rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          <div className="bg-[var(--surface-container-high)] p-3 border-b border-[var(--outline-variant)]">
            <h3 className="font-extrabold text-xs text-[var(--primary)] uppercase tracking-wider">
              İletişim & Reklam Hizmetleri
            </h3>
          </div>

          <div className="p-2 space-y-1 text-xs">
            <Link
              href="/iletisim?tab=contact"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[var(--surface-container-low)] transition-colors group"
            >
              <span className="text-base p-1.5 rounded-lg bg-[var(--primary)]/10 text-[var(--primary)] group-hover:bg-[var(--primary)] group-hover:text-white transition-colors">
                📩
              </span>
              <div>
                <div className="font-bold">İletişim & Sorun Bildir</div>
                <div className="text-[10px] text-[var(--on-surface-variant)]">Bize mesaj veya geri bildirim iletin</div>
              </div>
            </Link>

            <Link
              href="/iletisim?tab=ad"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[var(--surface-container-low)] transition-colors group"
            >
              <span className="text-base p-1.5 rounded-lg bg-amber-500/10 text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                📢
              </span>
              <div>
                <div className="font-bold text-amber-700 dark:text-amber-400">Sponsor & Reklam Ver</div>
                <div className="text-[10px] text-[var(--on-surface-variant)]">Gösterim bazlı reklam paketleri</div>
              </div>
            </Link>

            <Link
              href="/iletisim?tab=consultant"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[var(--surface-container-low)] transition-colors group"
            >
              <span className="text-base p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                👨‍🌾
              </span>
              <div>
                <div className="font-bold">Danışman (Uzman) Başvurusu</div>
                <div className="text-[10px] text-[var(--on-surface-variant)]">Uzman kadromuza hemen katılın</div>
              </div>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
