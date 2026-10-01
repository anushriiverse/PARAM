import React from 'react';
import { AppLanguage, AppScreen } from '../types';
import { WHEAT_FIELD_IMAGE } from '../data/mockData';
import { playSpeech } from '../utils/audio';

interface CropDetailWheatScreenProps {
  onBack: () => void;
  onNavigate: (screen: AppScreen) => void;
  language: AppLanguage;
}

export const CropDetailWheatScreen: React.FC<CropDetailWheatScreenProps> = ({
  onBack,
  onNavigate,
  language,
}) => {
  const isMr = language === 'mr';

  const wheatStages = [
    {
      stageNumber: 1,
      nameEn: 'Germination & Crown Root Initiation (CRI)',
      nameMr: 'उगवण व मुकुट मुळे फुटणे (CRI अवस्था)',
      days: 'Day 18 - 25',
      isCompleted: false,
      isCurrent: true,
      descEn: 'Most critical stage for 1st irrigation. Crown roots anchor the plant.',
      descMr: 'पहिल्या सिंचनाची अत्यंत महत्त्वाची वेळ. मुकुट मुळे जमिनीत खोल जातात.',
    },
    {
      stageNumber: 2,
      nameEn: 'Tillering & Stem Elongation',
      nameMr: 'फुटवे व कांडी फुटणे (शाकीय वाढ)',
      days: 'Day 26 - 45',
      isCompleted: false,
      isCurrent: false,
      descEn: 'Side shoots develop. Top dressing of nitrogen fertilizer.',
      descMr: 'जोमदार फुटवे फुटतात. युरिया खताचा पहिला हप्ता देण्याची वेळ.',
    },
    {
      stageNumber: 3,
      nameEn: 'Jointing Stage',
      nameMr: 'पेरे वाढणे व गाठ तयार होणे',
      days: 'Day 46 - 65',
      isCompleted: false,
      isCurrent: false,
      descEn: 'Stem begins rapid vertical expansion. Nutrient demand peaks.',
      descMr: 'खोडाची उंची झपाट्याने वाढते आणि झाडाला अन्नाची जास्त गरज असते.',
    },
    {
      stageNumber: 4,
      nameEn: 'Booting & Flowering (Heading)',
      nameMr: 'कणीस बाहेर पडणे व फुलोरा',
      days: 'Day 66 - 85',
      isCompleted: false,
      isCurrent: false,
      descEn: 'Ear heads emerge. Moisture stress during flowering reduces yield.',
      descMr: 'कणसे बाहेर पडतात. फुलोऱ्याच्या वेळी ओलावा असणे अत्यंत आवश्यक आहे.',
    },
    {
      stageNumber: 5,
      nameEn: 'Milking & Dough Stage',
      nameMr: 'दुधाळ व टणक दाणे भरणे',
      days: 'Day 86 - 105',
      isCompleted: false,
      isCurrent: false,
      descEn: 'Kernels fill with starch. Guard against terminal heat stress.',
      descMr: 'दाण्यांमध्ये पिष्टमय घटक भरतात. उष्ण वाऱ्यांपासून पिकाचे रक्षण करा.',
    },
    {
      stageNumber: 6,
      nameEn: 'Maturity & Harvesting',
      nameMr: 'पक्वता व काढणी',
      days: 'Day 106 - 120',
      isCompleted: false,
      isCurrent: false,
      descEn: 'Grain moisture drops below 14%. Harvest with thresher/combine.',
      descMr: 'दाण्यातील ओलावा १४% पेक्षा कमी झाल्यावर काढणी करावी.',
    },
  ];

  const handleAudioGuide = () => {
    if (isMr) {
      playSpeech(
        'लोकवन गहू पिकासाठी पेरणीनंतर २१ व्या दिवशी मुकुट मुळे फुटण्याच्या वेळी पहिले पाणी देणे अत्यंत महत्त्वाचे आहे.',
        'mr'
      );
    } else {
      playSpeech(
        'Wheat Lokwan critical stage is Crown Root Initiation at Day 21. Ensure first irrigation is applied precisely on time.',
        'en'
      );
    }
  };

  return (
    <div className="relative w-full min-h-screen bg-surface flex flex-col justify-between overflow-x-hidden text-on-surface">
      {/* Top Header */}
      <header className="fixed top-0 inset-x-0 z-40 bg-surface/90 backdrop-blur-xl border-b border-outline-variant/30 shadow-xs pt-safe">
        <div className="h-16 px-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <button
              onClick={onBack}
              aria-label="Go Back"
              className="w-10 h-10 rounded-full flex items-center justify-center text-primary hover:bg-surface-container transition-colors active:scale-95"
            >
              <span className="material-symbols-outlined text-[24px]">arrow_back</span>
            </button>
            <div>
              <h1 className="font-headline-sm text-headline-sm font-bold text-primary">
                {isMr ? 'गहू (लोकवन) वाढ वेळापत्रक' : 'Wheat Growth Timeline'}
              </h1>
              <span className="text-[11px] text-on-surface-variant">
                {isMr ? 'प्लॉट २ • १.५ एकर (रब्बी हंगाम)' : 'Plot 2 • 1.5 Acres (Rabi Season)'}
              </span>
            </div>
          </div>

          <button
            onClick={handleAudioGuide}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed-variant text-xs font-bold shadow-xs active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[16px]">volume_up</span>
            <span>{isMr ? 'ऐका' : 'Listen'}</span>
          </button>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 px-5 pt-20 pb-36 space-y-4">
        {/* Banner Hero */}
        <section className="relative rounded-3xl overflow-hidden shadow-md h-44 bg-surface-container">
          <img
            src={WHEAT_FIELD_IMAGE}
            alt="Wheat Field"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent"></div>

          <div className="absolute top-3 left-3 flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-secondary text-white text-xs font-bold shadow-sm">
              {isMr ? 'रब्बी हंगाम २०२६' : 'Rabi Season 2026'}
            </span>
          </div>

          <div className="absolute bottom-3.5 left-3.5 right-3.5 flex items-end justify-between text-white">
            <div>
              <h2 className="text-xl font-extrabold drop-shadow">
                {isMr ? 'गहू (लोकवन वाण HD-2189)' : 'Wheat (Lokwan HD-2189)'}
              </h2>
              <p className="text-xs text-surface-bright/90">
                {isMr ? 'पेरणी: १२ नोव्हेंबर २०२६ • दिवस २१ (CRI अवस्था)' : 'Sown: 12 Nov 2026 • Day 21 (CRI Stage)'}
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-xl bg-secondary-fixed text-primary font-bold text-xs">
              18% Progress
            </span>
          </div>
        </section>

        {/* Current Stage Deep Dive Action Card */}
        <section className="rounded-3xl p-5 bg-gradient-to-br from-primary-container to-primary text-on-primary shadow-lg border border-primary-fixed/30 flex flex-col gap-3.5">
          <div className="flex items-center justify-between">
            <span className="px-3 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed text-xs font-bold uppercase tracking-wider">
              {isMr ? 'महत्त्वाचा टप्पा: CRI (दिवस २१)' : 'CRITICAL STAGE: CRI (DAY 21)'}
            </span>
            <span className="text-xs text-surface-bright/80 font-medium">
              {isMr ? 'पहिले सिंचन आवश्यक' : '1st Irrigation Mandatory'}
            </span>
          </div>

          <div>
            <h3 className="text-lg font-bold text-white">
              {isMr ? 'मुकुट मुळे फुटण्याची वेळ (Crown Root Initiation)' : 'Crown Root Initiation (CRI) Milestone'}
            </h3>
            <p className="text-xs text-surface-bright/90 mt-1 leading-relaxed">
              {isMr
                ? 'पेरणीनंतर १८ ते २१ दिवसांनी मुकुट मुळे फुटतात. या काळात पाणी न दिल्यास उत्पादनात २५ ते ३०% घट होऊ शकते. त्वरित हलके पाणी द्यावे.'
                : 'Delaying irrigation at CRI stage reduces tiller count drastically. Apply light irrigation immediately followed by 30 kg/acre Urea.'}
            </p>
          </div>

          {/* Quick Direct Actions */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/15">
            <button
              onClick={() => onNavigate('advisory_irrigation')}
              className="p-2.5 rounded-xl bg-white/15 hover:bg-white/25 transition-colors flex items-center gap-2 text-xs font-bold text-white"
            >
              <span className="material-symbols-outlined text-[18px] text-tertiary-fixed-dim">
                water_drop
              </span>
              <span>{isMr ? 'सिंचन वेळापत्रक' : 'Irrigation Plan'}</span>
            </button>

            <button
              onClick={() => onNavigate('advisory_fertilizer')}
              className="p-2.5 rounded-xl bg-white/15 hover:bg-white/25 transition-colors flex items-center gap-2 text-xs font-bold text-white"
            >
              <span className="material-symbols-outlined text-[18px] text-secondary-fixed">
                science
              </span>
              <span>{isMr ? 'खताचा डोस' : 'Nutrient Dose'}</span>
            </button>
          </div>
        </section>

        {/* Growth Stages Timeline */}
        <section className="space-y-3 pt-1">
          <div className="flex items-center justify-between">
            <h3 className="font-headline-sm text-headline-sm text-primary">
              {isMr ? 'गहू वाढ जीवनचक्र टप्पे' : 'Wheat Growth Stages Timeline'}
            </h3>
            <span className="text-xs text-secondary font-bold">115-125 Days Total</span>
          </div>

          <div className="space-y-3">
            {wheatStages.map((stage) => (
              <div
                key={stage.stageNumber}
                className={`p-4 rounded-2xl flex items-start gap-3.5 transition-all ${
                  stage.isCurrent
                    ? 'bg-primary-container text-on-primary shadow-md ring-2 ring-secondary'
                    : 'bg-surface-container-lowest border border-outline-variant/30 text-on-surface opacity-85'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold text-xs ${
                    stage.isCurrent
                      ? 'bg-secondary-fixed text-primary'
                      : 'bg-surface-container text-on-surface-variant'
                  }`}
                >
                  {stage.stageNumber}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <h4
                      className={`text-xs font-bold truncate ${
                        stage.isCurrent ? 'text-white' : 'text-primary'
                      }`}
                    >
                      {isMr ? stage.nameMr : stage.nameEn}
                    </h4>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        stage.isCurrent
                          ? 'bg-secondary-fixed text-primary'
                          : 'bg-surface-container text-on-surface-variant'
                      }`}
                    >
                      {stage.days}
                    </span>
                  </div>
                  <p
                    className={`text-[11px] mt-1 leading-relaxed ${
                      stage.isCurrent ? 'text-surface-bright/90' : 'text-on-surface-variant'
                    }`}
                  >
                    {isMr ? stage.descMr : stage.descEn}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Sticky Bottom Bar */}
      <footer className="fixed bottom-0 inset-x-0 p-5 bg-surface/95 backdrop-blur-md border-t border-outline-variant/30 z-40 max-w-md mx-auto flex gap-3">
        <button
          onClick={() => onNavigate('advisory')}
          className="flex-1 h-14 rounded-2xl bg-primary-container text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md active:scale-[0.98] transition-all cursor-pointer"
        >
          <span>{isMr ? 'सर्व सल्ला केंद्र पहा' : 'Go to Advisory Hub'}</span>
          <span className="material-symbols-outlined text-[20px]">hub</span>
        </button>
      </footer>
    </div>
  );
};
