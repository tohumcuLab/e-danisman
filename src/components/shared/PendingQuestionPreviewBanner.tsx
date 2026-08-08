"use client";

import { useState } from "react";
import EditPendingQuestionModal from "./EditPendingQuestionModal";

interface PendingQuestionPreviewProps {
  question: any;
  categories: { id: string; name: string }[];
  isOwnerOrAdmin: boolean;
}

export function PendingQuestionPreviewBanner() {
  return (
    <div className="mb-6 p-5 bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-transparent border-2 border-amber-500/40 text-amber-900 dark:text-amber-200 rounded-2xl shadow-sm space-y-2">
      <div className="flex items-center gap-2 text-sm font-extrabold text-amber-800 dark:text-amber-300">
        <span className="text-xl">👁️</span>
        <span>SORU ÖN İZLEME MODU — Sorunuz Yönetici Onayındadır</span>
      </div>
      <p className="text-xs font-medium leading-relaxed opacity-95">
        Sayın üyemiz, oluşturduğunuz soru başarıyla sistemimize aktarılmıştır ve şu anda <strong>soru onay sürecindedir</strong>. 
        Platformumuzda bilgi kalitesi ve görsel içerik standartlarını korumak adına sorunuz yöneticimiz (admin) tarafından incelendikten kısa bir süre sonra onaylanarak tüm çiftçilerimiz ile uzmanlarımızın yanıtlayabilmesi için yayına alınacaktır.
      </p>
      <div className="text-[11px] font-bold text-amber-700 dark:text-amber-400 pt-1 flex items-center gap-1">
        <span>🔔 Sorunuz onaylandığı an tarafınıza bildirim iletilecektir. İsterseniz soru kutusunun altındaki butonla içeriği <strong>kredisiz (ücretsiz)</strong> düzeltebilirsiniz.</span>
      </div>
    </div>
  );
}

export function EditPendingQuestionButton({
  question,
  categories,
  isOwnerOrAdmin,
}: PendingQuestionPreviewProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  if (!isOwnerOrAdmin) return null;

  return (
    <>
      <div className="mt-4">
        <button
          onClick={() => setIsEditModalOpen(true)}
          className="w-full py-3.5 px-6 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-700 hover:to-amber-700 text-white font-black text-sm rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer border border-amber-400/30 transform active:scale-[0.99]"
        >
          <span>✏️ Soruyu Düzelt/Düzenle (Kredisiz)</span>
        </button>
      </div>

      <EditPendingQuestionModal
        question={question}
        categories={categories}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />
    </>
  );
}
