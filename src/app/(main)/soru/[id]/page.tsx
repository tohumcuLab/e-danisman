import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";
import Link from "next/link";
import ShareButtons from "@/components/shared/ShareButtons";
import AnswerForm from "@/components/shared/AnswerForm";
import LikeButton from "@/components/shared/LikeButton";
import ReportButton from "@/components/shared/ReportButton";
import { auth } from "@/auth";
import AnswerActions from "@/components/shared/AnswerActions";
import AnswerItem from "@/components/shared/AnswerItem";
import ImageGallery from "@/components/shared/ImageGallery";

import { PendingQuestionPreviewBanner, EditPendingQuestionButton } from "@/components/shared/PendingQuestionPreviewBanner";

import type { Metadata } from "next";
export const dynamic = "force-dynamic";

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id } = await params;
  const question = await prisma.question.findUnique({
    where: { id },
    include: { images: { orderBy: { order: "asc" }, take: 1 } }
  });

  if (!question) {
    return { title: "Soru Bulunamadı | Tarımsal e-Danışman" };
  }

  const description = question.body.length > 150 
    ? question.body.substring(0, 150) + "..." 
    : question.body;

  const images = question.images.length > 0 ? [question.images[0].url] : [];

  return {
    title: `${question.title} | Tarımsal e-Danışman`,
    description,
    openGraph: {
      title: question.title,
      description,
      type: "article",
      images,
    },
    twitter: {
      card: "summary_large_image",
      title: question.title,
      description,
      images,
    }
  };
}
export default async function QuestionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();

  if (!id) {
    notFound();
  }

  const question = await prisma.question.findUnique({
    where: { id },
    include: {
      user: { select: { name: true, image: true, id: true } },
      category: { select: { name: true } },
      images: { orderBy: { order: "asc" } },
      tags: { include: { tag: true } },
      answers: {
        where: { 
          parentId: null,
          OR: [
            { status: "APPROVED" },
            ...(session?.user?.id ? [{ userId: session.user.id }] : []),
            ...(session?.user?.role === "ADMIN" ? [{ status: "PENDING_APPROVAL" }] : [])
          ]
        },
        orderBy: [
          { isAccepted: "desc" },
          { createdAt: "asc" }
        ],
        include: {
          user: { select: { name: true, image: true, id: true, credits: true, role: true } },
          likes: session?.user?.id ? { where: { userId: session.user.id } } : false,
          _count: { select: { likes: true } },
          replies: {
            orderBy: { createdAt: "asc" },
            include: {
              user: { select: { name: true, image: true, id: true, credits: true, role: true } },
              likes: session?.user?.id ? { where: { userId: session.user.id } } : false,
              _count: { select: { likes: true } }
            }
          }
        }
      }
    }
  });

  if (!question) {
    notFound();
  }

  const isQuestionOwner = session?.user?.id === question.userId;
  const isAdmin = session?.user?.role === "ADMIN";

  // Eğer soru onay bekliyorsa veya reddedildiyse ve bakan kişi sahibi veya admin değilse 404 göster
  if ((question.status === "PENDING_APPROVAL" || question.status === "REJECTED") && !isQuestionOwner && !isAdmin) {
    notFound();
  }

  const relatedQuestions = await prisma.question.findMany({
    where: {
      categoryId: question.categoryId,
      id: { not: question.id },
      status: { in: ["OPEN", "ANSWERED", "CLOSED"] }
    },
    take: 9,
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true } },
      category: { select: { name: true } },
      images: { orderBy: { order: "asc" }, take: 1 },
      _count: { select: { answers: true } }
    }
  });

  const categories = await prisma.category.findMany({
    select: { id: true, name: true, icon: true },
    orderBy: { order: "asc" }
  });

  const hasAcceptedAny = question.answers.some(a => a.isAccepted);

  return (
    <div className="container max-w-4xl py-6">
      {/* Onay Bekliyor Bildirimi (Ön İzleme Modu) */}
      {question.status === "PENDING_APPROVAL" && (
        <PendingQuestionPreviewBanner />
      )}

      {/* Reddedildi Bildirimi */}
      {question.status === "REJECTED" && (
        <div className="mb-4 p-4 bg-red-500/10 border-2 border-red-500/40 text-red-800 dark:text-red-300 rounded-2xl text-xs font-bold flex items-center gap-3">
          <span className="text-xl">❌</span>
          <div>
            <div>Bu soru yönetici tarafından reddedilmiştir.</div>
            <div className="font-normal opacity-90">Sorunuz içerik kurallarına uymadığı için yayına alınmamış ve harcadığınız krediler hesabınıza iade edilmiştir.</div>
          </div>
        </div>
      )}

      {/* Soru Detay Ana Kartı */}
      <div className="card p-6 md:p-8 space-y-6">
        
        {/* Kullanıcı Bilgisi & Başlık */}
        <div className="space-y-3 pb-4 border-b border-[var(--outline-variant)]">
          <div className="flex items-center justify-between text-xs text-[var(--on-surface-variant)]">
            <Link href={`/kullanici/${question.user.id}`} className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] font-bold flex items-center justify-center border border-[var(--primary)]/30 shrink-0 text-sm shadow-sm">
                {question.user.name?.charAt(0).toUpperCase() || "U"}
              </div>
              <div>
                <h4 className="font-bold text-sm text-[var(--on-surface)] group-hover:text-[var(--primary)] transition-colors leading-tight">
                  {question.user.name}
                </h4>
                <p className="text-[11px] text-[var(--on-surface-variant)] mt-0.5">
                  {formatDistanceToNow(new Date(question.createdAt), { addSuffix: true, locale: tr })}
                </p>
              </div>
            </Link>
            
            {(question.city || question.district) && (
              <span className="flex items-center gap-1 font-medium bg-[var(--surface-container-high)] px-3 py-1 rounded-md text-xs">
                📍 {question.city} {question.district && `, ${question.district}`}
              </span>
            )}
          </div>

          <h1 className="text-2xl md:text-3xl font-extrabold text-[var(--on-surface)] leading-tight pt-1">
            {question.title}
          </h1>
        </div>

        {/* 1. ÖNCE RESİMLER (Instagram Tarzı Kaydırmalı Galeri & Mobil Zoom) */}
        {question.images.length > 0 && (
          <ImageGallery images={question.images} />
        )}

        {/* 2. SONRA SORU AÇIKLAMASI */}
        <div className="text-sm md:text-base text-[var(--on-surface)] leading-relaxed whitespace-pre-wrap">
          {question.body}
        </div>

        {/* 3. METİN ALTI: Satır 1 -> Kategori, Satır 2 -> Bitki/Ürün Türü ve Etiketler */}
        <div className="pt-4 space-y-2 border-t border-[var(--outline-variant)]">
          {/* Satır 1: Kategori */}
          <div className="flex items-center gap-2">
            <span className="bg-[var(--primary)]/10 text-[var(--primary)] text-xs font-bold px-3 py-1 rounded-md">
              📁 Kategori: {question.category.name}
            </span>
          </div>

          {/* Satır 2: Bitki / Ürün Türü & Etiketler */}
          {(question.cropType || question.tags.length > 0) && (
            <div className="flex flex-wrap items-center gap-2 pt-0.5">
              {question.cropType && (
                <span className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-700 px-3 py-1 rounded-md text-xs font-semibold">
                  🌱 Ürün: {question.cropType}
                </span>
              )}
              {question.tags.map(qt => (
                <span key={qt.tagId} className="text-xs font-semibold bg-[var(--surface-container-high)] text-[var(--on-surface-variant)] px-3 py-1 rounded-md border border-[var(--outline-variant)]">
                  #{qt.tag.name}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Sosyal Paylaşım ve Şikayet */}
        <div className="flex items-center justify-between pt-4 border-t border-[var(--outline-variant)]">
          <ShareButtons title={question.title} text={question.body} id={question.id} />
          {session?.user && (
            <ReportButton targetType="QUESTION" targetId={question.id} />
          )}
        </div>
      </div>

      {/* Soru Kutusu Altında Tam Genişlikte Soruyu Düzelt/Düzenle Butonu */}
      {question.status === "PENDING_APPROVAL" && (
        <EditPendingQuestionButton
          question={question}
          categories={categories}
          isOwnerOrAdmin={isQuestionOwner || isAdmin}
        />
      )}

      {/* Cevaplar Bölümü */}
      <div className="mt-10 space-y-6">
        <h2 className="text-xl font-bold text-[var(--on-surface)] flex items-center gap-2">
          <span>💬 Yanıtlar</span>
          <span className="text-sm font-semibold text-[var(--on-surface-variant)]">({question.answers.length})</span>
        </h2>
        
        <div className="space-y-6">
          {question.answers.map(answer => (
            <AnswerItem
              key={answer.id}
              answer={answer}
              questionId={question.id}
              currentUserId={session?.user?.id}
              currentUserRole={session?.user?.role}
              isQuestionOwner={isQuestionOwner}
              hasAcceptedAny={hasAcceptedAny}
            />
          ))}
        </div>

        {/* Cevap Yazma Formu */}
        <div className="mt-8">
          <AnswerForm questionId={question.id} userRole={session?.user?.role} />
        </div>

        {/* Benzer Kategori Soruları Slider */}
        {relatedQuestions.length > 0 && (
          <div className="mt-12 space-y-4 pt-6 border-t border-[var(--outline-variant)]">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[var(--on-surface)] flex items-center gap-2">
                <span>🌿 Bu Kategorideki Diğer Sorular</span>
                <span className="text-xs bg-[var(--primary)]/10 text-[var(--primary)] font-extrabold px-2.5 py-0.5 rounded-full">
                  {question.category.name}
                </span>
              </h3>
              <span className="text-xs text-[var(--on-surface-variant)] font-semibold">Sağa Kaydırın ➔</span>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory scrollbar-thin">
              {relatedQuestions.map(rq => (
                <Link 
                  key={rq.id} 
                  href={`/soru/${rq.id}`} 
                  className="snap-start shrink-0 w-72 card p-4 hover:border-[var(--primary)] transition-all group flex flex-col justify-between"
                >
                  <div>
                    {rq.images.length > 0 ? (
                      <div className="w-full h-36 rounded-xl overflow-hidden mb-3 bg-[var(--surface-container-high)]">
                        <img 
                          src={rq.images[0].url} 
                          alt={rq.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ) : (
                      <div className="w-full h-24 rounded-xl mb-3 bg-[var(--primary)]/5 border border-[var(--primary)]/20 flex items-center justify-center text-3xl">
                        🌱
                      </div>
                    )}
                    <span className="text-[10px] font-extrabold text-[var(--primary)] uppercase tracking-wider block mb-1">
                      {rq.cropType || rq.category.name}
                    </span>
                    <h4 className="font-bold text-xs text-[var(--on-surface)] group-hover:text-[var(--primary)] transition-colors line-clamp-2 leading-snug">
                      {rq.title}
                    </h4>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-[var(--on-surface-variant)] pt-3 border-t border-[var(--outline-variant)] mt-3">
                    <span className="font-medium">{rq.user.name}</span>
                    <span className="font-bold text-[var(--primary)] flex items-center gap-1">
                      💬 {rq._count.answers} Yanıt
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Yasal Telif Uyarısı Kutusu */}
        <div className="mt-8 p-4 rounded-xl bg-[var(--surface-container-low)] border border-[var(--outline-variant)] text-[11px] text-[var(--on-surface-variant)] space-y-1">
          <div className="font-bold text-[var(--on-surface)] flex items-center gap-1.5">
            <span>⚖️ Yasal Haklar ve Telif Bildirimi</span>
          </div>
          <p>
            Bu sayfada yer alan tüm soru metinleri, ziraat uzmanı teşhis/tedavi yanıtları ve yüklenen medya dosyaları <strong>5846 Sayılı Fikir ve Sanat Eserleri Kanunu (FSEK)</strong> uyarınca Tarımsal e-Danışman (Hobitohum.com) bünyesinde koruma altındadır. Kaynak gösterilmeden veya izinsiz kopyalanması, çoğaltılması ve başka platformlarda yayınlanması yasaktır. Detaylı bilgi için <Link href="/telif-ve-yasal-uyari" className="text-[var(--primary)] font-bold underline">Telif Hakları ve Yasal Uyarı</Link> sayfasını ziyaret ediniz.
          </p>
        </div>
      </div>
    </div>
  );
}
