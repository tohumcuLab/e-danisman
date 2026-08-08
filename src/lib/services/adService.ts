import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function getActiveFeedAds() {
  try {
    const ads = await prisma.ad.findMany({
      where: {
        isActive: true,
        OR: [
          { placement: "FEED" },
          { type: "FEED" }
        ],
        AND: [
          {
            OR: [
              { endDate: null },
              { endDate: { gte: new Date() } }
            ]
          }
        ]
      },
      orderBy: { createdAt: "desc" }
    });

    const validAds = ads.filter(
      (ad) => ad.impressionLimit === null || ad.impressionCount < ad.impressionLimit
    );

    // Her sayfa yenilendiğinde reklam sırasını rastgele karıştır
    return shuffleArray(validAds);
  } catch (error) {
    console.error("Feed reklamları çekme hatası:", error);
    return [];
  }
}

export function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Liste uzunluğuna göre rastgele reklam konumları üretir.
 * Her sayfa yenilendiğinde reklamların akıştaki konumları 3-5 öğede bir rastgele değişir.
 */
export function generateRandomAdPositions(itemCount: number, minGap = 3, maxGap = 5): Set<number> {
  const adPositions = new Set<number>();
  if (itemCount === 0) return adPositions;

  let currentPos = Math.floor(Math.random() * (maxGap - minGap + 1)) + minGap;

  while (currentPos <= itemCount) {
    adPositions.add(currentPos);
    currentPos += Math.floor(Math.random() * (maxGap - minGap + 1)) + minGap;
  }

  return adPositions;
}
