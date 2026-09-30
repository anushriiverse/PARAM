import React from 'react';
import { AppLanguage, AppScreen, CropItem } from '../types';
import { Header } from '../components/Header';
import { BottomNav } from '../components/BottomNav';
import { playSpeech } from '../utils/audio';

import { useAgromet } from '../context/AgrometContext';

interface AdvisoryHubScreenProps {
  activeCrop: CropItem;
  onOpenCropSelector: () => void;
  onNavigate: (screen: AppScreen) => void;
  language: AppLanguage;
  onToggleLanguage: () => void;
  onOpenProfile: () => void;
}

export const AdvisoryHubScreen: React.FC<AdvisoryHubScreenProps> = ({
  activeCrop,
  onOpenCropSelector,
  onNavigate,
  language,
  onToggleLanguage,
  onOpenProfile,
}) => {
  const { prediction } = useAgromet();
  const isMr = language === 'mr';

  const handleAudioHub = () => {
    if (isMr) {
      playSpeech(
        `${activeCrop.nameMr} पिकासाठी मुख्य सल्ला: दुपारपर्यंत खत द्यावे, उद्या पावसाची शक्यता असल्याने आज पाणी देणे टाळावे, आणि करपा रोगाचा संभाव्य धोका लक्षात घ्यावा.`,
        'mr'
      );
    } else {
      playSpeech(
        `Advisory Hub for ${activeCrop.nameEn}: Apply urea before 2 PM, withhold irrigation ahead of tomorrow's rain, and monitor blast risk closely.`,
        'en'
      );
    }
  };

  return (
    <div className="relative w-full min-h-screen bg-surface flex flex-col justify-between overflow-x-hidden text-on-surface">
      {/* Header */}
      <Header
        title={isMr ? 'कृषी सल्ला केंद्र (Advisory Hub)' : 'Advisory Hub'}
        subtitle={prediction ? `${prediction.name}, ${prediction.state}` : 'Sajani, MH'}
        badge="Live AI"
        language={language}
        onToggleLanguage={onToggleLanguage}
        onOpenProfile={onOpenProfile}
        onOpenNotifications={() => onNavigate('alerts')}
      />

      {/* Main Container */}
      <main className="flex-1 w-full pt-16 pb-28 px-5 space-y-4">
        {/* Top Active Crop Switcher Bar */}
        <div className="pt-3 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-secondary">
              {isMr ? 'सध्या निवडलेले पीक' : 'Active Monitored Crop'}
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <h1 className="font-headline-sm text-headline-sm font-extrabold text-primary truncate max-w-[200px]">
                {isMr ? activeCrop.nameMr : activeCrop.nameEn}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleAudioHub}
              className="w-9 h-9 rounded-full bg-tertiary-fixed text-on-tertiary-fixed-variant flex items-center justify-center shadow-xs active:scale-95 transition-all"
              title={isMr ? 'सल्ला ऐका' : 'Listen'}
            >
              <span className="material-symbols-outlined text-[18px]">volume_up</span>
            </button>

            {/* Crop Selector Switcher Trigger (App Flow 3.7.3 / 4.7.3) */}
            <button
              onClick={onOpenCropSelector}
              className="px-3 py-1.5 rounded-xl bg-primary-container text-on-primary text-xs font-bold flex items-center gap-1 shadow-xs hover:bg-primary active:scale-95 transition-all cursor-pointer"
            >
              <span>{isMr ? 'पीक बदला' : 'Switch'}</span>
              <span className="material-symbols-outlined text-[16px]">swap_vert</span>
            </button>
          </div>
        </div>

        {/* Active Crop Quick Status Pill Card */}
        <section className="p-3.5 rounded-2xl bg-surface-container-low border border-outline-variant/30 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl overflow-hidden bg-surface-container shrink-0">
              <img
                src={activeCrop.imageUrl}
                alt={activeCrop.nameEn}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <span className="text-xs font-bold text-primary block">
                {isMr ? activeCrop.stageMr : activeCrop.stageEn}
              </span>
              <p className="text-[11px] text-on-surface-variant">
                {isMr
                  ? `दिवस ${activeCrop.currentDay} • पेरणी: ${activeCrop.sowingDate}`
                  : `Day ${activeCrop.currentDay} of ${activeCrop.totalDays} • Sown: ${activeCrop.sowingDate}`}
              </p>
            </div>
          </div>

          <button
            onClick={() =>
              activeCrop.id.includes('wheat')
                ? onNavigate('crop_detail_wheat')
                : onNavigate('crop_detail_rice')
            }
            className="text-xs font-bold text-secondary flex items-center gap-0.5 hover:underline"
          >
            <span>{isMr ? 'वेळापत्रक' : 'Timeline'}</span>
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          </button>
        </section>

        {/* 1. FERTILIZER ADVISORY CARD */}
        <section className="rounded-3xl p-4 bg-surface-container-lowest border border-outline-variant/30 shadow-xs flex flex-col gap-3 transition-all hover:border-secondary/40">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-secondary-container/60 text-secondary flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[22px]">science</span>
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-secondary">
                  {isMr ? 'रासायनिक व सेंद्रिय खते' : 'Nutrient & Fertilizer Management'}
                </span>
                <h3 className="font-title-md text-title-md font-bold text-primary">
                  {isMr ? 'दुसरा युरिया हप्ता (३० कि/एकर)' : 'Urea Split Top Dressing (30 kg/ac)'}
                </h3>
              </div>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-secondary text-white font-bold text-[10px]">
              {isMr ? 'येत्या ३ दिवसांत' : 'Due in 3d'}
            </span>
          </div>

          <p className="text-xs text-on-surface-variant leading-relaxed">
            {isMr
              ? 'शाकीय वाढ आणि जोमदार फुटव्यांसाठी पेरणीनंतर २५ ते ३० दिवसांच्या दरम्यान युरिया खताचा दुसरा हप्ता दुपारपूर्वी द्यावा.'
              : 'Apply 30 kg/acre Urea split dose before 2:00 PM today. Favorable soil moisture ensures rapid root absorption.'}
          </p>

          <div className="flex items-center justify-between pt-1 border-t border-outline-variant/20">
            <span className="text-[11px] font-semibold text-primary">
              {isMr ? 'NPK प्रमाण: १२०:६०:४०' : 'Target NPK: 120:60:40 kg/ha'}
            </span>
            <button
              onClick={() => onNavigate('advisory_fertilizer')}
              className="inline-flex items-center gap-1 text-xs font-bold text-secondary hover:underline"
            >
              <span>{isMr ? 'सविस्तर खत योजना पहा' : 'View Full Fertilizer Plan'}</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>
        </section>

        {/* 2. IRRIGATION ADVISORY CARD */}
        <section className="rounded-3xl p-4 bg-surface-container-lowest border border-outline-variant/30 shadow-xs flex flex-col gap-3 transition-all hover:border-secondary/40">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-tertiary-fixed text-on-tertiary-fixed-variant flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[22px]">water_drop</span>
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-on-tertiary-container">
                  {isMr ? 'सिंचन व पाणी व्यवस्थापन' : 'Water & Irrigation Advisory'}
                </span>
                <h3 className="font-title-md text-title-md font-bold text-primary">
                  {isMr ? 'आज सिंचन थांबवा (Hold Irrigation)' : 'Hold Irrigation (Rain Imminent)'}
                </h3>
              </div>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed-variant font-bold text-[10px]">
              {isMr ? 'पाऊस शक्यता ६५%' : 'Rain 65%'}
            </span>
          </div>

          <p className="text-xs text-on-surface-variant leading-relaxed">
            {isMr
              ? 'उद्या दुपारी राधानगरीमध्ये वादळी पावसाचा अंदाज आहे. जमिनीतील ओलावा ७२% पुरेसा असल्याने आज पाणी देऊ नये.'
              : 'Soil moisture is optimal at 72%. With tomorrow afternoon thunderstorms expected, avoid irrigation to prevent waterlogging.'}
          </p>

          <div className="flex items-center justify-between pt-1 border-t border-outline-variant/20">
            <span className="text-[11px] font-semibold text-on-tertiary-container">
              {isMr ? 'जमीन ओलावा: ७२% (उत्तम)' : 'Current Moisture: 72% (Adequate)'}
            </span>
            <button
              onClick={() => onNavigate('advisory_irrigation')}
              className="inline-flex items-center gap-1 text-xs font-bold text-secondary hover:underline"
            >
              <span>{isMr ? 'सिंचन सल्ला पहा' : 'View Irrigation Advisory'}</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>
        </section>

        {/* 3. PEST & DISEASE WARNING CARD */}
        <section className="rounded-3xl p-4 bg-error-container/50 border border-error/30 shadow-xs flex flex-col gap-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-error text-white flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[22px]">pest_control</span>
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-error">
                  {isMr ? 'रोग व कीड सावधानता' : 'Disease Conducive Risk Alert'}
                </span>
                <h3 className="font-title-md text-title-md font-bold text-error">
                  {isMr ? 'करपा व खोडकिडा संभाव्य धोका' : 'Rice Blast & Stem Borer Conducive Risk'}
                </h3>
              </div>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-error text-white font-bold text-[10px]">
              High Risk
            </span>
          </div>

          <p className="text-xs text-on-error-container leading-relaxed">
            {isMr
              ? 'आर्द्रता ७८% आणि २४-२८°C तापमान यामुळे करपा रोगाच्या बीजाणूंचा फैलाव वेगाने होऊ शकतो. प्रतिबंधात्मक ट्रायसायक्लॅझोल फवारणीची शिफारस.'
              : 'Microclimate with 78% RH and 28°C is highly conducive for spore germination. Inspect leaf blades for elliptical eye spots.'}
          </p>

          <div className="flex items-center justify-between pt-1 border-t border-error/20">
            <span className="text-[11px] font-semibold text-error">
              {isMr ? 'इशारा पातळी: मध्यम-ते-तीव्र' : 'Severity: Moderate to High'}
            </span>
            <button
              onClick={() => onNavigate('alerts')}
              className="inline-flex items-center gap-1 text-xs font-bold text-error hover:underline"
            >
              <span>{isMr ? 'उपाय व फवारणी पहा' : 'View Disease Alert'}</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>
        </section>

        {/* 4. WEED MANAGEMENT & CULTURAL PRACTICES */}
        <section className="rounded-3xl p-4 bg-surface-container-lowest border border-outline-variant/30 shadow-xs flex flex-col gap-2.5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-surface-container text-primary flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[22px]">grass</span>
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                {isMr ? 'तण नियंत्रण' : 'Weed Management'}
              </span>
              <h3 className="font-title-md text-title-md font-bold text-primary">
                {isMr ? 'दुसरी खुरपणी / कोळपणी' : 'Second Inter-cultivation & Weeding'}
              </h3>
            </div>
          </div>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            {isMr
              ? 'फुटवे वाढीच्या काळात तण स्पर्धा रोखण्यासाठी कोनो-वीडर किंवा हाताने खुरपणी करून मुळांना हवा खेळती ठेवावी.'
              : 'Perform manual hand weeding or use cono-weeder between rows to aerate root zone before applying top dressing.'}
          </p>
        </section>
      </main>

      {/* Bottom Navigation */}
      <BottomNav currentScreen="advisory" onNavigate={onNavigate} language={language} alertCount={3} />
    </div>
  );
};
