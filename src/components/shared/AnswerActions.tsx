"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface AnswerActionsProps {
  answerId: string;
  authorId: string;
  initialBody: string;
  isAccepted: boolean;
  currentUserId?: string;
  currentUserRole?: string;
  isQuestionOwner: boolean;
  hasAcceptedAny: boolean;
}

export default function AnswerActions({
  answerId,
  authorId,
  initialBody,
  isAccepted,
  currentUserId,
  currentUserRole,
  isQuestionOwner,
  hasAcceptedAny,
}: AnswerActionsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [body, setBody] = useState(initialBody);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const isAuthor = currentUserId === authorId;
  const isAdmin = currentUserRole === "ADMIN";
  const canModify = isAuthor || isAdmin;
  const canAccept = isQuestionOwner && !hasAcceptedAny && !isAccepted;

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/answers/${answerId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      });

      const data = await res.json();

      if (res.ok) {
        setIsEditing(false);
        router.refresh();
      } else {
        alert(data.error || "Cevap güncellenemedi.");
      }
    } catch (err) {
      console.error(err);
      alert("Bağlantı hatası");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Bu cevabı silmek istediğinizden emin misiniz?")) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/answers/${answerId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || "Cevap silinemedi.");
      }
    } catch (err) {
      console.error(err);
      alert("Bağlantı hatası");
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!confirm("Bu cevabı 'En İyi Cevap' olarak seçmek istiyor musunuz?")) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/answers/${answerId}/accept`, {
        method: "POST",
      });

      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || "İşlem gerçekleştirilemedi.");
      }
    } catch (err) {
      console.error(err);
      alert("Bağlantı hatası");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-3">
      {isEditing ? (
        <form onSubmit={handleEdit} className="space-y-3 mt-2">
          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-md text-xs text-amber-800 dark:text-amber-300">
            ⚠️ <strong>Bilgi:</strong> Cevabınızı düzenlediğinizde mevcut beğeniler sıfırlanır ve uzmansanız kazanılan beğeni puanları geri düşülür.
          </div>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={4}
            required
            className="w-full p-3 border border-[var(--outline-variant)] rounded-lg bg-[var(--surface)] text-[var(--on-surface)] text-sm focus:outline-none focus:border-[var(--primary)]"
          />
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                setBody(initialBody);
              }}
              disabled={loading}
              className="btn btn-ghost text-xs px-3 py-1.5"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={loading || !body.trim()}
              className="btn btn-primary text-xs px-4 py-1.5"
            >
              {loading ? "Kaydediliyor..." : "Kaydet ve Sıfırla"}
            </button>
          </div>
        </form>
      ) : (
        <div className="flex items-center gap-3">
          {canAccept && (
            <button
              onClick={handleAccept}
              disabled={loading}
              className="btn bg-yellow-500 hover:bg-yellow-600 text-white text-xs font-bold px-3 py-1 border-none"
            >
              ⭐ En İyi Cevap Seç
            </button>
          )}

          {canModify && (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="text-xs text-gray-500 hover:text-[var(--primary)] font-medium transition-colors"
              >
                ✏️ Düzenle
              </button>
              <button
                onClick={handleDelete}
                disabled={loading}
                className="text-xs text-red-500 hover:text-red-700 font-medium transition-colors"
              >
                🗑️ Sil
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
