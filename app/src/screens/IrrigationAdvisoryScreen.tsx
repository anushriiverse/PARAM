import React from 'react';
import { AppLanguage } from '../types';
import { playSpeech } from '../utils/audio';

interface IrrigationAdvisoryScreenProps {
  onBack: () => void;
  language: AppLanguage;
}

export const IrrigationAdvisoryScreen: React.FC<IrrigationAdvisoryScreenProps> = ({
  onBack,
  language,
}) => {
  const isMr = language === 'mr';

  const handleAudio = () => {
    if (isMr) {
      playSpeech(
        'सिंचन सल्ला: जमिनीत ७२ टक्के ओलावा असून पुढील ३६ तासांत १८ मिमी पावसाची शक्यता आहे. त्यामुळे पुढील २ दिवस पाणी देणे थांबवावे.',
        'mr'
      );
    } else {
      playSpeech(
        'Irrigation Advisory: Soil moisture is 72 percent and 18 millimeters rain is predicted in 36 hours. Hold irrigation for 48 hours.',
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
                {isMr ? 'सिंचन व पाणी व्यवस्थापन' : 'Irrigation Advisory'}
              </h1>
              <span className="text-[11px] text-on-surface-variant">
                {isMr ? 'राधानगरी प्लॉट १ • भात (इंद्रायणी)' : 'Radhanagari Plot 1 • Rice (Indrayani)'}
              </span>
            </div>
          </div>

          <button
            onClick={handleAudio}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed-variant text-xs font-bold shadow-xs active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[16px]">volume_up</span>
            <span>{isMr ? 'ऐका' : 'Audio'}</span>
          </button>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 px-5 pt-20 pb-28 space-y-4">
        {/* Core Directive Card */}
        <section className="p-5 rounded-3xl bg-surface-container-lowest border border-tertiary-fixed/60 shadow-md flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-9 h-9 rounded-xl bg-tertiary-fixed text-on-tertiary-fixed-variant flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px]">water_drop</span>
              </span>
              <div>
                <span className="text-[10px] uppercase font-bold text-on-tertiary-container block">
                  {isMr ? 'सिंचन शिफारस' : 'DIRECTIVE'}
                </span>
                <h2 className="font-headline-sm text-headline-sm font-extrabold text-primary">
                  {isMr ? 'सिंचन थांबवा (Hold Irrigation)' : 'HOLD IRRIGATION'}
                </h2>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed-variant text-xs font-bold">
              {isMr ? 'पुढील ४८ तास' : 'Next 48 Hours'}
            </span>
          </div>

          <p className="text-xs text-on-surface-variant leading-relaxed">
            {isMr
              ? 'जमिनीतील आर्द्रता पातळी ७२% असून पुढील ३६ तासांत १८ मिमी पावसाचा अंदाज आहे. जास्तीचे पाणी दिल्यास मुळांना ऑक्सिजन कमी पडून खोडकुज रोगाचा धोका वाढेल.'
              : 'Soil moisture is optimal at 72%. With 18 mm rainfall predicted in next 36 hours, holding irrigation prevents waterlogging and stem rot.'}
          </p>
        </section>

        {/* Moisture & Meteorological Metrics */}
        <section className="grid grid-cols-2 gap-3">
          <div className="p-3.5 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-xs flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-on-surface-variant uppercase font-bold">
                {isMr ? 'मातीतील ओलावा' : 'Soil Moisture'}
              </span>
              <span className="material-symbols-outlined text-secondary text-[18px]">humidity_high</span>
            </div>
            <span className="text-2xl font-extrabold text-primary">72%</span>
            <span className="text-[10px] text-secondary font-semibold">
              {isMr ? 'पुरेसा व उत्तम' : 'Adequate / Optimum'}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-xs flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-on-surface-variant uppercase font-bold">
                {isMr ? 'अपेक्षित पाऊस' : 'Predicted Rain'}
              </span>
              <span className="material-symbols-outlined text-tertiary-fixed-dim text-[18px]">rainy</span>
            </div>
            <span className="text-2xl font-extrabold text-primary">18 mm</span>
            <span className="text-[10px] text-on-tertiary-container font-semibold">
              {isMr ? 'पुढील ३६ तास' : 'In next 36h'}
            </span>
          </div>
        </section>

        {/* Crop Water Depth Recommendation */}
        <section className="p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-xs space-y-3">
          <h3 className="font-headline-sm text-headline-sm text-primary flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[20px] text-secondary">waves</span>
            <span>{isMr ? 'पाण्याची पातळी व्यवस्थापन (Water Depth)' : 'Water Depth Management'}</span>
          </h3>

          <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/20 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-primary block">
                {isMr ? 'फुटवे अवस्था (Tillering)' : 'Tillering Stage Target'}
              </span>
              <span className="text-[11px] text-on-surface-variant">
                {isMr ? '२ ते ३ सेमी हलके पाणी' : '2 to 3 cm shallow sheet'}
              </span>
            </div>
            <span className="px-2.5 py-1 rounded-lg bg-secondary text-white text-xs font-bold">
              2 - 3 cm
            </span>
          </div>

          <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/20 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-primary block">
                {isMr ? 'कणीस निसवताना (Heading)' : 'Heading & Flowering Target'}
              </span>
              <span className="text-[11px] text-on-surface-variant">
                {isMr ? '४ ते ५ सेमी पाणी आवश्यक' : '4 to 5 cm continuous layer'}
              </span>
            </div>
            <span className="px-2.5 py-1 rounded-lg bg-surface-container text-on-surface text-xs font-bold">
              4 - 5 cm
            </span>
          </div>
        </section>

        {/* Drainage Clearance Warning */}
        <section className="p-4 rounded-2xl bg-error-container/40 border border-error/30 shadow-xs flex items-start gap-3">
          <span className="material-symbols-outlined text-error text-[22px] shrink-0 mt-0.5">
            warning
          </span>
          <div>
            <h4 className="text-xs font-bold text-error">
              {isMr ? 'निचरा चारी स्वच्छ ठेवा' : 'Clear Field Drainage Channels'}
            </h4>
            <p className="text-[11px] text-on-error-container mt-0.5 leading-relaxed">
              {isMr
                ? 'उद्याच्या पावसामुळे पाणी तुंबू नये यासाठी शेताच्या कडेच्या चारी तात्काळ मोकळ्या कराव्यात.'
                : 'Clear drainage bunds before tomorrow afternoon to let excess storm runoff drain freely.'}
            </p>
          </div>
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
