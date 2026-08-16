"use client";

import { useEffect, useRef } from "react";
import GoogleAdSenseUnit from "@/components/shared/GoogleAdSenseUnit";

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
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ad || hasTracked.current) return;
    
    // Yalnızca bir kez görüntüleme sayısını artır
    hasTracked.current = true;
    fetch(`/api/ads/${ad.id}/impression`, { method: "POST" }).catch(() => {});
  }, [ad]);

  // Google AdSense veya özel HTML / Script kodlarını dinamik çalıştır
  useEffect(() => {
    if (!ad || !ad.networkCode || !containerRef.current) return;

    const isGoogleAd = ad.type === "GOOGLE" || Boolean(ad.networkCode.trim());
    if (!isGoogleAd) return;

    // Eğer networkCode içerisinde inline <script> etiketleri varsa çalıştır
    const scripts = containerRef.current.querySelectorAll("script");
    scripts.forEach((oldScript) => {
      const newScript = document.createElement("script");
      Array.from(oldScript.attributes).forEach((attr) => {
        newScript.setAttribute(attr.name, attr.value);
      });
      newScript.textContent = oldScript.textContent;
      oldScript.parentNode?.replaceChild(newScript, oldScript);
    });

    // Eğer Google AdSense push çağrısı gerekiyorsa
    try {
      if (typeof window !== "undefined" && (window as any).adsbygoogle) {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      }
    } catch (e) {
      // ignore
    }
  }, [ad]);

  if (!ad) return null;

  const isGoogle = ad.type === "GOOGLE" || Boolean(ad.networkCode?.trim());
  const mediaUrl = ad.imageUrl || ad.videoUrl || "";
  const isVideo = Boolean(mediaUrl && (mediaUrl.match(/\.(mp4|webm|ogg)$/i) || mediaUrl.includes("video")));

  // Destination URL redirect via click tracking endpoint
  const targetUrl = ad.destinationUrl
    ? `/api/ads/${ad.id}/click`
    : null;

  // Google AdSense data-ad-slot ve data-ad-client ayrıştırma
  const googleSlotMatch = ad.networkCode?.match(/data-ad-slot=["'](\d+)["']/);
  const googleClientMatch = ad.networkCode?.match(/data-ad-client=["'](ca-pub-[\d]+)["']/);
  const googleFormatMatch = ad.networkCode?.match(/data-ad-format=["']([^"']+)["']/);

  const cardContent = (
    <article className={`card p-4 sm:p-5 border-2 border-[var(--secondary)]/40 bg-[var(--secondary)]/5 relative overflow-hidden rounded-2xl shadow-sm my-4 transition-all ${targetUrl ? "cursor-pointer hover:border-[var(--secondary)] hover:shadow-md group/ad" : ""}`}>
      {/* Header Badge */}
      <div className="flex items-center justify-between mb-3">
        <span className="bg-[var(--secondary)] text-white text-[10px] font-extrabold px-2.5 py-1 rounded-md tracking-wider uppercase flex items-center gap-1">
          📢 SPONSORLU REKLAM
        </span>
        <span className="text-[10px] text-[var(--on-surface-variant)] font-medium">Sponsor</span>
      </div>

      {isGoogle ? (
        googleSlotMatch ? (
          <div className="w-full flex justify-center items-center my-2">
            <GoogleAdSenseUnit
              client={googleClientMatch ? googleClientMatch[1] : undefined}
              slot={googleSlotMatch[1]}
              format={googleFormatMatch ? googleFormatMatch[1] : "auto"}
              className="w-full max-w-full"
            />
          </div>
        ) : (
          <div 
            ref={containerRef}
            className="w-full overflow-hidden flex justify-center items-center my-2"
            dangerouslySetInnerHTML={{ __html: ad.networkCode || "" }} 
          />
        )
      ) : (
        <div className="space-y-3">
          {mediaUrl && (
            <div className="w-full max-h-80 rounded-xl overflow-hidden bg-black/5 border border-gray-200 flex items-center justify-center">
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
            </div>
          )}

          <div className="flex items-center justify-between gap-3">
            <h3 className="font-bold text-base text-[var(--on-surface)] leading-snug group-hover/ad:text-[var(--secondary)] transition-colors">
              {ad.title}
            </h3>
            {targetUrl && (
              <span className="btn bg-[var(--secondary)] group-hover/ad:opacity-90 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg shrink-0 shadow-sm transition-all flex items-center gap-1">
                İncele ➔
              </span>
            )}
          </div>
        </div>
      )}
    </article>
  );

  if (targetUrl) {
    return (
      <a
        href={targetUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block no-underline text-inherit"
      >
        {cardContent}
      </a>
    );
  }

  return cardContent;
}
