import { prisma } from "@/lib/prisma";
import SettingsForm from "@/components/admin/SettingsForm";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const settings = await prisma.systemSetting.findMany();
  
  // Varsayılan ayarları bir objede toplayalım
  const settingsMap = settings.reduce((acc, curr) => {
    acc[curr.key] = curr.value;
    return acc;
  }, {} as Record<string, string>);

  const dailyAdLimit = settingsMap["DAILY_AD_LIMIT"] || "5";

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Sistem Ayarları</h1>
      
      <div className="grid md:grid-cols-2 gap-8 items-start">
        <div className="space-y-6">
          <h2 className="text-xl font-semibold mb-4 border-b pb-2">Genel Ayarlar</h2>
          <SettingsForm 
            settingKey="DAILY_AD_LIMIT"
            initialValue={dailyAdLimit}
            label="Günlük Reklam İzleme Limiti"
            description="Bir kullanıcının günde en fazla kaç ödüllü reklam izleyebileceğini belirler."
          />
          
          <SettingsForm 
            settingKey="EXPERT_ANSWER_POINT_VALUE"
            initialValue={settingsMap["EXPERT_ANSWER_POINT_VALUE"] || "10"}
            label="Uzman Onaylı Cevap Puanı"
            description="Danışman/Uzmanların yazdığı onaylı cevap başına kazanacağı puan miktarını belirler (Varsayılan: 10)."
          />

          <SettingsForm 
            settingKey="EXPERT_POINT_TL_VALUE"
            initialValue={settingsMap["EXPERT_POINT_TL_VALUE"] || "2.0"}
            label="Uzman Puan / TL Çarpanı"
            description="1 uzman puanının kaç TL'ye denk geldiğini belirler. Değiştiğinde tüm uzmanlara bildirim gönderilir."
          />
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-semibold mb-4 border-b pb-2">Satış ve Premium Ayarları</h2>
          
          <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100 space-y-4">
            <h3 className="font-medium text-blue-900">Premium 1 Aylık</h3>
            <SettingsForm settingKey="PREMIUM_1_MONTH_PRICE" initialValue={settingsMap["PREMIUM_1_MONTH_PRICE"] || "379"} label="Fiyat (TL)" />
            <SettingsForm settingKey="PREMIUM_1_MONTH_LINK" initialValue={settingsMap["PREMIUM_1_MONTH_LINK"] || ""} label="Iyzico Ödeme Linki" />
          </div>

          <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100 space-y-4">
            <h3 className="font-medium text-blue-900">Premium 6 Aylık</h3>
            <SettingsForm settingKey="PREMIUM_6_MONTHS_PRICE" initialValue={settingsMap["PREMIUM_6_MONTHS_PRICE"] || "1000"} label="Fiyat (TL)" />
            <SettingsForm settingKey="PREMIUM_6_MONTHS_LINK" initialValue={settingsMap["PREMIUM_6_MONTHS_LINK"] || ""} label="Iyzico Ödeme Linki" />
          </div>

          <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100 space-y-4">
            <h3 className="font-medium text-blue-900">Premium 12 Aylık</h3>
            <SettingsForm settingKey="PREMIUM_12_MONTHS_PRICE" initialValue={settingsMap["PREMIUM_12_MONTHS_PRICE"] || "1500"} label="Fiyat (TL)" />
            <SettingsForm settingKey="PREMIUM_12_MONTHS_LINK" initialValue={settingsMap["PREMIUM_12_MONTHS_LINK"] || ""} label="Iyzico Ödeme Linki" />
          </div>

          <div className="bg-green-50/50 p-4 rounded-lg border border-green-100 space-y-4">
            <h3 className="font-medium text-green-900">Kredi Satın Alma</h3>
            <SettingsForm settingKey="CREDIT_PACKAGE_AMOUNT" initialValue={settingsMap["CREDIT_PACKAGE_AMOUNT"] || "10"} label="Kredi Miktarı" />
            <SettingsForm settingKey="CREDIT_PACKAGE_PRICE" initialValue={settingsMap["CREDIT_PACKAGE_PRICE"] || "89"} label="Fiyat (TL)" />
            <SettingsForm settingKey="CREDIT_PACKAGE_LINK" initialValue={settingsMap["CREDIT_PACKAGE_LINK"] || ""} label="Iyzico Ödeme Linki" />
          </div>

          {/* Reklam ve Sponsorluk Paketleri */}
          <div className="bg-amber-50/50 p-4 rounded-lg border border-amber-200/80 space-y-4">
            <h3 className="font-bold text-amber-900 flex items-center gap-2">
              <span>📢 Reklam & Sponsorluk Paket Ayarları</span>
            </h3>
            
            <div className="border-t border-amber-200/60 pt-3 space-y-3">
              <h4 className="text-xs font-bold text-amber-800 uppercase">1. Başlangıç Paketi (10.000 Gösterim)</h4>
              <SettingsForm settingKey="AD_PACKAGE_10K_PRICE" initialValue={settingsMap["AD_PACKAGE_10K_PRICE"] || "3000"} label="Fiyat (TL)" />
              <SettingsForm settingKey="AD_PACKAGE_10K_LINK" initialValue={settingsMap["AD_PACKAGE_10K_LINK"] || ""} label="Iyzico Ödeme Linki" />
            </div>

            <div className="border-t border-amber-200/60 pt-3 space-y-3">
              <h4 className="text-xs font-bold text-amber-800 uppercase">2. Standart Paket (50.000 Gösterim)</h4>
              <SettingsForm settingKey="AD_PACKAGE_50K_PRICE" initialValue={settingsMap["AD_PACKAGE_50K_PRICE"] || "12000"} label="Fiyat (TL)" />
              <SettingsForm settingKey="AD_PACKAGE_50K_LINK" initialValue={settingsMap["AD_PACKAGE_50K_LINK"] || ""} label="Iyzico Ödeme Linki" />
            </div>

            <div className="border-t border-amber-200/60 pt-3 space-y-3">
              <h4 className="text-xs font-bold text-amber-800 uppercase">3. Pro Paket (100.000 Gösterim)</h4>
              <SettingsForm settingKey="AD_PACKAGE_100K_PRICE" initialValue={settingsMap["AD_PACKAGE_100K_PRICE"] || "20000"} label="Fiyat (TL)" />
              <SettingsForm settingKey="AD_PACKAGE_100K_LINK" initialValue={settingsMap["AD_PACKAGE_100K_LINK"] || ""} label="Iyzico Ödeme Linki" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
