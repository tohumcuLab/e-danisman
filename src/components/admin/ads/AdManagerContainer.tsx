"use client";

import { useState } from "react";
import AdDashboard from "./AdDashboard";
import AdTabs, { AdTabType } from "./AdTabs";
import AdList, { AdItem } from "./AdList";
import AdFormModal, { AdData } from "./AdFormModal";
import AdPackageManagement from "./AdPackageManagement";

interface AdManagerContainerProps {
  initialAds: AdItem[];
}

export default function AdManagerContainer({ initialAds }: AdManagerContainerProps) {
  const [activeTab, setActiveTab] = useState<AdTabType>("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAdForEdit, setSelectedAdForEdit] = useState<AdData | null>(null);

  const googleCount = initialAds.filter((a) => a.type === "GOOGLE").length;
  const manualCount = initialAds.filter(
    (a) => a.type === "MANUAL" || a.type === "FEED" || a.type === "REWARD_VIDEO"
  ).length;
  const allCount = initialAds.length;

  const filteredAds = initialAds.filter((ad) => {
    if (activeTab === "GOOGLE") return ad.type === "GOOGLE";
    if (activeTab === "MANUAL")
      return ad.type === "MANUAL" || ad.type === "FEED" || ad.type === "REWARD_VIDEO";
    return true;
  });

  const handleOpenCreateModal = () => {
    setSelectedAdForEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (ad: AdItem) => {
    setSelectedAdForEdit({
      id: ad.id,
      title: ad.title,
      type: ad.type,
      placement: ad.placement,
      networkCode: ad.networkCode,
      imageUrl: ad.imageUrl,
      videoUrl: ad.videoUrl,
      destinationUrl: ad.destinationUrl,
      startDate: ad.startDate,
      endDate: ad.endDate,
      impressionLimit: ad.impressionLimit,
      isActive: ad.isActive,
    });
    setIsModalOpen(true);
  };

  return (
    <div>
      {/* Dashboard KPI Header */}
      <AdDashboard ads={initialAds} />

      {/* Main Bar with Tabs & Create Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <AdTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          counts={{
            all: allCount,
            google: googleCount,
            manual: manualCount,
          }}
        />

        {activeTab !== "PACKAGES" && (
          <button
            onClick={handleOpenCreateModal}
            className="btn btn-primary text-sm font-semibold flex items-center gap-2 self-start sm:self-auto mb-4 sm:mb-0 shadow-md"
          >
            <span>➕ Yeni Reklam Ekle</span>
          </button>
        )}
      </div>

      {activeTab === "PACKAGES" ? (
        <AdPackageManagement />
      ) : (
        <>
          {/* Ads List */}
          <AdList ads={filteredAds} onEdit={handleOpenEditModal} />

          {/* Form Modal for Create/Edit */}
          <AdFormModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            initialData={selectedAdForEdit}
          />
        </>
      )}
    </div>
  );
}
