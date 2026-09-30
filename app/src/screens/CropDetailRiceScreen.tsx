import React from 'react';
import { AppLanguage, AppScreen } from '../types';
import { RICE_FIELD_IMAGE, RICE_DISEASE_IMAGE } from '../data/mockData';
import { playSpeech } from '../utils/audio';

interface CropDetailRiceScreenProps {
  onBack: () => void;
  onNavigate: (screen: AppScreen) => void;
  language: AppLanguage;
}

export const CropDetailRiceScreen: React.FC<CropDetailRiceScreenProps> = ({
  onBack,
  onNavigate,
  language,
}) => {
  const isMr = language === 'mr';

  const stages = [
    {
      stageNumber: 1,
      nameEn: 'Transplanting & Establishment',
      nameMr: 'पुनर्लागवड व मुळे धरणे',
      days: 'Day 0 - 14',
      isCompleted: true,
      isCurrent: false,
      descEn: 'Seedlings transplanted in puddle field. Shallow water maintained.',
      descMr: 'चिखलणी केलेल्या शेतात रोपांची पुनर्लागवड पूर्ण. मुळे घट्ट रुजली.',
    },
    {
      stageNumber: 2,
      nameEn: 'Tillering & Active Vegetative',
      nameMr: 'फुटवे येणे व जोमदार शाकीय वाढ',
      days: 'Day 15 - 40 (Today: Day 28)',
      isCompleted: false,
      isCurrent: true,
      descEn: 'Peak tillering phase. Rapid canopy expansion and nutrient uptake.',
      descMr: 'जोमदार फुटवे फुटण्याचा काळ. पानांची वाढ आणि खतांची सर्वाधिक गरज.',
    },
    {
      stageNumber: 3,
      nameEn: 'Panicle Initiation & Booting',
      nameMr: 'कणीस पोटात येणे (गर्भावस्थान)',
      days: 'Day 41 - 65',
      isCompleted: false,
      isCurrent: false,
      descEn: 'Reproductive phase begins. Panicle emerges inside the sheath.',
      descMr: 'पुनरुत्पादन टप्पा सुरू. खोडामध्ये लोंबी तयार होण्याची अवस्था.',
    },
    {
      stageNumber: 4,
      nameEn: 'Flowering & Heading',
      nameMr: 'फुलोरा व लोंब्या बाहेर पडणे',
      days: 'Day 66 - 85',
      isCompleted: false,
      isCurrent: false,
      descEn: 'Full panicle emergence and pollination. Avoid water stress.',
      descMr: 'लोंब्या पूर्ण बाहेर येणे व परागीभवन. पाण्याची कमतरता अजिबात भासू नये.',
    },
    {
      stageNumber: 5,
      nameEn: 'Grain Filling & Milking',
      nameMr: 'दाणे भरणे व दुधाळ अवस्था',
      days: 'Day 86 - 105',
      isCompleted: false,
      isCurrent: false,
      descEn: 'Carbohydrate translocation into grain. Grains turn firm.',
      descMr: 'दाण्यांमध्ये दूध तयार होणे व दाणे घट्ट भरणे.',
    },
    {
      stageNumber: 6,
      nameEn: 'Maturity & Harvesting',
      nameMr: 'पक्वता व काढणी',
      days: 'Day 106 - 120',
      isCompleted: false,
      isCurrent: false,
      descEn: '85% grains turn golden yellow. Drain water 10 days before harvest.',
      descMr: '८५% दाणे पिवळे पडल्यानंतर शेतातील पाणी काढून काढणी करावी.',
    },
  ];

  const handleAudioGuide = () => {
    if (isMr) {
      playSpeech(
        'इंद्रायणी भात पीक सध्या २८ व्या दिवशी असून शाकीय वाढ व फुटवे येण्याच्या टप्प्यात आहे. युरिया खताचा दुसरा हप्ता देण्याची हीच योग्य वेळ आहे.',
        'mr'
      );
    } else {
      playSpeech(
        'Rice Indrayani is at Day 28 in Tillering and Vegetative stage. Second split dose of Urea and 2-3 cm shallow water layer is recommended.',
        'en'
      );
    }
  };

  return (
    <div className="relative w-full min-h-screen bg-surface flex flex-col justify-between overflow-x-hidden text-on-surface">
      {/* Top App Header */}
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
                {isMr ? 'भात (इंद्रायणी) वाढ वेळापत्रक' : 'Rice Growth Timeline'}
              </h1>
              <span className="text-[11px] text-on-surface-variant">
                {isMr ? 'प्लॉट १ • २.५ एकर (राधानगरी)' : 'Plot 1 • 2.5 Acres (Radhanagari)'}
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
            src={RICE_FIELD_IMAGE}
            alt="Rice Field"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent"></div>

          <div className="absolute top-3 left-3 flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-secondary text-white text-xs font-bold shadow-sm">
              {isMr ? 'सक्रिय पीक (Kharif 2026)' : 'Active Crop (Kharif 2026)'}
            </span>
          </div>

          <div className="absolute bottom-3.5 left-3.5 right-3.5 flex items-end justify-between text-white">
            <div>
              <h2 className="text-xl font-extrabold drop-shadow">
                {isMr ? 'भात (इंद्रायणी वाण)' : 'Rice (Paddy Indrayani)'}
              </h2>
              <p className="text-xs text-surface-bright/90">
                {isMr ? 'पेरणी: १५ ऑगस्ट २०२६ • आज दिवस २८' : 'Sown: 15 Aug 2026 • Today: Day 28 of 105'}
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-xl bg-secondary-fixed text-primary font-bold text-xs">
              27% Progress
            </span>
          </div>
        </section>

        {/* Current Stage Deep Dive Action Card */}
        <section className="rounded-3xl p-5 bg-gradient-to-br from-primary-container to-primary text-on-primary shadow-lg border border-primary-fixed/30 flex flex-col gap-3.5">
          <div className="flex items-center justify-between">
            <span className="px-3 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed text-xs font-bold uppercase tracking-wider">
              {isMr ? 'सध्याचा टप्पा: दिवस २८' : 'CURRENT STAGE: DAY 28'}
            </span>
            <span className="text-xs text-surface-bright/80 font-medium">
              {isMr ? 'शाकीय वाढ' : 'Active Tillering'}
            </span>
          </div>

          <div>
            <h3 className="text-lg font-bold text-white">
              {isMr ? 'फुटवे येणे व शाकीय वाढीचा काळ' : 'Active Tillering & Foliage Phase'}
            </h3>
            <p className="text-xs text-surface-bright/90 mt-1 leading-relaxed">
              {isMr
                ? 'या काळात फुटव्यांची संख्या वाढवण्यासाठी जमिनीत ओलावा आवश्यक आहे. युरिया खताचा दुसरा हप्ता (३० किलो/एकर) द्यावा.'
                : 'Maintain 2-3 cm shallow water layer. Ideal time to apply 2nd split dose of Urea (30 kg/acre) to maximize productive tillers.'}
            </p>
          </div>

          {/* Direct Advisory Quick Links */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/15">
            <button
              onClick={() => onNavigate('advisory_fertilizer')}
              className="p-2.5 rounded-xl bg-white/15 hover:bg-white/25 transition-colors flex items-center gap-2 text-xs font-bold text-white"
            >
              <span className="material-symbols-outlined text-[18px] text-secondary-fixed">
                science
              </span>
              <span>{isMr ? 'खताचा सल्ला' : 'Fertilizer Advice'}</span>
            </button>

            <button
              onClick={() => onNavigate('advisory_irrigation')}
              className="p-2.5 rounded-xl bg-white/15 hover:bg-white/25 transition-colors flex items-center gap-2 text-xs font-bold text-white"
            >
              <span className="material-symbols-outlined text-[18px] text-tertiary-fixed-dim">
                water
              </span>
              <span>{isMr ? 'पाणी व्यवस्थापन' : 'Irrigation Advice'}</span>
            </button>
          </div>
        </section>

        {/* Growth Stages Timeline */}
        <section className="space-y-3 pt-1">
          <div className="flex items-center justify-between">
            <h3 className="font-headline-sm text-headline-sm text-primary">
              {isMr ? 'संपूर्ण जीवनचक्र टप्पे (Timeline)' : 'Full Growth Stages Timeline'}
            </h3>
            <span className="text-xs text-secondary font-bold">105-120 Days Total</span>
          </div>

          <div className="space-y-3">
            {stages.map((stage) => {
              return (
                <div
                  key={stage.stageNumber}
                  className={`p-4 rounded-2xl flex items-start gap-3.5 transition-all ${
                    stage.isCurrent
                      ? 'bg-primary-container text-on-primary shadow-md ring-2 ring-secondary'
                      : stage.isCompleted
                      ? 'bg-surface-container-lowest border border-secondary/40 text-on-surface'
                      : 'bg-surface-container-lowest border border-outline-variant/30 text-on-surface opacity-85'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold text-xs ${
                      stage.isCurrent
                        ? 'bg-secondary-fixed text-primary'
                        : stage.isCompleted
                        ? 'bg-secondary text-white'
                        : 'bg-surface-container text-on-surface-variant'
                    }`}
                  >
                    {stage.isCompleted ? (
                      <span className="material-symbols-outlined text-[16px]">check</span>
                    ) : (
                      stage.stageNumber
                    )}
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
                            : stage.isCompleted
                            ? 'bg-secondary-container text-on-secondary-container'
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
              );
            })}
          </div>
        </section>

        {/* Leaf Rust Risk Callout */}
        <section className="p-4 rounded-2xl bg-surface-container-lowest border border-error/30 shadow-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-12 h-12 rounded-xl overflow-hidden bg-surface-container shrink-0">
              <img
                src={RICE_DISEASE_IMAGE}
                alt="Rice blast"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-bold text-error block">
                {isMr ? 'रोग धोका सूचना' : 'Disease Conducive Alert'}
              </span>
              <h4 className="text-xs font-bold text-primary truncate">
                {isMr ? 'भात करपा रोग (Rice Blast Risk)' : 'Blast & Sheath Blight Risk'}
              </h4>
              <p className="text-[11px] text-on-surface-variant truncate">
                {isMr ? 'आर्द्रता ७८% - सावधगिरी बाळगा' : 'Humidity 78% creates infection risk'}
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigate('alerts')}
            className="px-3 py-1.5 rounded-xl bg-error text-white text-xs font-bold shrink-0 shadow-xs hover:bg-error/90 active:scale-95 transition-all"
          >
            {isMr ? 'उपाय पहा' : 'View Risk'}
          </button>
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
