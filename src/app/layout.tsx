import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Providers } from "@/components/providers/Providers";
import GuestAuthPromptModal from "@/components/shared/GuestAuthPromptModal";
import CookieConsentBanner from "@/components/shared/CookieConsentBanner";
import { prisma } from "@/lib/prisma";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: "#006537",
};

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
  let gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "G-YTY000VQPM";
  
  try {
    const settings = await prisma.systemSetting.findMany({
      where: {
        key: { in: ["ADSENSE_CLIENT_ID", "GA_MEASUREMENT_ID"] },
      },
    });
    
    for (const setting of settings) {
      if (setting.key === "ADSENSE_CLIENT_ID" && setting.value?.trim() && !process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID) {
        adsenseClientId = setting.value.trim();
      }
      if (setting.key === "GA_MEASUREMENT_ID" && setting.value?.trim() && !process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID) {
        gaMeasurementId = setting.value.trim();
      }
    }
  } catch {
    // Hata durumunda varsayılanları koru
  }

  return (
    <html lang="tr" className={`${inter.variable} h-full antialiased`}>
      <head>
        {/* Google Analytics (gtag.js) */}
        {gaMeasurementId && (
          <>
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`}
            />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${gaMeasurementId}');
                `,
              }}
            />
          </>
        )}

        {/* Google AdSense Yayıncı / Doğrulama Kodu */}
        <script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClientId || "ca-pub-8453151879605141"}`}
          crossOrigin="anonymous"
        />
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
