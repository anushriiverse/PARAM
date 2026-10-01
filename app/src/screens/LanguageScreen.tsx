import React from 'react';
import { AppLanguage } from '../types';
import { playSpeech } from '../utils/audio';

interface LanguageScreenProps {
  currentLanguage: AppLanguage;
  onSelectLanguage: (lang: AppLanguage) => void;
  onContinue: () => void;
  onBack: () => void;
}

export const LanguageScreen: React.FC<LanguageScreenProps> = ({
  currentLanguage,
  onSelectLanguage,
  onContinue,
  onBack,
}) => {
  const isMr = currentLanguage === 'mr';

  const handleAudio = () => {
    if (isMr) {
      playSpeech('तुमची पसंतीची भाषा निवडा. मराठी, इंग्रजी किंवा हिंदी.', 'mr');
    } else {
      playSpeech('Choose your preferred language for weather and crop advisory.', 'en');
    }
  };

  return (
    <div className="relative w-full min-h-screen bg-[#001708] flex flex-col justify-between overflow-x-hidden text-white select-none">
      {/* Background Image Layer */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <img
          alt="Farmland background"
          className="w-full h-full object-cover object-center scale-105 filter brightness-75"
          src="https://lh3.googleusercontent.com/aida/AEtjO1U7sn6fM9zpqd_x_La1EntfGg_ZHR0OjLLKBC4fAOmvCJNXHgIJk4a0x50K1-Vy9XZaBIunP4I_ZH0uOnHnVCnyTrWMWaIG-tR1C7HFtVrqzoZPGc816WMp2DNDFLcwqLBCJvnrQdrTQHGMrRCiuv2hw5Clc2YYm-NMdsNB8c1IfM9NSXNHZBSX35-3UIu0UVMg2z_vf1RFiyYAY3mVnh4GOOkerrVq9NivosnjAQKbxkeaErvOKHY_yvs"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-[#001c0a]/70 to-[#001407]/95"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col w-full pb-36 px-5 pt-safe pt-3">
        {/* Header Bar */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={onBack}
              aria-label="Go back"
              className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/20 flex items-center justify-center text-white active:scale-95 transition-all shadow-md"
            >
              <span className="material-symbols-outlined text-[24px]">arrow_back</span>
            </button>
            <span className="px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-white/90 text-xs font-semibold shadow-sm">
              {isMr ? 'पाऊल १ / Step 1 of 3' : 'Step 1 of 3'}
            </span>
          </div>

          <button
            onClick={handleAudio}
            className="h-10 px-3.5 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/25 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-md active:scale-95 transition-all"
          >
            <span
              className="material-symbols-outlined text-[18px] text-secondary-fixed"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              volume_up
            </span>
            <span>{isMr ? 'ऐका / Audio' : 'Audio Guide'}</span>
          </button>
        </div>

        {/* Title Block & Sprout Emblem */}
        <div className="flex items-start justify-between gap-3 mb-5">
          <div className="max-w-[78%]">
            <h1 className="text-2xl font-bold tracking-tight text-white drop-shadow-sm">
              तुमची भाषा निवडा
            </h1>
            <p className="text-sm text-white/90 font-semibold mt-0.5">Choose your language</p>
            <p className="text-xs text-white/75 mt-1.5 leading-relaxed">
              अ‍ॅपमधील सर्व हवामान आणि पीक सल्ला या भाषेत मिळेल. (Weather & crop alerts will be delivered in this language)
            </p>
          </div>

          {/* PARAM Heritage Crest Emblem */}
          <div className="w-14 h-14 rounded-full bg-[#fbfbf8] p-0.5 border border-white/40 shadow-lg shrink-0 overflow-hidden flex items-center justify-center">
            <img src="/param_logo.png" alt="PARAM Crest" className="w-full h-full object-contain" />
          </div>
        </div>

        {/* Language Option Cards */}
        <div className="flex flex-col space-y-3">
          {/* Marathi Card */}
          <div
            onClick={() => onSelectLanguage('mr')}
            className={`relative rounded-2xl p-4 backdrop-blur-xl transition-all duration-200 cursor-pointer overflow-hidden ${
              isMr
                ? 'bg-white/25 border-2 border-white/60 shadow-xl'
                : 'bg-white/10 hover:bg-white/15 border border-white/20'
            }`}
          >
            {isMr && (
              <div className="absolute left-0 top-0 bottom-0 w-2 bg-secondary-fixed rounded-r-full shadow-sm"></div>
            )}
            <div className="flex items-start justify-between pl-1">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xl font-extrabold text-white drop-shadow-sm">मराठी</span>
                  <span className="text-sm text-white/90 font-semibold">Marathi</span>
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 mt-1.5 rounded-full bg-secondary-container/90 text-on-secondary-fixed text-xs font-semibold shadow-sm">
                  महाराष्ट्र विशेष • Maharashtra
                </span>
              </div>
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                  isMr
                    ? 'bg-secondary-fixed text-primary shadow-md'
                    : 'bg-white/15 border border-white/25 text-white/40'
                }`}
              >
                {isMr ? (
                  <span className="material-symbols-outlined text-[18px] font-bold">check</span>
                ) : (
                  <div className="w-2.5 h-2.5 rounded-full bg-white/40"></div>
                )}
              </div>
            </div>
          </div>

          {/* Hindi Card */}
          <div
            onClick={() => onSelectLanguage('hi')}
            className={`relative rounded-2xl p-4 backdrop-blur-xl transition-all duration-200 cursor-pointer overflow-hidden ${
              currentLanguage === 'hi'
                ? 'bg-white/25 border-2 border-white/60 shadow-xl'
                : 'bg-white/10 hover:bg-white/15 border border-white/20'
            }`}
          >
            {currentLanguage === 'hi' && (
              <div className="absolute left-0 top-0 bottom-0 w-2 bg-secondary-fixed rounded-r-full shadow-sm"></div>
            )}
            <div className="flex items-start justify-between pl-1">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xl font-extrabold text-white drop-shadow-sm">हिन्दी</span>
                  <span className="text-sm text-white/80 font-semibold">Hindi</span>
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 mt-1.5 rounded-full bg-white/15 text-white/90 border border-white/10 text-xs">
                  मध्य भारत • Central India
                </span>
              </div>
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                  currentLanguage === 'hi'
                    ? 'bg-secondary-fixed text-primary shadow-md'
                    : 'bg-white/15 border border-white/25 text-white/40'
                }`}
              >
                {currentLanguage === 'hi' ? (
                  <span className="material-symbols-outlined text-[18px] font-bold">check</span>
                ) : (
                  <div className="w-2.5 h-2.5 rounded-full bg-white/40"></div>
                )}
              </div>
            </div>
          </div>

          {/* English Card */}
          <div
            onClick={() => onSelectLanguage('en')}
            className={`relative rounded-2xl p-4 backdrop-blur-xl transition-all duration-200 cursor-pointer overflow-hidden ${
              currentLanguage === 'en'
                ? 'bg-white/25 border-2 border-white/60 shadow-xl'
                : 'bg-white/10 hover:bg-white/15 border border-white/20'
            }`}
          >
            {currentLanguage === 'en' && (
              <div className="absolute left-0 top-0 bottom-0 w-2 bg-secondary-fixed rounded-r-full shadow-sm"></div>
            )}
            <div className="flex items-start justify-between pl-1">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xl font-extrabold text-white drop-shadow-sm">English</span>
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 mt-1.5 rounded-full bg-white/15 text-white/90 border border-white/10 text-xs">
                  Pan-India Advisory
                </span>
              </div>
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                  currentLanguage === 'en'
                    ? 'bg-secondary-fixed text-primary shadow-md'
                    : 'bg-white/15 border border-white/25 text-white/40'
                }`}
              >
                {currentLanguage === 'en' ? (
                  <span className="material-symbols-outlined text-[18px] font-bold">check</span>
                ) : (
                  <div className="w-2.5 h-2.5 rounded-full bg-white/40"></div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Voice Assistance Ready Highlight */}
        <div className="mt-5 p-4 rounded-2xl bg-white/15 backdrop-blur-xl border border-white/25 flex items-center space-x-3 shadow-lg">
          <div className="w-10 h-10 rounded-full bg-secondary-fixed/90 text-primary flex items-center justify-center shrink-0 shadow-md">
            <span className="material-symbols-outlined text-[22px]">record_voice_over</span>
          </div>
          <div className="flex-1">
            <p className="text-xs font-bold text-white">
              {isMr
                ? 'बोलून माहिती मिळवा (Voice Assistance Ready)'
                : 'Voice Assistance Enabled'}
            </p>
            <p className="text-[11px] text-white/80 mt-0.5 leading-snug">
              {isMr
                ? 'अ‍ॅपमध्ये वाचण्यासोबत प्रत्येक माहिती ऐकण्याची सुविधा उपलब्ध आहे.'
                : 'Listen to every weather and advisory directive in your preferred language.'}
            </p>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Bar */}
      <footer className="fixed bottom-0 inset-x-0 p-5 bg-black/50 backdrop-blur-xl border-t border-white/15 shadow-2xl flex flex-col space-y-2 z-40 max-w-md mx-auto">
        <button
          onClick={onContinue}
          className="w-full h-14 rounded-2xl bg-white/25 hover:bg-white/35 backdrop-blur-xl border border-white/50 text-white flex items-center justify-center space-x-2 shadow-lg active:scale-[0.98] transition-all cursor-pointer"
        >
          <span className="font-bold text-base tracking-wide text-white drop-shadow">
            {isMr ? 'पुढे चला / Continue' : 'Continue'}
          </span>
          <span className="material-symbols-outlined text-[22px] text-secondary-fixed">
            arrow_forward
          </span>
        </button>
        <p className="text-[11px] text-center text-white/80 flex items-center justify-center space-x-1">
          <span className="material-symbols-outlined text-[14px]">language</span>
          <span>
            {isMr
              ? 'भाषा नंतर सेटिंग्जमधून कधीही बदलता येईल (Can be changed anytime)'
              : 'Language can be changed anytime from settings'}
          </span>
        </p>
      </footer>
    </div>
  );
};
