import React from 'react';
import { AppLanguage } from '../types';
import { playSpeech } from '../utils/audio';

interface FertilizerAdvisoryScreenProps {
  onBack: () => void;
  language: AppLanguage;
}

export const FertilizerAdvisoryScreen: React.FC<FertilizerAdvisoryScreenProps> = ({
  onBack,
  language,
}) => {
  const isMr = language === 'mr';

  const handleAudio = () => {
    if (isMr) {
      playSpeech(
        'खत व्यवस्थापन सल्ला: भातासाठी युरियाचा दुसरा हप्ता ३० किलो प्रति एकर याप्रमाणे जमिनीत पुरेसा ओलावा असताना दुपारपूर्वी द्यावा.',
        'mr'
      );
    } else {
      playSpeech(
        'Fertilizer Advisory: Apply 2nd split dose of Urea at 30 kg per acre before 2 PM today in moist soil to support rapid tillering.',
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
                {isMr ? 'खत व्यवस्थापन सल्ला' : 'Fertilizer Advisory'}
              </h1>
              <span className="text-[11px] text-on-surface-variant">
                {isMr ? 'भात (इंद्रायणी) • २.५ एकर' : 'Rice (Indrayani) • 2.5 Acres'}
              </span>
            </div>
          </div>

          <button
            onClick={handleAudio}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed-variant text-xs font-bold shadow-xs active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[16px]">volume_up</span>
            <span>{isMr ? 'ऐका' : 'Audio'}</span>
          </button>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 px-5 pt-20 pb-28 space-y-4">
        {/* Stage & Target Banner */}
        <section className="p-4 rounded-3xl bg-gradient-to-br from-primary-container to-primary text-on-primary shadow-md border border-primary-fixed/30 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="px-3 py-0.5 rounded-full bg-secondary-fixed text-primary text-xs font-bold uppercase">
              {isMr ? 'सक्रिय डोस: दुसरा हप्ता' : 'ACTIVE DOSE: 2ND SPLIT'}
            </span>
            <span className="text-xs text-surface-bright/80">Day 28 of 105</span>
          </div>
          <h2 className="text-lg font-bold text-white">
            {isMr ? 'शाकीय वाढ व फुटवे अवस्था (युरिया टॉप-ड्रेसिंग)' : 'Tillering Stage (Urea Top-Dressing)'}
          </h2>
          <p className="text-xs text-surface-bright/90 leading-relaxed">
            {isMr
              ? 'फुटव्यांची संख्या वाढवण्यासाठी व पानांचा गर्द हिरवा रंग टिकवण्यासाठी युरियाचा दुसरा हप्ता त्वरित द्यावा.'
              : 'Maximize effective tillers and leaf chlorophyll. Apply nitrogenous split dose before panicle initiation.'}
          </p>
        </section>

        {/* 3-Stage Fertilizer Application Schedule */}
        <section className="space-y-3">
          <h3 className="font-headline-sm text-headline-sm text-primary">
            {isMr ? 'हप्तेनिहाय खताचे वेळापत्रक' : 'Split-Dose Application Plan'}
          </h3>

          {/* Dose 1 - Completed */}
          <div className="p-4 rounded-2xl bg-surface-container-lowest border border-secondary/40 shadow-xs flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-secondary text-white flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[16px]">check</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-primary">
                  {isMr ? '१. बेसल डोस (लागवडीच्या वेळी)' : '1. Basal Dose (At Transplanting)'}
                </h4>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-bold">
                  {isMr ? 'पूर्ण ✓' : 'Applied ✓'}
                </span>
              </div>
              <p className="text-[11px] text-on-surface-variant mt-1">
                DAP: 50 kg/ac + MOP: 25 kg/ac + Zinc Sulphate: 10 kg/ac
              </p>
            </div>
          </div>

          {/* Dose 2 - Due Now */}
          <div className="p-4 rounded-2xl bg-primary-container text-on-primary shadow-md ring-2 ring-secondary flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-secondary-fixed text-primary flex items-center justify-center shrink-0 font-bold text-xs">
              2
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-white">
                  {isMr ? '२. दुसरा हप्ता (दिवस २५ ते ३०) - आज देय' : '2. Second Split (Day 25-30) - DUE TODAY'}
                </h4>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary-fixed text-primary font-bold">
                  {isMr ? 'तातडीने द्या' : 'Action Due'}
                </span>
              </div>
              <p className="text-[11px] text-surface-bright/90 mt-1">
                <strong>Urea (युरिया): 30 kg / acre</strong> (किंवा ६० किलो प्रति हेक्टर)
              </p>
              <div className="mt-2 p-2 rounded-xl bg-white/10 text-[11px] text-surface-bright flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-secondary-fixed">
                  tips_and_updates
                </span>
                <span>
                  {isMr
                    ? 'खत दिल्यानंतर शेतात लगेच पाणी साचवू नये, फक्त हलका ओलावा असावा.'
                    : 'Apply in moist soil without deep stagnant water to prevent leaching loss.'}
                </span>
              </div>
            </div>
          </div>

          {/* Dose 3 - Upcoming */}
          <div className="p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 opacity-85 flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-surface-container text-on-surface-variant flex items-center justify-center shrink-0 font-bold text-xs">
              3
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-primary">
                  {isMr ? '३. तिसरा हप्ता (कणीस भरताना, दिवस ५०-५५)' : '3. Third Split (Panicle Initiation, Day 50-55)'}
                </h4>
                <span className="text-[10px] text-on-surface-variant">
                  {isMr ? 'आगामी' : 'Upcoming'}
                </span>
              </div>
              <p className="text-[11px] text-on-surface-variant mt-1">
                Urea: 25 kg/ac + Potash (MOP): 15 kg/ac for bold grains
              </p>
            </div>
          </div>
        </section>

        {/* Soil Health Status Cards */}
        <section className="p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-xs space-y-2.5">
          <div className="flex items-center justify-between">
            <h3 className="font-headline-sm text-headline-sm text-primary">
              {isMr ? 'माती परीक्षण पोषक द्रव्ये पातळी' : 'Soil Nutrient Profile'}
            </h3>
            <span className="text-[10px] text-secondary font-bold">Radhanagari Lab</span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="bg-surface-container-low rounded-xl p-2.5">
              <span className="text-[10px] text-on-surface-variant block uppercase font-bold">
                Nitrogen (N)
              </span>
              <span className="font-bold text-error">Medium-Low</span>
              <span className="text-[10px] text-on-surface-variant block mt-0.5">Top-up req.</span>
            </div>
            <div className="bg-surface-container-low rounded-xl p-2.5">
              <span className="text-[10px] text-on-surface-variant block uppercase font-bold">
                Phosphorus (P)
              </span>
              <span className="font-bold text-secondary">High</span>
              <span className="text-[10px] text-on-surface-variant block mt-0.5">Optimum</span>
            </div>
            <div className="bg-surface-container-low rounded-xl p-2.5">
              <span className="text-[10px] text-on-surface-variant block uppercase font-bold">
                Potassium (K)
              </span>
              <span className="font-bold text-on-tertiary-container">Medium</span>
              <span className="text-[10px] text-on-surface-variant block mt-0.5">At PI stage</span>
            </div>
          </div>
        </section>

        {/* Application Timing Guidelines */}
        <section className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/30 space-y-2">
          <h4 className="font-title-md text-title-md font-bold text-primary flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[18px] text-secondary">schedule</span>
            <span>{isMr ? 'खत देण्याची योग्य वेळ व खबरदारी' : 'Best Practice Timing'}</span>
          </h4>
          <ul className="text-xs text-on-surface-variant space-y-1.5 list-disc list-inside">
            <li>
              {isMr
                ? 'सकाळी ८:०० ते ११:०० किंवा दुपारी २:०० वाजेपूर्वी खत देणे सर्वात प्रभावी ठरते.'
                : 'Apply between 8:00 AM and 11:30 AM before midday peak heat.'}
            </li>
            <li>
              {isMr
                ? 'उद्या दुपारनंतर वादळी पाऊस अपेक्षित असल्याने आजच खत देऊन पूर्ण करावे.'
                : 'Complete application before tomorrow’s forecast rain to avoid surface run-off.'}
            </li>
          </ul>
        </section>
      </main>

      {/* Sticky Bottom Bar */}
      <footer className="fixed bottom-0 inset-x-0 p-5 bg-surface/95 backdrop-blur-md border-t border-outline-variant/30 z-40 max-w-md mx-auto">
        <button
          onClick={onBack}
          className="w-full h-14 rounded-2xl bg-primary-container text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md active:scale-[0.98] transition-all cursor-pointer"
        >
          <span>{isMr ? 'मागे जा (Back to Advisory Hub)' : 'Back to Advisory Hub'}</span>
        </button>
      </footer>
    </div>
  );
};
