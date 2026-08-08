"use client";

import { useState } from "react";

export default function LikeButton({
  answerId,
  initialLikes,
  initialHasLiked,
}: {
  answerId: string;
  initialLikes: number;
  initialHasLiked: boolean;
}) {
  const [likes, setLikes] = useState(initialLikes);
  const [hasLiked, setHasLiked] = useState(initialHasLiked);
  const [loading, setLoading] = useState(false);

  const handleLike = async () => {
    if (hasLiked || loading) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/answers/${answerId}/like`, {
        method: "POST",
      });

      if (res.ok) {
        setLikes((prev) => prev + 1);
        setHasLiked(true);
      } else {
        const data = await res.json();
        alert(data.error || "Beğenirken bir hata oluştu.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleLike}
      disabled={hasLiked || loading}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-colors ${
        hasLiked
          ? "bg-[var(--primary-container)] text-[var(--on-primary-container)] font-semibold cursor-default"
          : "bg-[var(--surface-container-high)] text-[var(--on-surface)] hover:bg-[var(--primary)] hover:text-white"
      }`}
    >
      <span>👍</span>
      <span>{hasLiked ? "Beğenildi" : "Beğen"}</span>
      <span className="ml-1 text-xs opacity-80">({likes})</span>
    </button>
  );
}
