/**
 * Reklamları sıralama ve karıştırma yardımcısı:
 * 1. Admin tarafından belirlenen sıra numarasına (order > 0) sahip reklamlar küçükten büyüğe (1, 2, 3...) sıralanır.
 * 2. Sıra numarası belirtilmemiş (order <= 0 veya null/undefined) olan reklamlar Fisher-Yates algoritmasıyla rastgele karıştırılır.
 * 3. Önce sıralı reklamlar, ardından rastgele karıştırılmış sırasız reklamlar listelenir.
 */
export function sortAndShuffleAds<T extends { order?: number | null }>(ads: T[]): T[] {
  if (!ads || ads.length === 0) return [];

  // 1. Sıra numarası (order > 0) olanları al ve küçükten büyüğe sırala
  const orderedAds = ads
    .filter((a) => a.order !== null && a.order !== undefined && a.order > 0)
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  // 2. Sıra numarası belirtilmemiş (order <= 0 veya null) olanları al
  const unorderedAds = ads.filter(
    (a) => a.order === null || a.order === undefined || a.order <= 0
  );

  // 3. Sırasız olanları rastgele karıştır (Fisher-Yates Shuffle)
  const shuffled = [...unorderedAds];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  // 4. Önce sıralı reklamlar, ardından rastgele karışık reklamlar gelir
  return [...orderedAds, ...shuffled];
}
