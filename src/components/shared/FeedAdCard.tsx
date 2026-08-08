"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

interface Ad {
  id: string;
  title: string;
  type: string;
  placement?: string | null;
  networkCode?: string | null;
  imageUrl?: string | null;
  videoUrl?: string | null;
  destinationUrl?: string | null;
  impressionCount?: number;
}

export default function FeedAdCard({ ad }: { ad: Ad }) {
  const hasTracked = useRef(false);

  useEffect(() => {
    if (!ad || hasTracked.current) return;
    
    // Yalnızca bir kez görüntüleme sayısını artır
    hasTracked.current = true;
    fetch(`/api/ads/${ad.id}/impression`, { method: "POST" }).catch(() => {});
  }, [ad]);

  if (!ad) return null;

  const isGoogle = ad.type === "GOOGLE" || Boolean(ad.networkCode?.trim());
  const mediaUrl = ad.imageUrl || ad.videoUrl || "";
  const isVideo = Boolean(mediaUrl && (mediaUrl.match(/\.(mp4|webm|ogg)$/i) || mediaUrl.includes("video")));

  // Destination URL redirect via click tracking endpoint
  const targetUrl = ad.destinationUrl
    ? `/api/ads/${ad.id}/click`
    : null;

  return (
    <article className="card p-5 border-2 border-[var(--secondary)]/40 bg-[var(--secondary)]/5 relative overflow-hidden rounded-xl shadow-sm my-4">
      {/* Header Badge */}
      <div className="flex items-center justify-between mb-3">
        <span className="bg-[var(--secondary)] text-white text-[10px] font-extrabold px-2.5 py-1 rounded-md tracking-wider uppercase flex items-center gap-1">
          📢 SPONSORLU REKLAM
        </span>
        <span className="text-[10px] text-gray-500 font-medium">Reklam</span>
      </div>

      {isGoogle ? (
        <div className="w-full p-4 bg-slate-900 text-green-400 font-mono text-xs rounded-xl overflow-x-auto min-h-[100px] flex flex-col justify-center">
          <div className="text-[10px] text-gray-400 mb-1">// Google AdSense Reklam Alanı</div>
          <div dangerouslySetInnerHTML={{ __html: ad.networkCode || "" }} />
        </div>
      ) : (
        <div className="space-y-3">
          {mediaUrl && (
            <div className="w-full max-h-80 rounded-xl overflow-hidden bg-black/5 border border-gray-200 flex items-center justify-center">
              {targetUrl ? (
                <a
                  href={targetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full h-full block group/ad overflow-hidden"
                >
                  {isVideo ? (
                    <video
                      src={mediaUrl}
                      autoPlay
                      muted
                      loop
                      playsInline
                      className="w-full max-h-80 object-contain mx-auto"
                    />
                  ) : (
                    <img
                      src={mediaUrl}
                      alt={ad.title}
                      className="w-full max-h-80 object-contain mx-auto group-hover/ad:scale-105 transition-transform duration-500"
                    />
                  )}
                </a>
              ) : isVideo ? (
                <video
                  src={mediaUrl}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="w-full max-h-80 object-contain mx-auto"
                />
              ) : (
                <img
                  src={mediaUrl}
                  alt={ad.title}
                  className="w-full max-h-80 object-contain mx-auto"
                />
              )}
            </div>
          )}

          <div className="flex items-center justify-between gap-3">
            <h3 className="font-bold text-base text-[var(--on-surface)] leading-snug">
              {ad.title}
            </h3>
            {targetUrl && (
              <a
                href={targetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn bg-[var(--secondary)] hover:opacity-90 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg shrink-0 shadow-sm transition-all"
              >
                İncele ➔
              </a>
            )}
          </div>
        </div>
      )}
    </article>
  );
}
