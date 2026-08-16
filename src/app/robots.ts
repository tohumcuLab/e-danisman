import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXTAUTH_URL || "https://hobitohum.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin/",
          "/api/",
          "/profil/",
          "/sifremi-unuttum/",
          "/kredi-satin-al/",
        ],
      },
      {
        // Google AdSense tarayıcısının sayfaları eksiksiz tarayıp onaylayabilmesi için
        userAgent: "Mediapartners-Google",
        allow: "/",
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: ["/admin/", "/api/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
