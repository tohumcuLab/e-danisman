import { searchAll } from "@/lib/services/searchService";
import Link from "next/link";
import Image from "next/image";
import { getActiveFeedAds, generateRandomAdPositions } from "@/lib/services/adService";
import FeedAdCard from "@/components/shared/FeedAdCard";

export default async function AramaPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q || "";
  
  const [results, feedAds] = await Promise.all([
    searchAll(query),
    getActiveFeedAds()
  ]);

  return (
    <div className="container py-8 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">
        &quot;{query}&quot; için arama sonuçları
      </h1>

      {query.length < 2 && (
        <div className="bg-yellow-50 text-yellow-800 p-4 rounded-md mb-6">
          Arama yapmak için en az 2 karakter girmelisiniz.
        </div>
      )}

      {query.length >= 2 && results.questions.length === 0 && results.users.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          Sonuç bulunamadı. Lütfen farklı anahtar kelimeler deneyin.
        </div>
      )}

      {results.questions.length > 0 && (
        <div className="mb-10">
          <h2 className="text-xl font-semibold mb-4 border-b pb-2">Sorular ({results.questions.length})</h2>
          <div className="space-y-4">
            {(() => {
              const adPositions = generateRandomAdPositions(results.questions.length, 2, 4);
              let adCounter = 0;

              return results.questions.map((question, index) => {
                const isAdPosition = adPositions.has(index + 1);
                const adToShow = isAdPosition && feedAds.length > 0
                  ? feedAds[adCounter++ % feedAds.length]
                  : null;

                return (
                  <div key={question.id} className="space-y-4">
                    <div className="card p-4 hover:shadow-md transition-shadow">
                      <Link href={`/soru/${question.id}`}>
                        <h3 className="font-bold text-lg text-[var(--primary)] hover:underline mb-2">
                          {question.title}
                        </h3>
                      </Link>
                      <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-2">
                        {question.body}
                      </p>
                      <div className="pt-2 space-y-1.5 border-t border-[var(--outline-variant)]/50 mt-2 mb-3">
                        {question.category && (
                          <div className="flex items-center gap-2">
                            <span className="bg-[var(--primary)]/10 text-[var(--primary)] text-xs font-bold px-2.5 py-1 rounded-md">
                              📁 {question.category.name}
                            </span>
                          </div>
                        )}
                        {question.cropType && (
                          <div className="flex items-center gap-2">
                            <span className="bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs font-semibold px-2.5 py-1 rounded-md">
                              🌱 {question.cropType}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          {question.user.image || question.user.avatarUrl ? (
                            <Image 
                              src={question.user.image || question.user.avatarUrl} 
                              alt={question.user.name} 
                              width={20} 
                              height={20} 
                              className="rounded-full"
                            />
                          ) : (
                            <div className="w-5 h-5 rounded-full bg-gray-200" />
                          )}
                          <span>{question.user.name}</span>
                        </div>
                        <span>{new Date(question.createdAt).toLocaleDateString('tr-TR')}</span>
                      </div>
                    </div>

                    {adToShow && <FeedAdCard ad={adToShow} />}
                  </div>
                );
              });
            })()}
          </div>
        </div>
      )}

      {results.users.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4 border-b pb-2">Kullanıcılar / Danışmanlar ({results.users.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {results.users.map((user) => (
              <div key={user.id} className="card p-4 flex items-start gap-4 hover:shadow-md transition-shadow">
                {user.image || user.avatarUrl ? (
                  <Image 
                    src={user.image || user.avatarUrl} 
                    alt={user.name} 
                    width={50} 
                    height={50} 
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-[50px] h-[50px] rounded-full bg-gray-200 flex-shrink-0" />
                )}
                <div>
                  <h3 className="font-bold">{user.name}</h3>
                  <div className="text-xs text-gray-500 mb-2">
                    {user.role === "EXPERT" ? (
                      <span className="text-green-600 bg-green-50 px-2 py-0.5 rounded-full font-medium">Danışman</span>
                    ) : (
                      <span>Üye</span>
                    )}
                    {user.city && <span className="ml-2">• {user.city}</span>}
                  </div>
                  {user.bio && (
                    <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-1">{user.bio}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
