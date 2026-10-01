import React, { useState } from 'react';
import { AppLanguage, FarmerProfile } from '../types';
import { playSpeech } from '../utils/audio';
import { useAgromet } from '../context/AgrometContext';

interface FarmerProfileViewScreenProps {
  farmerProfile: FarmerProfile;
  onUpdateProfile: (updated: Partial<FarmerProfile>) => void;
  onBack: () => void;
  language: AppLanguage;
  onToggleLanguage: () => void;
  onChangeLocation: () => void;
}

export const FarmerProfileViewScreen: React.FC<FarmerProfileViewScreenProps> = ({
  farmerProfile,
  onUpdateProfile,
  onBack,
  language,
  onToggleLanguage,
  onChangeLocation,
}) => {
  const isMr = language === 'mr';
  const { prediction } = useAgromet();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(farmerProfile.name);
  const [mobile, setMobile] = useState(farmerProfile.mobile);
  const [farmArea, setFarmArea] = useState(farmerProfile.farmArea);

  const handleSave = () => {
    onUpdateProfile({
      name: name.trim() || 'Rajesh Patil',
      mobile: mobile.trim() || '9823451090',
      farmArea: farmArea.trim() || '5.0',
    });
    setIsEditing(false);
  };

  const handleAudio = () => {
    const loc = prediction ? `${prediction.name}, ${prediction.state}` : `${farmerProfile.village || 'Sajani'}, ${farmerProfile.district || 'MH'}`;
    if (isMr) {
      playSpeech(
        `शेतकरी प्रोफाईल: ${farmerProfile.name}, ${loc}. एकूण शेती क्षेत्र ${farmerProfile.farmArea} ${farmerProfile.farmAreaUnit}.`,
        'mr'
      );
    } else {
      playSpeech(
        `Farmer Profile: ${farmerProfile.name}, ${loc}. Total farm area ${farmerProfile.farmArea} ${farmerProfile.farmAreaUnit}.`,
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
                {isMr ? 'शेतकरी प्रोफाईल' : 'Farmer Profile'}
              </h1>
              <span className="text-[11px] text-on-surface-variant">
                {isMr ? 'वैयक्तिक माहिती व खाते' : 'Account & Farm Details'}
              </span>
            </div>
          </div>

          <button
            onClick={handleAudio}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed-variant text-xs font-bold shadow-xs active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[16px]">volume_up</span>
            <span>{isMr ? 'ऐका' : 'Listen'}</span>
          </button>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 px-5 pt-20 pb-32 space-y-4">
        {/* Profile Card Header */}
        <section className="p-5 rounded-3xl bg-gradient-to-br from-primary-container to-primary text-on-primary shadow-lg border border-primary-fixed/30 flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md border-2 border-white/40 flex items-center justify-center text-3xl shadow-inner shrink-0">
              👨‍🌾
            </div>
            <div className="flex-1 min-w-0">
              <span className="inline-flex items-center gap-1.5 text-[10px] px-2.5 py-0.5 rounded-full bg-secondary-fixed text-primary font-bold uppercase tracking-wider">
                <img src="/param_logo.png" alt="PARAM" className="w-3.5 h-3.5 rounded-full object-contain" />
                PARAM VERIFIED FARMER
              </span>
              <h2 className="text-xl font-extrabold text-white truncate mt-1">
                {farmerProfile.name}
              </h2>
              <p className="text-xs text-surface-bright/90 mt-0.5 flex items-center gap-1">
                <span className="material-symbols-outlined text-[15px] text-secondary-fixed">
                  call
                </span>
                <span>+91 {farmerProfile.mobile}</span>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/15 text-xs">
            <div className="bg-white/10 rounded-xl p-2.5">
              <span className="text-[10px] text-surface-bright/80 block uppercase font-bold">
                {isMr ? 'शेत क्षेत्र' : 'Total Farm Area'}
              </span>
              <span className="text-sm font-bold text-white">
                {farmerProfile.farmArea} {isMr ? 'एकर' : farmerProfile.farmAreaUnit}
              </span>
            </div>
            <div className="bg-white/10 rounded-xl p-2.5">
              <span className="text-[10px] text-surface-bright/80 block uppercase font-bold">
                {isMr ? 'पाणी स्त्रोत' : 'Water Source'}
              </span>
              <span className="text-xs font-bold text-white truncate block">
                {farmerProfile.irrigationSource}
              </span>
            </div>
          </div>
        </section>

        {/* Location & Farm Settings Card */}
        <section className="p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-secondary-container/60 text-secondary flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px]">pin_drop</span>
              </span>
              <h3 className="font-headline-sm text-headline-sm text-primary">
                {isMr ? 'शेताचे नोंदणीकृत स्थान' : 'Registered Farm Location'}
              </h3>
            </div>
            <button
              onClick={onChangeLocation}
              className="text-xs font-bold text-secondary hover:underline"
            >
              {isMr ? 'बदला' : 'Change'}
            </button>
          </div>

          <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/20 flex flex-col gap-1 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-on-surface-variant">{isMr ? 'ग्रामपंचायत:' : 'Gram Panchayat:'}</span>
              <span className="font-bold text-primary">{farmerProfile.panchayat}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-on-surface-variant">{isMr ? 'गाव व तालुका:' : 'Village & Taluka:'}</span>
              <span className="font-semibold text-primary">
                {farmerProfile.village}, {farmerProfile.taluka}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-on-surface-variant">{isMr ? 'जिल्हा व राज्य:' : 'District & State:'}</span>
              <span className="font-semibold text-primary">
                {farmerProfile.district}, Maharashtra
              </span>
            </div>
          </div>
        </section>

        {/* Edit Details Inline Section */}
        <section className="p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-headline-sm text-headline-sm text-primary flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-secondary">
                manage_accounts
              </span>
              <span>{isMr ? 'माहिती संपादन (Edit Details)' : 'Edit Farmer Details'}</span>
            </h3>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="px-3 py-1 rounded-xl bg-surface-container hover:bg-surface-container-high text-primary text-xs font-bold transition-colors"
              >
                {isMr ? 'संपादन करा' : 'Edit'}
              </button>
            ) : (
              <button
                onClick={handleSave}
                className="px-3 py-1 rounded-xl bg-secondary text-white text-xs font-bold shadow-xs active:scale-95"
              >
                {isMr ? 'जतन करा' : 'Save'}
              </button>
            )}
          </div>

          {isEditing ? (
            <div className="space-y-3 pt-1">
              <div>
                <label className="text-xs font-bold text-primary block mb-1">
                  {isMr ? 'शेतकऱ्याचे नाव' : 'Farmer Full Name'}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-3 py-2 text-xs font-semibold text-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-primary block mb-1">
                  {isMr ? 'मोबाईल नंबर' : 'Mobile Number'}
                </label>
                <input
                  type="tel"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-3 py-2 text-xs font-semibold text-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-primary block mb-1">
                  {isMr ? 'शेती क्षेत्र (एकर)' : 'Farm Area (Acres)'}
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={farmArea}
                  onChange={(e) => setFarmArea(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-3 py-2 text-xs font-semibold text-primary focus:outline-none"
                />
              </div>
            </div>
          ) : (
            <p className="text-xs text-on-surface-variant">
              {isMr
                ? 'येथे बदललेले नाव मुख्य पानावर "नमस्ते, [नाव]" असे त्वरित अद्ययावत होते.'
                : 'Editing your name here will update "Namaste, [Name]" on Home and reports.'}
            </p>
          )}
        </section>

        {/* Language Preference Card */}
        <section className="p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-lg bg-surface-container text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">translate</span>
            </span>
            <div>
              <span className="text-xs font-bold text-primary block">
                {isMr ? 'अ‍ॅपची भाषा (App Language)' : 'App Language'}
              </span>
              <span className="text-[11px] text-on-surface-variant">
                {language === 'mr' ? 'मराठी (महाराष्ट्र)' : 'English (Pan-India)'}
              </span>
            </div>
          </div>

          <button
            onClick={onToggleLanguage}
            className="px-3.5 py-1.5 rounded-xl bg-secondary-container text-on-secondary-container text-xs font-bold shadow-xs active:scale-95 transition-all"
          >
            {language === 'mr' ? 'Switch to English' : 'मराठी करा'}
          </button>
        </section>

        {/* Govt IDs & Helplines */}
        <section className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/30 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-on-surface-variant">{isMr ? 'महाडीबीटी शेतकरी आयडी:' : 'MahaDBT Farmer ID:'}</span>
            <span className="font-mono font-bold text-primary">MH-KLP-2026-8821</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-on-surface-variant">{isMr ? 'माती आरोग्य पत्रिका:' : 'Soil Health Card:'}</span>
            <span className="font-bold text-secondary">Active • 2026 Valid</span>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-outline-variant/20">
            <div className="flex items-center gap-2">
              <img src="/param_logo.png" alt="PARAM" className="w-5 h-5 rounded-full object-contain" />
              <span className="text-on-surface-variant font-medium">PARAM Agro Advisory</span>
            </div>
            <span className="text-[11px] text-on-surface-variant font-mono">v2.4 (2026.09)</span>
          </div>
        </section>
      </main>

      {/* Sticky Bottom Bar */}
      <footer className="fixed bottom-0 inset-x-0 p-5 bg-surface/95 backdrop-blur-md border-t border-outline-variant/30 z-40 max-w-md mx-auto">
        <button
          onClick={onBack}
          className="w-full h-14 rounded-2xl bg-primary-container text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md active:scale-[0.98] transition-all cursor-pointer"
        >
          <span>{isMr ? 'मुख्य पानावर परत जा' : 'Back to Home'}</span>
        </button>
      </footer>
    </div>
  );
};
