"use client";

import { useState, useEffect } from "react";
import { submitContactMessage, submitAdRequest } from "@/app/actions/contact";
import { useSearchParams } from "next/navigation";

const AD_PACKAGES = [
  {
    id: "10K",
    title: "Başlangıç Paketi",
    views: "10.000 Gösterim",
    price: 3000,
    estimatedTime: "Tahmini Gösterim Süresi: ~15-20 Gün",
    description: "Yeni başlayanlar veya küçük bütçeli kampanyalar için idealdir.",
    iyzicoLink: "#",
  },
  {
    id: "50K",
    title: "Standart Paket",
    views: "50.000 Gösterim",
    price: 12000,
    estimatedTime: "Tahmini Gösterim Süresi: ~2-3 Ay",
    description: "Orta ölçekli firmalar ve daha geniş kitleye ulaşmak isteyenler için.",
    iyzicoLink: "#",
    isPopular: true,
  },
  {
    id: "100K",
    title: "Pro Paket",
    views: "100.000 Gösterim",
    price: 20000,
    estimatedTime: "Tahmini Gösterim Süresi: ~4-6 Ay",
    description: "Maksimum görünürlük ve uzun soluklu marka bilinirliği kampanyaları için.",
    iyzicoLink: "#",
  }
];

export default function IletisimForm({ 
  adSettings,
  initialPackages
}: { 
  adSettings?: Record<string, string>;
  initialPackages?: Array<{
    id: string;
    title: string;
    views: string;
    price: number;
    estimatedTime: string | null;
    description: string | null;
    imageUrl: string | null;
    iyzicoLink: string | null;
    isPopular: boolean;
  }>;
}) {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");

  const [activeTab, setActiveTab] = useState<"CONTACT" | "CONSULTANT" | "AD">("CONTACT");
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const AD_PACKAGES = (initialPackages && initialPackages.length > 0)
    ? initialPackages
    : [
        {
          id: "10K",
          title: "Başlangıç Paketi",
          views: "10.000 Gösterim",
          price: parseFloat(adSettings?.["AD_PACKAGE_10K_PRICE"] || "3000"),
          estimatedTime: "Tahmini Gösterim Süresi: ~15-20 Gün",
          description: "Yeni başlayanlar veya küçük bütçeli kampanyalar için idealdir.",
          imageUrl: "/iyzico/reklam-baslangic.jpg",
          iyzicoLink: adSettings?.["AD_PACKAGE_10K_LINK"] || "#",
          isPopular: false,
        },
        {
          id: "50K",
          title: "Standart Paket",
          views: "50.000 Gösterim",
          price: parseFloat(adSettings?.["AD_PACKAGE_50K_PRICE"] || "12000"),
          estimatedTime: "Tahmini Gösterim Süresi: ~2-3 Ay",
          description: "Orta ölçekli firmalar ve daha geniş kitleye ulaşmak isteyenler için.",
          imageUrl: "/iyzico/reklam-standart.jpg",
          iyzicoLink: adSettings?.["AD_PACKAGE_50K_LINK"] || "#",
          isPopular: true,
        },
        {
          id: "100K",
          title: "Pro Paket",
          views: "100.000 Gösterim",
          price: parseFloat(adSettings?.["AD_PACKAGE_100K_PRICE"] || "20000"),
          estimatedTime: "Tahmini Gösterim Süresi: ~4-6 Ay",
          description: "Maksimum görünürlük ve uzun soluklu marka bilinirliği kampanyaları için.",
          imageUrl: "/iyzico/reklam-pro.jpg",
          iyzicoLink: adSettings?.["AD_PACKAGE_100K_LINK"] || "#",
          isPopular: false,
        }
      ];

  useEffect(() => {
    if (tabParam === "ad" || tabParam === "reklam") {
      setActiveTab("AD");
    } else if (tabParam === "consultant" || tabParam === "danisman") {
      setActiveTab("CONSULTANT");
    } else if (tabParam === "contact" || tabParam === "iletisim") {
      setActiveTab("CONTACT");
    }
  }, [tabParam]);

  // İletişim Form State
  const [contactForm, setContactForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  
  // Reklam Form State
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [adForm, setAdForm] = useState({ name: "", email: "", phone: "", companyName: "", adTitle: "", destinationUrl: "", imageUrl: "" });
  
  // Ödeme Yönlendirme State
  const [paymentLink, setPaymentLink] = useState<string | null>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 4 * 1024 * 1024) {
      alert("Yüklenen reklam görseli maksimum 4 MB olabilir.");
      return;
    }

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "AD_IMAGE");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Görsel yüklenemedi.");
      }

      if (data.urls && data.urls.length > 0) {
        setAdForm((prev) => ({ ...prev, imageUrl: data.urls[0] }));
      }
    } catch (err: any) {
      alert(err.message || "Görsel yüklenirken bir hata oluştu.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleContactSubmit = async (e: React.FormEvent, type: "GENERAL" | "CONSULTANT_APP") => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg("");
    setErrorMsg("");

    const res = await submitContactMessage({
      ...contactForm,
      type
    });

    if (res.success) {
      setSuccessMsg("Mesajınız başarıyla alınmıştır. En kısa sürede size dönüş yapacağız.");
      setContactForm({ name: "", email: "", phone: "", subject: "", message: "" });
    } else {
      setErrorMsg(res.error || "Bir hata oluştu.");
    }
    setLoading(false);
  };

  const handleAdSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPackage) return;
    
    setLoading(true);
    setSuccessMsg("");
    setErrorMsg("");

    const pkg = AD_PACKAGES.find(p => p.id === selectedPackage);
    if (!pkg) return;

    const res = await submitAdRequest({
      ...adForm,
      packageId: pkg.id,
      price: pkg.price,
    });

    if (res.success) {
      setSuccessMsg("Reklam talebiniz oluşturuldu! Ödeme sayfasına yeni sekmede yönlendiriliyorsunuz...");
      setPaymentLink(pkg.iyzicoLink);
      if (pkg.iyzicoLink && pkg.iyzicoLink !== "#") {
        const link = pkg.iyzicoLink;
        setTimeout(() => {
          window.open(link, "_blank");
        }, 1500);
      }
    } else {
      setErrorMsg(res.error || "Bir hata oluştu.");
    }
    setLoading(false);
  };

  return (
    <div className="card p-6">
      <h1 className="text-2xl font-black text-[var(--on-surface)] mb-2">Bizimle İletişime Geçin</h1>
      <p className="text-sm text-[var(--on-surface-variant)] mb-6">
        Tarımsal e-Danışman platformu ile ilgili tüm soru, öneri, danışmanlık başvurusu ve sponsorluk (reklam) talepleriniz için aşağıdaki formları kullanabilirsiniz.
      </p>

      {/* Tab Menü */}
      <div className="flex flex-wrap items-center gap-2 mb-6 border-b border-[var(--outline-variant)] pb-2">
        <button 
          onClick={() => {setActiveTab("CONTACT"); setSuccessMsg(""); setErrorMsg("");}}
          className={`px-4 py-2 text-sm font-bold rounded-t-lg transition-colors ${activeTab === "CONTACT" ? "bg-[var(--primary)] text-white" : "text-[var(--on-surface-variant)] hover:bg-[var(--surface-variant)]"}`}
        >
          İletişim & Sorun Bildir
        </button>
        <button 
          onClick={() => {setActiveTab("CONSULTANT"); setSuccessMsg(""); setErrorMsg("");}}
          className={`px-4 py-2 text-sm font-bold rounded-t-lg transition-colors ${activeTab === "CONSULTANT" ? "bg-[var(--primary)] text-white" : "text-[var(--on-surface-variant)] hover:bg-[var(--surface-variant)]"}`}
        >
          Danışman Ol
        </button>
        <button 
          onClick={() => {setActiveTab("AD"); setSuccessMsg(""); setErrorMsg("");}}
          className={`px-4 py-2 text-sm font-bold rounded-t-lg transition-colors ${activeTab === "AD" ? "bg-amber-600 text-white" : "text-[var(--on-surface-variant)] hover:bg-[var(--surface-variant)]"}`}
        >
          Sponsor & Reklam Ver
        </button>
      </div>

      {/* Mesajlar */}
      {successMsg && (
        <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 rounded-xl text-sm font-medium">
          {successMsg}
          {paymentLink && paymentLink !== "#" && (
            <div className="mt-3">
              <a href={paymentLink} target="_blank" rel="noopener noreferrer" className="inline-block bg-emerald-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-emerald-700 transition-colors">
                Ödemeye Git (Yeni Sekmede Aç) ➔
              </a>
            </div>
          )}
          {(!paymentLink || paymentLink === "#") && (
            <div className="mt-3 text-xs opacity-70">
              * Ödeme linki henüz sistem yöneticisi tarafından yapılandırılmamıştır. Başvurunuz yöneticilerimiz tarafından incelenip sizinle iletişime geçilecektir.
            </div>
          )}
        </div>
      )}
      {errorMsg && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 text-red-700 dark:text-red-400 rounded-xl text-sm font-medium">
          {errorMsg}
        </div>
      )}

      {/* 1. İletişim Formu */}
      {activeTab === "CONTACT" && (
        <form onSubmit={(e) => handleContactSubmit(e, "GENERAL")} className="space-y-4 animate-in fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--on-surface-variant)] mb-1">Ad Soyad</label>
              <input type="text" required value={contactForm.name} onChange={e => setContactForm({...contactForm, name: e.target.value})} className="input w-full" placeholder="Adınız Soyadınız" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--on-surface-variant)] mb-1">E-posta</label>
              <input type="email" required value={contactForm.email} onChange={e => setContactForm({...contactForm, email: e.target.value})} className="input w-full" placeholder="E-posta adresiniz" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[var(--on-surface-variant)] mb-1">Konu</label>
            <input type="text" required value={contactForm.subject} onChange={e => setContactForm({...contactForm, subject: e.target.value})} className="input w-full" placeholder="İletişim konusu (Örn: Hata Bildirimi)" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[var(--on-surface-variant)] mb-1">Mesajınız</label>
            <textarea required rows={5} value={contactForm.message} onChange={e => setContactForm({...contactForm, message: e.target.value})} className="input w-full resize-none" placeholder="Lütfen mesajınızı detaylıca yazın..."></textarea>
          </div>
          <button type="submit" disabled={loading} className="btn btn-primary w-full md:w-auto">
            {loading ? "Gönderiliyor..." : "Mesajı Gönder"}
          </button>
        </form>
      )}

      {/* 2. Danışman Başvuru Formu */}
      {activeTab === "CONSULTANT" && (
        <form onSubmit={(e) => handleContactSubmit(e, "CONSULTANT_APP")} className="space-y-4 animate-in fade-in">
          <div className="p-4 bg-[var(--primary)]/10 text-[var(--primary)] rounded-xl text-sm mb-4">
            👨‍🌾 Ziraat mühendisi, tekniker veya tecrübeli bir üreticiyseniz platformumuzda **Danışman (Uzman)** profil rozeti almak için başvuru yapabilirsiniz.
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--on-surface-variant)] mb-1">Ad Soyad</label>
              <input type="text" required value={contactForm.name} onChange={e => setContactForm({...contactForm, name: e.target.value})} className="input w-full" placeholder="Adınız Soyadınız" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--on-surface-variant)] mb-1">E-posta</label>
              <input type="email" required value={contactForm.email} onChange={e => setContactForm({...contactForm, email: e.target.value})} className="input w-full" placeholder="E-posta adresiniz" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[var(--on-surface-variant)] mb-1">Telefon Numarası</label>
            <input type="tel" required value={contactForm.phone} onChange={e => setContactForm({...contactForm, phone: e.target.value})} className="input w-full" placeholder="05XX XXX XX XX" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[var(--on-surface-variant)] mb-1">Uzmanlık Alanınız ve Tecrübeleriniz</label>
            <textarea required rows={5} value={contactForm.message} onChange={e => setContactForm({...contactForm, message: e.target.value})} className="input w-full resize-none" placeholder="Hangi bitki türlerinde uzmansınız? Hangi kurumlarda/tarlalarda görev aldınız? Lütfen kısaca kendinizden bahsedin."></textarea>
          </div>
          <button type="submit" disabled={loading} className="btn btn-primary w-full md:w-auto">
            {loading ? "Başvuruyu İletiyor..." : "Danışmanlık Başvurusunu Gönder"}
          </button>
        </form>
      )}

      {/* 3. Reklam Ver Formu */}
      {activeTab === "AD" && (
        <div className="animate-in fade-in">
          {!selectedPackage ? (
            <>
              <p className="text-sm text-[var(--on-surface-variant)] mb-6 font-medium">
                Binlerce çiftçinin ve tarım gönüllüsünün buluştuğu platformumuzda markanızı öne çıkarın! Bütçenize uygun gösterim paketini seçin ve Iyzico güvencesiyle ödemenizi tamamlayarak reklamınızı hemen başlatın. Reklam hedefine ulaşınca otomatik olarak pasife alınır ve size raporlanır.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {AD_PACKAGES.map(pkg => (
                  <div 
                    key={pkg.id} 
                    onClick={() => setSelectedPackage(pkg.id)}
                    className={`card p-4 sm:p-5 cursor-pointer transition-all border-2 flex flex-col h-full hover:-translate-y-1 hover:shadow-lg group ${pkg.isPopular ? 'border-amber-500 bg-amber-500/5' : 'border-transparent hover:border-[var(--primary)]/50'}`}
                  >
                    {pkg.isPopular && <div className="text-xs font-extrabold text-amber-600 mb-2 uppercase">Popüler Tercih</div>}
                    
                    {pkg.imageUrl && (
                      <div className="w-full aspect-square mb-3.5 rounded-2xl overflow-hidden bg-black/5 dark:bg-black/20 border border-[var(--outline-variant)] shadow-sm">
                        <img 
                          src={pkg.imageUrl} 
                          alt={pkg.title} 
                          className="w-full h-full object-cover rounded-2xl group-hover:scale-105 transition-transform duration-300" 
                        />
                      </div>
                    )}

                    <h3 className="font-bold text-lg mb-1">{pkg.title}</h3>
                    <div className="text-2xl font-black text-[var(--primary)] mb-2">{pkg.price.toLocaleString("tr-TR")} ₺</div>
                    <div className="text-sm font-semibold text-[var(--on-surface)] mb-1">{pkg.views}</div>
                    {pkg.estimatedTime && <div className="text-[11px] text-[var(--on-surface-variant)] italic mb-3">*{pkg.estimatedTime}</div>}
                    {pkg.description && <p className="text-xs text-[var(--on-surface-variant)] flex-1">{pkg.description}</p>}
                    <button className={`mt-4 w-full py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm ${pkg.isPopular ? 'bg-amber-600 hover:bg-amber-700 text-white' : 'bg-[var(--surface-variant)] text-[var(--on-surface)] hover:bg-[var(--primary)] hover:text-white'}`}>
                      Bu Paketi Satın Al ➔
                    </button>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <form onSubmit={handleAdSubmit} className="space-y-5 animate-in slide-in-from-right-4">
              
              {/* Formun En Üstünde Seçili Paketin Büyük Görseli ve Detay Kartı */}
              {(() => {
                const currentPkg = AD_PACKAGES.find((p) => p.id === selectedPackage);
                if (!currentPkg) return null;

                return (
                  <div className="bg-gradient-to-br from-amber-500/10 via-[var(--surface-container-low)] to-emerald-500/10 p-4 sm:p-5 rounded-2xl border-2 border-amber-500/30 shadow-sm">
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-5">
                      {/* Kare Görsel - Boşluksuz Tam Kaplama */}
                      {currentPkg.imageUrl && (
                        <div className="w-full max-w-[200px] sm:max-w-[220px] sm:w-48 aspect-square shrink-0 rounded-2xl overflow-hidden bg-black/5 dark:bg-black/20 border border-amber-500/30 shadow-md">
                          <img
                            src={currentPkg.imageUrl}
                            alt={currentPkg.title}
                            className="w-full h-full object-cover rounded-2xl"
                          />
                        </div>
                      )}

                      {/* Bilgiler & Değiştir Butonu */}
                      <div className="flex-1 min-w-0 flex flex-col justify-between space-y-3 w-full">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] bg-amber-500 text-white font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                              Seçilen Reklam Paketi
                            </span>
                            {currentPkg.isPopular && (
                              <span className="text-[10px] bg-emerald-600 text-white font-bold px-2 py-0.5 rounded-full">
                                Popüler Tercih
                              </span>
                            )}
                          </div>

                          <h3 className="text-xl font-black text-[var(--on-surface)] mt-1.5 leading-tight">
                            {currentPkg.title}
                          </h3>

                          <div className="flex flex-wrap items-center gap-2.5 text-xs mt-1.5">
                            <span className="text-2xl font-black text-[var(--primary)]">
                              {currentPkg.price.toLocaleString("tr-TR")} ₺
                            </span>
                            <span className="font-extrabold text-[var(--on-surface)] bg-[var(--surface-container-high)] px-3 py-1 rounded-lg border border-[var(--outline-variant)]">
                              👁️ {currentPkg.views}
                            </span>
                            {currentPkg.estimatedTime && (
                              <span className="text-xs text-[var(--on-surface-variant)] italic">
                                *{currentPkg.estimatedTime}
                              </span>
                            )}
                          </div>

                          {currentPkg.description && (
                            <p className="text-xs text-[var(--on-surface-variant)] mt-2 font-medium leading-relaxed">
                              {currentPkg.description}
                            </p>
                          )}
                        </div>

                        <div className="pt-2 border-t border-[var(--outline-variant)]/60 flex justify-end">
                          <button
                            type="button"
                            onClick={() => setSelectedPackage(null)}
                            className="px-4 py-2 bg-[var(--surface-container-high)] hover:bg-red-500/10 text-red-600 hover:text-red-700 dark:hover:text-red-400 font-bold text-xs rounded-xl border border-[var(--outline-variant)] hover:border-red-300 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                          >
                            <span>🔄 Farklı Paket Seç</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              <div className="space-y-4">
                <h4 className="font-bold text-sm border-b border-[var(--outline-variant)] pb-2">İletişim & Fatura Bilgileri</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--on-surface-variant)] mb-1">Ad Soyad (Yetkili)</label>
                    <input type="text" required value={adForm.name} onChange={e => setAdForm({...adForm, name: e.target.value})} className="input w-full" placeholder="Adınız Soyadınız" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[var(--on-surface-variant)] mb-1">Firma / Marka Adı</label>
                    <input type="text" value={adForm.companyName} onChange={e => setAdForm({...adForm, companyName: e.target.value})} className="input w-full" placeholder="Firma adınız (Opsiyonel)" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[var(--on-surface-variant)] mb-1">E-posta</label>
                    <input type="email" required value={adForm.email} onChange={e => setAdForm({...adForm, email: e.target.value})} className="input w-full" placeholder="E-posta adresiniz" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[var(--on-surface-variant)] mb-1">Telefon Numarası</label>
                    <input type="tel" required value={adForm.phone} onChange={e => setAdForm({...adForm, phone: e.target.value})} className="input w-full" placeholder="05XX XXX XX XX" />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-bold text-sm border-b border-[var(--outline-variant)] pb-2">Reklam Materyalleri</h4>
                <div>
                  <label className="block text-xs font-semibold text-[var(--on-surface-variant)] mb-1">Reklam Başlığı / Sloganı</label>
                  <input type="text" required maxLength={60} value={adForm.adTitle} onChange={e => setAdForm({...adForm, adTitle: e.target.value})} className="input w-full" placeholder="Maks. 60 Karakter" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--on-surface-variant)] mb-1">Yönlendirilecek Web Sitesi Linki (URL)</label>
                  <input type="url" required value={adForm.destinationUrl} onChange={e => setAdForm({...adForm, destinationUrl: e.target.value})} className="input w-full" placeholder="https://www.siteniz.com" />
                </div>
                
                {/* Görsel Yükleme Alanı & Tavsiye Edilen Ölçüler */}
                <div className="space-y-3 pt-2">
                  <label className="block text-xs font-semibold text-[var(--on-surface-variant)]">
                    Reklam Görseli (Dosya Yükle veya URL Yapıştır)
                  </label>

                  {/* Ölçü & Format Rehberi */}
                  <div className="p-3.5 bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl text-xs space-y-1">
                    <div className="font-bold text-blue-900 dark:text-blue-200 flex items-center gap-1.5">
                      <span>📐 Tavsiye Edilen Görsel Ölçüleri & Formatı</span>
                    </div>
                    <p className="text-[11px] text-blue-800 dark:text-blue-300 leading-tight">
                      • <strong>Tavsiye Edilen Ölçü:</strong> 1200 x 630 px (Yatay Banner) veya 800 x 800 px (Kare Banner)<br/>
                      • <strong>Maksimum Dosya Boyutu:</strong> 4 MB (JPG, PNG, WEBP, GIF)<br/>
                      • Yüklediğiniz görsel yöneticilerimiz tarafından incelendikten sonra yayına alınacaktır.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <label className="flex items-center justify-center px-4 py-2.5 bg-[var(--primary)] text-white text-xs font-bold rounded-xl cursor-pointer hover:bg-[var(--primary-container)] hover:text-[var(--on-primary-container)] transition-all shadow-sm">
                        {uploadingImage ? "Görsel Yükleniyor..." : "📁 Cihazınızdan Görsel Seçin & Yükleyin (Max 4MB)"}
                        <input
                          type="file"
                          accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                          onChange={handleImageUpload}
                          disabled={uploadingImage}
                          className="hidden"
                        />
                      </label>
                      
                      {adForm.imageUrl && (
                        <button
                          type="button"
                          onClick={() => setAdForm({ ...adForm, imageUrl: "" })}
                          className="text-xs text-red-600 hover:underline font-bold px-2 py-1"
                        >
                          ✕ Görseli Kaldır
                        </button>
                      )}
                    </div>

                    <input 
                      type="url" 
                      value={adForm.imageUrl} 
                      onChange={e => setAdForm({...adForm, imageUrl: e.target.value})} 
                      className="input w-full text-xs" 
                      placeholder="Veya harici görsel URL adresi yapıştırın (https://...)" 
                    />

                    {adForm.imageUrl && (
                      <div className="p-3 bg-[var(--surface-container-low)] border border-[var(--outline-variant)] rounded-xl w-fit">
                        <div className="text-[10px] font-bold text-[var(--on-surface-variant)] mb-1">Yüklenen Görsel Önizlemesi:</div>
                        <img
                          src={adForm.imageUrl}
                          alt="Reklam Görseli Önizleme"
                          className="max-h-40 max-w-xs object-cover rounded-lg border border-[var(--outline-variant)] shadow-sm"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-xl text-xs text-amber-800 dark:text-amber-400 font-medium">
                ℹ️ Devam ettiğinizde <b>Iyzico Güvenli Ödeme Sayfasına</b> yönlendirileceksiniz. Kredi kartı ile ödemenizi tamamladıktan sonra reklamınız hızlıca onaylanıp yayına alınacaktır. Hedef gösterime ulaşınca size mail olarak bir rapor sunulacaktır.
              </div>

              <div className="flex items-center gap-3">
                <button type="submit" disabled={loading || uploadingImage} className="btn bg-emerald-600 hover:bg-emerald-700 text-white font-bold w-full">
                  {loading ? "İşleniyor..." : "Iyzico ile Ödeme Yap ve Gönder"}
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
