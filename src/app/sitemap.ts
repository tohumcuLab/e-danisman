import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXTAUTH_URL || "https://hobitohum.com";

  // 1. Statik Sayfalar
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/en-cok-okunanlar`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/cevap-bekleyenler`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/danismanlar`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/duyurular`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/iletisim`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/gizlilik-politikasi`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/kullanici-sozlesmesi`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/telif-ve-yasal-uyari`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/topluluk-kurallari`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/kredi-kazan`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  try {
    // 2. Onaylı Sorular
    const questions = await prisma.question.findMany({
      where: { status: { in: ["OPEN", "ANSWERED", "CLOSED"] } },
      select: { id: true, updatedAt: true, createdAt: true },
      orderBy: { createdAt: "desc" },
      take: 1000,
    });

    const questionRoutes: MetadataRoute.Sitemap = questions.map((q) => ({
      url: `${baseUrl}/soru/${q.id}`,
      lastModified: new Date(q.updatedAt || q.createdAt),
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    // 3. Duyurular
    const announcements = await prisma.announcement.findMany({
      select: { id: true, createdAt: true },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    const announcementRoutes: MetadataRoute.Sitemap = announcements.map((a) => ({
      url: `${baseUrl}/duyurular/${a.id}`,
      lastModified: new Date(a.createdAt),
      changeFrequency: "weekly",
      priority: 0.6,
    }));

    return [...staticRoutes, ...questionRoutes, ...announcementRoutes];
  } catch (error) {
    console.error("Sitemap oluşturma hatası:", error);
    return staticRoutes;
  }
}
