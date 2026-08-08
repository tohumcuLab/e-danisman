import { prisma } from "@/lib/prisma";

export type SearchResults = {
  questions: any[];
  users: any[];
};

/**
 * Arama servisi.
 * İleride Elasticsearch'e geçildiğinde sadece bu servisin içi değiştirilecektir.
 * Uygulamanın geri kalanı bu arayüze (interface) bağımlı kalacaktır.
 */
export async function searchAll(query: string): Promise<SearchResults> {
  if (!query || query.trim().length < 2) {
    return { questions: [], users: [] };
  }

  const searchTerm = query.trim();

  // 1. Sorularda Arama (Başlık, İçerik veya Kategori Adı - Sadece Onaylı Sorular)
  const questions = await prisma.question.findMany({
    where: {
      status: { in: ["OPEN", "ANSWERED", "CLOSED"] },
      OR: [
        { title: { contains: searchTerm } },
        { body: { contains: searchTerm } },
        { category: { name: { contains: searchTerm } } }
      ]
    },
    include: {
      user: {
        select: { id: true, name: true, image: true, avatarUrl: true }
      },
      category: true,
      tags: {
        include: { tag: true }
      }
    },
    take: 20, // Limit results
    orderBy: { createdAt: "desc" }
  });

  // 2. Kullanıcılarda Arama (İsim veya Bio)
  const users = await prisma.user.findMany({
    where: {
      OR: [
        { name: { contains: searchTerm } },
        { bio: { contains: searchTerm } }
      ]
    },
    select: {
      id: true,
      name: true,
      image: true,
      avatarUrl: true,
      role: true,
      bio: true,
      city: true
    },
    take: 10
  });

  return { questions, users };
}
