"use client";

import { useEffect, useState } from "react";

export default function ShareButtons({ title, text, id }: { title: string, text: string, id: string }) {
  const [url, setUrl] = useState("");

  useEffect(() => {
    setUrl(window.location.href);
  }, []);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedText = encodeURIComponent(`${title} - ${text.substring(0, 50)}...`);

  const shareLinks = {
    whatsapp: `https://api.whatsapp.com/send?text=${encodedText}%0A${encodedUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    x: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`,
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      alert("Bağlantı kopyalandı!");
    } catch (err) {
      console.error("Bağlantı kopyalanamadı", err);
    }
  };

  if (!url) return null;

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-[var(--on-surface-variant)] mr-2">Paylaş:</span>
      <a href={shareLinks.whatsapp} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-green-100 text-green-600 hover:bg-green-200 transition-colors" title="WhatsApp'ta Paylaş">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
      </a>
      <a href={shareLinks.facebook} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors" title="Facebook'ta Paylaş">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
      </a>
      <a href={shareLinks.x} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-slate-100 text-slate-800 hover:bg-slate-200 transition-colors" title="X'te Paylaş">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4l11.733 16h4.267l-11.733 -16z"></path><path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772"></path></svg>
      </a>
      <button onClick={handleCopyLink} className="p-2 rounded-full bg-[var(--surface-container-high)] text-[var(--on-surface)] hover:bg-[var(--surface-variant)] transition-colors" title="Bağlantıyı Kopyala">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
      </button>
    </div>
  );
}
