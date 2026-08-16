import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Providers } from "@/components/providers/Providers";
import GuestAuthPromptModal from "@/components/shared/GuestAuthPromptModal";
import CookieConsentBanner from "@/components/shared/CookieConsentBanner";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Tarımsal e-Danışman",
  description: "Bitki yetiştiricileri ve çiftçiler için soru-cevap topluluk platformu.",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icon.svg?v=102", type: "image/svg+xml" },
      { url: "/icon.png?v=102", type: "image/png" },
      { url: "/favicon.ico?v=102", sizes: "any" },
    ],
    shortcut: "/favicon.ico?v=102",
    apple: "/apple-icon.png?v=102",
  },
  openGraph: {
    title: "Tarımsal e-Danışman",
    description: "Bitki yetiştiricileri ve çiftçiler için soru-cevap topluluk platformu.",
    type: "website",
    locale: "tr_TR",
    siteName: "Tarımsal e-Danışman",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tarımsal e-Danışman",
    description: "Bitki yetiştiricileri ve çiftçiler için soru-cevap topluluk platformu.",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let adsenseClientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || null;
  if (!adsenseClientId) {
    try {
      const setting = await prisma.systemSetting.findUnique({
        where: { key: "ADSENSE_CLIENT_ID" },
      });
      if (setting?.value?.trim()) {
        adsenseClientId = setting.value.trim();
      }
    } catch {
      // Hata durumunda yoksay
    }
  }

  return (
    <html lang="tr" className={`${inter.variable} h-full antialiased`}>
      <head>
        <link rel="icon" href="/favicon.ico?v=9999" sizes="any" />
        <link rel="icon" href="/icon.svg?v=9999" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-icon.png?v=9999" />
        
        {/* Google AdSense Yayıncı / Doğrulama Kodu */}
        {adsenseClientId && (
          <script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClientId}`}
            crossOrigin="anonymous"
          />
        )}
      </head>
      <body className="min-h-full flex flex-col">
        <Providers>
          <Header />
          <main className="flex-1 py-8">
            {children}
          </main>
          <Footer />
          <GuestAuthPromptModal />
          <CookieConsentBanner />
        </Providers>
      </body>
    </html>
  );
}
