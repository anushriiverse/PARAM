import React from 'react';
import { AppLanguage, AppScreen, CropItem } from '../types';
import { Header } from '../components/Header';
import { BottomNav } from '../components/BottomNav';
import { playSpeech } from '../utils/audio';
import { useAgromet } from '../context/AgrometContext';

interface MyCropsScreenProps {
  crops: CropItem[];
  onOpenCropDetail: (cropId: string) => void;
  onOpenAddCrop: () => void;
  onNavigate: (screen: AppScreen) => void;
  language: AppLanguage;
  onToggleLanguage: () => void;
  onOpenProfile: () => void;
}

export const MyCropsScreen: React.FC<MyCropsScreenProps> = ({
  crops,
  onOpenCropDetail,
  onOpenAddCrop,
  onNavigate,
  language,
  onToggleLanguage,
  onOpenProfile,
}) => {
  const { prediction } = useAgromet();
  const isMr = language === 'mr';

  const handleAudioSummary = () => {
    if (isMr) {
      playSpeech(
        `तुमच्याकडे ${crops.length} सक्रिय नोंदणीकृत पिके आहेत: भात आणि गहू. भात सध्या फुटवे फुटण्याच्या अवस्थेत आहे.`,
        'mr'
      );
    } else {
      playSpeech(
        `You have ${crops.length} active registered crops: Rice and Wheat. Rice is currently in vegetative tillering stage.`,
        'en'
      );
    }
  };

  return (
    <div className="relative w-full min-h-screen bg-surface flex flex-col justify-between overflow-x-hidden text-on-surface">
      {/* Header */}
      <Header
        title={isMr ? 'माझी पिके (My Crops)' : 'My Crops'}
        subtitle={prediction ? `${prediction.name}, ${prediction.state}` : 'Sajani, MH'}
        badge={`${crops.length} Active`}
        language={language}
        onToggleLanguage={onToggleLanguage}
        onOpenProfile={onOpenProfile}
        onOpenNotifications={() => onNavigate('alerts')}
      />

      {/* Main Container */}
      <main className="flex-1 w-full pt-16 pb-28 px-5 space-y-4">
        {/* Top Action Bar */}
        <div className="flex items-center justify-between pt-3">
          <div>
            <h1 className="font-headline-sm text-headline-sm font-bold text-primary">
              {isMr ? 'नोंदवलेली पिके' : 'Monitored Plots'}
            </h1>
            <p className="text-xs text-on-surface-variant">
              {isMr ? 'वाढीचा टप्पा व सल्ला तपासा' : 'Growth timeline, health & stages'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleAudioSummary}
              className="w-9 h-9 rounded-full bg-tertiary-fixed text-on-tertiary-fixed-variant flex items-center justify-center shadow-xs active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">volume_up</span>
            </button>

            <button
              onClick={onOpenAddCrop}
              className="px-3.5 py-2 rounded-xl bg-primary-container hover:bg-primary text-on-primary text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-[16px]">add_circle</span>
              <span>{isMr ? 'पीक जोडा' : 'Add Crop'}</span>
            </button>
          </div>
        </div>

        {/* Crops List */}
        <div className="flex flex-col gap-4">
          {crops.map((crop) => {
            const isRice = crop.id.toLowerCase().includes('rice');
            return (
              <div
                key={crop.id}
                className="rounded-3xl overflow-hidden bg-surface-container-lowest border border-outline-variant/30 shadow-sm flex flex-col transition-all hover:border-secondary/50"
              >
                {/* Crop Card Image Banner */}
                <div className="relative w-full h-36 bg-surface-container overflow-hidden">
                  <img
                    src={crop.imageUrl}
                    alt={crop.nameEn}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>

                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full bg-secondary text-white text-[11px] font-bold shadow-xs">
                      {isMr ? crop.statusBadgeMr : crop.statusBadgeEn}
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-black/55 backdrop-blur-md text-white text-[11px] font-semibold border border-white/20">
                      {crop.acres} {isMr ? 'एकर' : 'Acres'}
                    </span>
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between text-white">
                    <div>
                      <h3 className="font-headline-sm text-headline-sm font-extrabold drop-shadow">
                        {isMr ? crop.nameMr : crop.nameEn}
                      </h3>
                      <p className="text-xs text-surface-bright/90 font-medium">
                        {isMr ? crop.plotNameMr : crop.plotNameEn}
                      </p>
                    </div>
                    <span className="text-xs font-bold text-secondary-fixed bg-black/60 px-2.5 py-1 rounded-lg backdrop-blur-sm border border-white/20">
                      {isMr ? `दिवस ${crop.currentDay}/${crop.totalDays}` : `Day ${crop.currentDay}/${crop.totalDays}`}
                    </span>
                  </div>
                </div>

                {/* Crop Stage & Timeline Progress */}
                <div className="p-4 flex flex-col gap-3">
                  {/* Stage Progress Bar */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-primary flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px] text-secondary">
                          potted_plant
                        </span>
                        <span>{isMr ? crop.stageMr : crop.stageEn}</span>
                      </span>
                      <span className="font-bold text-secondary">{crop.stageProgress}%</span>
                    </div>

                    <div className="w-full h-2.5 rounded-full bg-surface-container overflow-hidden">
                      <div
                        className="h-full rounded-full bg-secondary transition-all duration-500"
                        style={{ width: `${crop.stageProgress}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Sowing Date & Advisory Info */}
                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-outline-variant/20 text-xs">
                    <div>
                      <span className="text-[10px] text-on-surface-variant uppercase font-bold block">
                        {isMr ? 'पेरणीची तारीख' : 'Sowing Date'}
                      </span>
                      <span className="font-semibold text-primary">{crop.sowingDate}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-on-surface-variant uppercase font-bold block">
                        {isMr ? 'सल्ला स्थिती' : 'Advisory Status'}
                      </span>
                      <span className="font-semibold text-secondary flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-secondary"></span>
                        <span>{isMr ? 'सक्रिय मार्गदर्शन' : 'Live Guidance'}</span>
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 pt-2 border-t border-outline-variant/20">
                    <button
                      onClick={() => onOpenCropDetail(crop.id)}
                      className="flex-1 h-11 rounded-xl bg-primary-container hover:bg-primary text-on-primary font-label-md text-label-md font-bold flex items-center justify-center gap-1.5 shadow-xs active:scale-[0.98] transition-all cursor-pointer"
                    >
                      <span>
                        {isMr
                          ? 'वाढ वेळापत्रक व सल्ला पहा'
                          : isRice
                          ? 'Rice Growth Timeline'
                          : 'Wheat Growth Timeline'}
                      </span>
                      <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                    </button>

                    <button
                      onClick={onOpenAddCrop}
                      className="w-11 h-11 rounded-xl bg-surface-container hover:bg-surface-container-high text-primary flex items-center justify-center transition-colors active:scale-95"
                      title={isMr ? 'माहिती बदला' : 'Edit Crop'}
                    >
                      <span className="material-symbols-outlined text-[20px]">edit</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Add Another Crop Callout Card */}
        <section
          onClick={onOpenAddCrop}
          className="p-4 rounded-3xl border-2 border-dashed border-outline-variant/60 hover:border-secondary/60 bg-surface-container-lowest hover:bg-surface-container-low transition-all cursor-pointer flex items-center gap-3.5"
        >
          <div className="w-12 h-12 rounded-2xl bg-secondary-container/60 text-secondary flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[24px]">add</span>
          </div>
          <div>
            <h4 className="font-title-md text-title-md font-bold text-primary">
              {isMr ? '+ दुसरे पीक जोडा (Add Another Crop)' : '+ Add Another Crop'}
            </h4>
            <p className="text-xs text-on-surface-variant">
              {isMr
                ? 'ऊस, सोयाबीन किंवा कापूस पिकाचे व्यवस्थापन जोडा'
                : 'Monitor Sugarcane, Soybean, Cotton or groundnut plots'}
            </p>
          </div>
        </section>
      </main>

      {/* Bottom Navigation */}
      <BottomNav currentScreen="crops" onNavigate={onNavigate} language={language} alertCount={3} />
    </div>
  );
};
