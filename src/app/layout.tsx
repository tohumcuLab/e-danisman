import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Providers } from "@/components/providers/Providers";
import GuestAuthPromptModal from "@/components/shared/GuestAuthPromptModal";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tarımsal e-Danışman",
  description: "Bitki yetiştiricileri ve çiftçiler için soru-cevap topluluk platformu.",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icon.svg?v=100", type: "image/svg+xml" },
      { url: "/icon.png?v=100", type: "image/png" },
      { url: "/favicon.ico?v=100", sizes: "any" },
    ],
    shortcut: "/favicon.ico?v=100",
    apple: "/apple-icon.png?v=100",
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <Providers>
          <Header />
          <main className="flex-1 py-8">
            {children}
          </main>
          <Footer />
          <GuestAuthPromptModal />
        </Providers>
      </body>
    </html>
  );
}
