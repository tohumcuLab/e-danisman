"use client";

import { useEffect, useRef } from "react";

interface GoogleAdSenseUnitProps {
  client?: string;
  slot: string;
  format?: string;
  responsive?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

export default function GoogleAdSenseUnit({
  client,
  slot,
  format = "auto",
  responsive = true,
  style = { display: "block" },
  className = "my-4 overflow-hidden text-center",
}: GoogleAdSenseUnitProps) {
  const adRef = useRef<HTMLModElement>(null);
  const isPushed = useRef(false);

  const clientId = client || process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;

  useEffect(() => {
    if (!clientId || !slot || isPushed.current) return;

    const timer = setTimeout(() => {
      try {
        if (typeof window !== "undefined" && adRef.current) {
          const status = adRef.current.getAttribute("data-adsbygoogle-status");
          if (!status && !isPushed.current) {
            isPushed.current = true;
            const adsbygoogle = (window as any).adsbygoogle || [];
            adsbygoogle.push({});
          }
        }
      } catch (err) {
        // WebKit veya AdBlock kısıtlamasında sessizce yoksay
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [clientId, slot]);

  if (!clientId || !slot) {
    // Geliştirici veya henüz kod girilmemiş modda şık bir placeholder
    return (
      <div className={`p-4 bg-[var(--surface-container-low)] border border-dashed border-[var(--outline-variant)] rounded-xl text-center text-xs text-[var(--on-surface-variant)] ${className}`}>
        <span className="font-bold block mb-1">📢 Google AdSense Reklam Alanı</span>
        <span className="text-[10px] opacity-70">
          AdSense Client ID ({clientId || "Tanımlanmamış"}) - Slot: {slot || "Belirtilmemiş"}
        </span>
      </div>
    );
  }

  return (
    <div className={className}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={style}
        data-ad-client={clientId}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? "true" : "false"}
      />
    </div>
  );
}
