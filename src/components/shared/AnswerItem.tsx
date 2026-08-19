"use client";

import { useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";
import LikeButton from "./LikeButton";
import { useRouter } from "next/navigation";

type UserType = {
  id: string;
  name: string | null;
  image?: string | null;
  avatarUrl?: string | null;
  role?: string;
  credits?: number;
};

type ReplyType = {
  id: string;
  body: string;
  userId: string;
  createdAt: Date | string;
  user: UserType;
  likes?: any[];
  _count: { likes: number };
};

type AnswerType = {
  id: string;
  body: string;
  userId: string;
  isAccepted: boolean;
  isHighlighted: boolean;
  status?: string;
  createdAt: Date | string;
  user: UserType;
  likes?: any[];
  _count: { likes: number };
  replies?: ReplyType[];
};

type AnswerItemProps = {
  answer: AnswerType;
  questionId: string;
  currentUserId?: string;
  currentUserRole?: string;
  isQuestionOwner: boolean;
  hasAcceptedAny: boolean;
};

export default function AnswerItem({
  answer,
  questionId,
  currentUserId,
  currentUserRole,
  isQuestionOwner,
  hasAcceptedAny,
}: AnswerItemProps) {
  // Yanıtlama State'leri
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyBody, setReplyBody] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [targetUserName, setTargetUserName] = useState<string>("");

  // Üç Nokta Menü & Aksiyon State'leri
  const [menuOpen, setMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editBody, setEditBody] = useState(answer.body);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportTargetId, setReportTargetId] = useState<string>("");
  const [reportReason, setReportReason] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const hasLiked = Array.isArray(answer.likes) && answer.likes.length > 0;
  const isAuthor = currentUserId === answer.userId;
  const isAdmin = currentUserRole === "ADMIN";
  const canModify = isAuthor || isAdmin;
  const canAccept = isQuestionOwner && !hasAcceptedAny && !answer.isAccepted;

  // Yanıt Açma
  const handleOpenReply = (parentAnsId: string, userName: string) => {
    if (!currentUserId) {
      window.location.href = "/giris";
      return;
    }
    setReplyingTo(parentAnsId);
    setTargetUserName(userName);
    setShowReplyForm(true);
    setError("");
  };

  // Yanıt Gönderme (-1 Kredi)
  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyBody.trim()) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/answers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          body: `@${targetUserName} ${replyBody}`,
          questionId,
          parentId: answer.id
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Yanıt gönderilemedi.");
      }

      setReplyBody("");
      setShowReplyForm(false);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Cevap Düzenleme
  const handleEditAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editBody.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/answers/${answer.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: editBody }),
      });

      const data = await res.json();

      if (res.ok) {
        setIsEditing(false);
        router.refresh();
      } else {
        alert(data.error || "Cevap güncellenemedi.");
      }
    } catch (err) {
      alert("Bağlantı hatası");
    } finally {
      setLoading(false);
    }
  };

  // Cevap Silme
  const handleDeleteAnswer = async (ansId: string = answer.id) => {
    if (!confirm("Bu cevabı silmek istediğinizden emin misiniz?")) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/answers/${ansId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || "Cevap silinemedi.");
      }
    } catch (err) {
      alert("Bağlantı hatası");
    } finally {
      setLoading(false);
    }
  };

  // En İyi Cevap Seçme
  const handleAcceptAnswer = async () => {
    if (!confirm("Bu cevabı 'En İyi Cevap' olarak seçmek istiyor musunuz?")) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/answers/${answer.id}/accept`, {
        method: "POST",
      });

      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || "İşlem gerçekleştirilemedi.");
      }
    } catch (err) {
      alert("Bağlantı hatası");
    } finally {
      setLoading(false);
    }
  };

  // Şikayet Gönderme
  const handleSendReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportReason.trim() || loading) return;

    setLoading(true);
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetType: "ANSWER",
          targetId: reportTargetId || answer.id,
          reason: reportReason
        }),
      });

      if (res.ok) {
        alert("Şikayetiniz yönetime iletilmiştir. Teşekkür ederiz.");
        setReportModalOpen(false);
        setReportReason("");
      } else {
        const data = await res.json();
        alert(data.error || "Şikayet iletilirken hata oluştu.");
      }
    } catch (err) {
      alert("Bağlantı hatası");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className={`card p-5 sm:p-6 transition-all relative ${
        answer.isAccepted 
          ? 'border-l-4 border-[var(--primary)] bg-[var(--primary)]/5 shadow-md' 
          : ''
      }`}
    >
      {/* Onay Bekliyor Rozeti */}
      {answer.status === "PENDING_APPROVAL" && (
        <div className="text-amber-800 dark:text-amber-300 font-extrabold text-xs mb-3 flex items-center gap-1.5 bg-amber-500/15 border border-amber-400/40 px-3 py-1.5 rounded-lg w-fit">
          <span>⏳ YÖNETİCİ ONAYI BEKLİYOR (Yalnızca siz ve adminler görebilir)</span>
        </div>
      )}

      {/* Uzman Görüşü / En İyi Cevap Rozeti */}
      {answer.isAccepted && (
        <div className="text-[var(--primary)] font-extrabold text-xs mb-3 flex items-center gap-1.5 bg-[var(--primary)]/10 px-3 py-1.5 rounded-lg w-fit">
          <span>⭐ EN İYİ CEVAP / UZMAN GÖRÜŞÜ</span>
        </div>
      )}
      
      {/* Üst Bilgiler: Sol Tarafta Kullanıcı Profili, SAĞ ÜST KÖŞEDE Üç Nokta (⋮) Menüsü */}
      <div className="flex items-center justify-between gap-3 mb-3">
        {/* Kullanıcı Profili ve İsmi (Sol Tarafta) */}
        <Link href={`/kullanici/${answer.user.id}`} className="flex items-center gap-2.5 group">
          {answer.user.image || answer.user.avatarUrl ? (
            <img 
              src={answer.user.image || answer.user.avatarUrl || ""} 
              alt={answer.user.name || "Kullanıcı"}
              className="w-9 h-9 rounded-full object-cover border border-[var(--primary)]/30 shrink-0 shadow-sm"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-[var(--primary)] text-white font-bold flex items-center justify-center shrink-0 shadow text-xs">
              {answer.user.name?.charAt(0).toUpperCase() || "U"}
            </div>
          )}
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="font-bold text-sm text-[var(--on-surface)] group-hover:text-[var(--primary)] transition-colors">
                {answer.user.name}
              </h4>
              {answer.user.role === "EXPERT" && (
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-1.5 py-0.2 rounded-md">
                  Uzman
                </span>
              )}
            </div>
            <p className="text-[10px] text-[var(--on-surface-variant)]" suppressHydrationWarning>
              {formatDistanceToNow(new Date(answer.createdAt), { addSuffix: true, locale: tr })}
            </p>
          </div>
        </Link>
        
        {/* 🟢 SAĞ ÜST KÖŞE ÜÇ NOKTA (⋮) AÇILIR MENÜSÜ */}
        <div className="relative ml-auto">
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="w-8 h-8 rounded-xl text-[var(--on-surface-variant)]/60 hover:text-[var(--on-surface)] hover:bg-[var(--surface-container-high)] flex items-center justify-center font-extrabold text-lg transition-all cursor-pointer"
            title="Cevap Seçenekleri"
          >
            ⋮
          </button>

          {menuOpen && (
            <>
              <div 
                className="fixed inset-0 z-20" 
                onClick={() => setMenuOpen(false)} 
              />

              <div className="absolute right-0 top-10 z-30 w-44 bg-[var(--surface-container-lowest)] border border-[var(--outline-variant)] rounded-2xl shadow-2xl p-1.5 space-y-1 text-xs animate-fadeIn">
                {/* Düzenle (Yazar veya Admin ise) */}
                {canModify && (
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      setIsEditing(true);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-[var(--on-surface)] hover:bg-[var(--surface-container-high)] font-semibold rounded-xl transition-colors cursor-pointer"
                  >
                    <svg className="w-4 h-4 text-[var(--on-surface-variant)]/60 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    <span>Düzenle</span>
                  </button>
                )}

                {/* Sil (Yazar veya Admin ise) */}
                {canModify && (
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      handleDeleteAnswer();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-[var(--on-surface)] hover:bg-[var(--surface-container-high)] font-semibold rounded-xl transition-colors cursor-pointer"
                  >
                    <svg className="w-4 h-4 text-[var(--on-surface-variant)]/60 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    <span>Sil</span>
                  </button>
                )}

                {/* En İyi Cevap Seç (Soru Sahibi İçin) */}
                {canAccept && (
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      handleAcceptAnswer();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-[var(--on-surface)] hover:bg-[var(--surface-container-high)] font-semibold rounded-xl transition-colors cursor-pointer"
                  >
                    <svg className="w-4 h-4 text-[var(--on-surface-variant)]/60 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                    <span>En İyi Cevap Seç</span>
                  </button>
                )}

                {/* HER ZAMAN EN ALTA: Şikayet Et (Tüm Giriş Yapmış Kullanıcılar İçin) */}
                {currentUserId && (
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      setReportTargetId(answer.id);
                      setReportModalOpen(true);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-[var(--on-surface)] hover:bg-[var(--surface-container-high)] font-semibold rounded-xl transition-colors cursor-pointer"
                  >
                    <svg className="w-4 h-4 text-[var(--on-surface-variant)]/60 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                    </svg>
                    <span>Şikayet Et</span>
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Cevap Metni veya Düzenleme Formu */}
      {isEditing ? (
        <form onSubmit={handleEditAnswer} className="space-y-3 my-3 p-4 bg-amber-50/50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 rounded-2xl animate-fadeIn">
          <div className="text-xs text-amber-800 dark:text-amber-300 font-medium">
            ⚠️ Cevabınızı düzenlediğinizde kazanılan beğeni puanları yeniden hesaplanacaktır.
          </div>
          <textarea
            value={editBody}
            onChange={(e) => setEditBody(e.target.value)}
            rows={4}
            required
            className="w-full p-3 border border-[var(--outline-variant)] rounded-xl bg-[var(--surface-container-lowest)] text-[var(--on-surface)] text-xs focus:outline-none focus:border-[var(--primary)]"
          />
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                setEditBody(answer.body);
              }}
              disabled={loading}
              className="text-xs font-semibold px-3 py-1.5 text-[var(--on-surface-variant)] hover:bg-[var(--surface-container-high)] rounded-xl transition-colors"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={loading || !editBody.trim()}
              className="text-xs font-bold bg-[var(--primary)] text-white px-4 py-1.5 rounded-xl hover:bg-[var(--primary-container)] transition-all shadow cursor-pointer"
            >
              {loading ? "Kaydediliyor..." : "Kaydet ve Güncelle"}
            </button>
          </div>
        </form>
      ) : (
        <div className="text-sm text-[var(--on-surface)] leading-relaxed whitespace-pre-wrap mb-4">
          {answer.body}
        </div>
      )}

      {/* Butonlar & Aksiyonlar Satırı: En Solda Beğen, En Sağda Yanıtla (Kendi cevabı değilse) */}
      <div className="pt-3 border-t border-[var(--outline-variant)] flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <LikeButton answerId={answer.id} initialLikes={answer._count.likes} initialHasLiked={hasLiked} />
        </div>

        {/* Başkasının cevabı ise En Sağda Yanıtla Butonu Göster */}
        {currentUserId !== answer.userId && (
          <button
            type="button"
            onClick={() => handleOpenReply(answer.id, answer.user.name || "Kullanıcı")}
            className="flex items-center gap-1.5 text-xs font-bold text-[var(--primary)] bg-[var(--primary)]/10 hover:bg-[var(--primary)] hover:text-white px-3.5 py-1.5 rounded-xl transition-all cursor-pointer shadow-sm ml-auto"
          >
            <span>💬 Yanıtla</span>
            <span className="text-[10px] bg-amber-500 text-white font-extrabold px-1.5 py-0.5 rounded-full shadow-sm">
              1 🪙
            </span>
          </button>
        )}
      </div>

      {/* Satır İçi Yanıt Yazma Formu */}
      {showReplyForm && replyingTo === answer.id && (
        <form onSubmit={handleSendReply} className="mt-4 p-4 bg-[var(--surface-container-low)] border border-[var(--outline-variant)] rounded-2xl space-y-3 animate-fadeIn">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-[var(--primary)]">
              💬 @{targetUserName} kişisine yanıt veriyorsunuz
            </span>
            <span className="text-[11px] bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-md border border-amber-300">
              Maliyet: 1 Kredi 🪙
            </span>
          </div>

          {error && (
            <div className="p-2.5 text-xs text-red-700 bg-red-50 rounded-xl border border-red-200">
              ⚠️ {error}
            </div>
          )}

          <textarea
            required
            rows={3}
            value={replyBody}
            onChange={(e) => setReplyBody(e.target.value)}
            placeholder={`@${targetUserName} kişisine yanıtınızı yazın...`}
            className="w-full p-3 text-xs bg-[var(--surface-container-lowest)] border border-[var(--outline-variant)] rounded-xl text-[var(--on-surface)] focus:border-[var(--primary)] outline-none"
          />

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowReplyForm(false)}
              className="text-xs font-semibold px-3 py-1.5 text-[var(--on-surface-variant)] hover:bg-[var(--surface-container-high)] rounded-xl transition-colors"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              disabled={loading || !replyBody.trim()}
              className="text-xs font-extrabold bg-[#006537] hover:bg-[#74db98] text-white hover:text-[#00391d] px-4 py-2 rounded-xl transition-all shadow disabled:opacity-50 cursor-pointer"
            >
              {loading ? "Gönderiliyor..." : "Yanıt Gönder (-1 Kredi)"}
            </button>
          </div>
        </form>
      )}

      {/* Alt Yanıtlar (YouTube Yorum Yanıtları Tarzı İç İçe Listeleme) */}
      {answer.replies && answer.replies.length > 0 && (
        <div className="mt-4 ml-4 sm:ml-8 pl-3 sm:pl-4 border-l-2 border-[var(--primary)]/30 space-y-3">
          <div className="text-[11px] font-extrabold text-[var(--primary)] flex items-center gap-1.5 mb-1">
            <span>↳ {answer.replies.length} Yanıt</span>
          </div>

          {answer.replies.map((reply) => {
            const replyHasLiked = Array.isArray(reply.likes) && reply.likes.length > 0;
            const isMyReply = currentUserId === reply.userId;

            return (
              <div 
                key={reply.id} 
                className="p-3 sm:p-4 bg-[var(--surface-container-low)] rounded-xl border border-[var(--outline-variant)]/60 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {/* Alt Yanıt İçin Üç Nokta Menüsü */}
                    {currentUserId && (
                      <button
                        type="button"
                        onClick={() => {
                          setReportTargetId(reply.id);
                          setReportModalOpen(true);
                        }}
                        className="w-5 h-5 rounded-md hover:bg-red-50 text-gray-400 hover:text-red-600 flex items-center justify-center font-bold text-[10px]"
                        title="Şikayet Et"
                      >
                        🚩
                      </button>
                    )}

                    <Link href={`/kullanici/${reply.user.id}`} className="flex items-center gap-2 group">
                      {reply.user.image || reply.user.avatarUrl ? (
                        <img 
                          src={reply.user.image || reply.user.avatarUrl || ""} 
                          alt={reply.user.name || "Kullanıcı"}
                          className="w-7 h-7 rounded-full object-cover shrink-0" 
                        />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-[var(--primary)]/20 text-[var(--primary)] font-extrabold flex items-center justify-center text-[10px] shrink-0">
                          {reply.user.name?.charAt(0).toUpperCase() || "U"}
                        </div>
                      )}
                      <div>
                        <span className="font-bold text-[var(--on-surface)] group-hover:text-[var(--primary)] transition-colors">
                          {reply.user.name}
                        </span>
                        <span className="text-[10px] text-[var(--on-surface-variant)] ml-2" suppressHydrationWarning>
                          {formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true, locale: tr })}
                        </span>
                      </div>
                    </Link>
                  </div>
                </div>

                <p className="text-[13px] text-[var(--on-surface)] leading-relaxed whitespace-pre-wrap pl-7">
                  {reply.body}
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-[var(--outline-variant)]/40 pl-7">
                  <LikeButton answerId={reply.id} initialLikes={reply._count.likes} initialHasLiked={replyHasLiked} />

                  {!isMyReply && (
                    <button
                      type="button"
                      onClick={() => handleOpenReply(answer.id, reply.user.name || "Kullanıcı")}
                      className="flex items-center gap-1 text-[11px] font-bold text-[var(--primary)] bg-[var(--primary)]/10 hover:bg-[var(--primary)] hover:text-white px-2.5 py-1 rounded-lg transition-all cursor-pointer ml-auto"
                    >
                      <span>💬 Yanıtla</span>
                      <span className="text-[9px] bg-amber-500 text-white font-extrabold px-1.5 py-0.2 rounded-full">
                        1 🪙
                      </span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Şikayet Et Modal Popup */}
      {reportModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[var(--surface-container-lowest)] p-6 rounded-2xl border border-[var(--outline-variant)] w-full max-w-md shadow-2xl space-y-4">
            <h3 className="text-base font-extrabold text-[var(--on-surface)] flex items-center gap-2">
              <span>🚩</span> Cevabı Şikayet Et
            </h3>
            <p className="text-xs text-[var(--on-surface-variant)]">
              Bu içerikte topluluk kurallarına aykırı bir durum varsa lütfen yönetime bildirin.
            </p>
            <form onSubmit={handleSendReport} className="space-y-4">
              <textarea
                required
                rows={4}
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                placeholder="Şikayet nedeninizi kısaca açıklayın (Spam, hakaret, yanlış içerik vb.)..."
                className="w-full p-3 text-xs border border-[var(--outline-variant)] rounded-xl bg-[var(--surface-container-low)] text-[var(--on-surface)] outline-none focus:border-[var(--primary)]"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setReportModalOpen(false)}
                  className="btn btn-ghost text-xs px-4 py-2"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={loading || !reportReason.trim()}
                  className="btn bg-red-600 hover:bg-red-700 text-white text-xs px-5 py-2 rounded-xl font-bold cursor-pointer"
                >
                  {loading ? "Gönderiliyor..." : "Şikayet Gönder"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
