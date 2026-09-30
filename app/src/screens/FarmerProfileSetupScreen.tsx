import React, { useState } from 'react';
import { AppLanguage, FarmerProfile } from '../types';
import { playSpeech } from '../utils/audio';
import { useAgromet } from '../context/AgrometContext';

interface FarmerProfileSetupScreenProps {
  farmerProfile: FarmerProfile;
  onUpdateProfile: (updated: Partial<FarmerProfile>) => void;
  onContinue: () => void;
  onBack: () => void;
  onChangeLocation: () => void;
  language: AppLanguage;
}

export const FarmerProfileSetupScreen: React.FC<FarmerProfileSetupScreenProps> = ({
  farmerProfile,
  onUpdateProfile,
  onContinue,
  onBack,
  onChangeLocation,
  language,
}) => {
  const isMr = language === 'mr';
  const { prediction } = useAgromet();

  const [name, setName] = useState(farmerProfile.name || 'Rajesh Patil');
  const [mobile, setMobile] = useState(farmerProfile.mobile || '9823451090');
  const [farmArea, setFarmArea] = useState(farmerProfile.farmArea || '5.0');
  const [farmAreaUnit, setFarmAreaUnit] = useState<'Acres' | 'Hectares' | 'Gunthas'>(
    farmerProfile.farmAreaUnit || 'Acres'
  );
  const [irrigationSource, setIrrigationSource] = useState(
    farmerProfile.irrigationSource || 'Open Well + Canal'
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      name: name.trim() || 'Rajesh Patil',
      mobile: mobile.trim() || '9823451090',
      farmArea: farmArea.trim() || '5.0',
      farmAreaUnit,
      irrigationSource,
    });
    onContinue();
  };

  return (
    <div className="relative w-full min-h-screen bg-surface flex flex-col justify-between overflow-x-hidden text-on-surface">
      {/* Background with lush agricultural tint */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <img
          alt="Farmland background"
          className="w-full h-full object-cover object-center filter brightness-95 opacity-25"
          src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1200&q=80"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-surface/80 via-surface/95 to-surface"></div>
      </div>

      <div className="relative z-10 flex flex-col flex-1 px-5 pt-safe pt-3 pb-32">
        {/* Top Navigation */}
        <nav className="flex items-center justify-between mb-4">
          <button
            onClick={onBack}
            aria-label="Go Back"
            className="w-10 h-10 rounded-full bg-white border border-outline-variant/40 flex items-center justify-center text-primary-container active:scale-95 transition-all shadow-xs"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </button>

          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-outline-variant/40 text-xs font-semibold text-primary shadow-xs">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            <span>{isMr ? 'पाऊल ३ / Step 3 of 3' : 'Step 3 of 3'}</span>
          </div>

          <button
            onClick={() =>
              playSpeech(
                isMr
                  ? 'शेतकरी नाव आणि शेतीचा तपशील प्रविष्ट करा.'
                  : 'Enter farmer full name and farm details to personalize your advisory.',
                isMr ? 'mr' : 'en'
              )
            }
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-outline-variant/40 text-xs font-semibold text-primary shadow-xs active:scale-95"
          >
            <span className="material-symbols-outlined text-[16px] text-secondary">volume_up</span>
            <span>{isMr ? 'ऐका' : 'Audio'}</span>
          </button>
        </nav>

        {/* Header Title */}
        <header className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-primary-container">
              {isMr ? 'शेतकरी प्रोफाईल' : 'Farmer Profile'}
            </h1>
            <p className="text-xs text-on-surface-variant mt-0.5">
              {isMr ? 'वैयक्तिक आणि शेताची माहिती' : 'Personal & Farm Details'}
            </p>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-secondary-container text-on-secondary-container shadow-xs">
            <img src="/param_logo.png" alt="PARAM" className="w-4 h-4 rounded-full object-contain" />
            <span>PARAM</span>
          </div>
        </header>

        {/* Confirmed Location Summary */}
        <section className="mb-4">
          <div className="rounded-2xl p-3.5 flex items-center justify-between gap-3 bg-white border border-outline-variant/30 shadow-xs">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-secondary-container/60 flex items-center justify-center shrink-0 text-secondary">
                <span className="material-symbols-outlined text-[20px]">location_on</span>
              </div>
              <div className="truncate">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] uppercase tracking-wider text-secondary font-bold">
                    {isMr ? 'निश्चित स्थान' : 'Confirmed Location'}
                  </span>
                  <span className="material-symbols-outlined text-[16px] text-secondary">
                    verified
                  </span>
                </div>
                <p className="text-xs font-semibold text-primary truncate">
                  {prediction ? `${prediction.name}, ${prediction.state}` : `${farmerProfile.village || 'Sajani'}, ${farmerProfile.district || 'MH'}`}
                </p>
              </div>
            </div>

            <button
              onClick={onChangeLocation}
              className="shrink-0 text-xs font-bold text-secondary hover:underline px-2.5 py-1 rounded-lg hover:bg-secondary-container/30 transition-all"
            >
              {isMr ? 'बदला (Change)' : 'Change'}
            </button>
          </div>
        </section>

        {/* Farmer Profile Form */}
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl p-4 space-y-4 bg-white border border-outline-variant/30 shadow-xs"
        >
          <div className="flex items-center gap-2 pb-2 border-b border-outline-variant/20">
            <span className="material-symbols-outlined text-[18px] text-secondary">
              person_pin
            </span>
            <span className="text-xs font-bold text-primary tracking-wide uppercase">
              {isMr ? 'शेतकरी व शेती तपशील' : 'Personal & Farm Details'}
            </span>
          </div>

          {/* Photo Upload Simulation */}
          <div className="flex items-center gap-4 py-1">
            <div className="relative shrink-0 group">
              <div className="w-16 h-16 rounded-full border-2 border-dashed border-secondary/50 bg-secondary-container/20 flex items-center justify-center text-secondary">
                <span className="material-symbols-outlined text-[28px]">account_circle</span>
              </div>
              <div className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-secondary text-white flex items-center justify-center shadow-xs text-xs">
                +
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-primary">
                {isMr ? 'शेतकऱ्याचा फोटो जोडा' : 'Add Farmer Photo'}
              </span>
              <span className="text-xs text-on-surface-variant">
                {isMr ? 'पर्यायी • JPG किंवा PNG' : 'Optional • JPG or PNG'}
              </span>
              <span className="text-xs text-secondary font-semibold mt-0.5 cursor-pointer hover:underline">
                {isMr ? 'कॅमेऱ्यातून घ्या / फोनमधून निवडा' : 'Upload from phone'}
              </span>
            </div>
          </div>

          {/* Field 1: Farmer Full Name */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-primary" htmlFor="farmer-name">
              {isMr ? 'शेतकऱ्याचे पूर्ण नाव *' : 'Farmer Full Name *'}
            </label>
            <input
              id="farmer-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={isMr ? 'उदा. राजेश पाटील' : 'e.g. Rajesh Patil'}
              className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-primary focus:ring-1 focus:ring-secondary focus:outline-none"
            />
            <p className="text-[11px] text-on-surface-variant">
              {isMr
                ? 'हे नाव मुख्य पानावर "नमस्ते, [नाव]" असे दिसेल.'
                : 'This name will be displayed as "Namaste, [Name]" on Home.'}
            </p>
          </div>

          {/* Field 2: Mobile Number */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-primary" htmlFor="mobile-number">
                {isMr ? 'मोबाईल नंबर *' : 'Mobile Number *'}
              </label>
              <span className="text-[11px] text-on-surface-variant">
                {isMr ? '(हवामान व सल्ला SMS साठी)' : '(For Alerts & Schemes)'}
              </span>
            </div>
            <div className="flex rounded-xl overflow-hidden bg-surface-container-low border border-outline-variant/30 focus-within:ring-1 focus-within:ring-secondary">
              <span className="inline-flex items-center px-3 text-xs font-bold text-primary bg-surface-container border-r border-outline-variant/30">
                +91 🇮🇳
              </span>
              <input
                id="mobile-number"
                type="tel"
                maxLength={10}
                required
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="9823451090"
                className="w-full bg-transparent px-3 py-2.5 text-sm font-semibold text-primary focus:outline-none"
              />
            </div>
          </div>

          {/* Field 3: Farm Area with Unit Selection */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-primary">
              {isMr ? 'एकूण शेत जमीन क्षेत्र *' : 'Total Farm Area *'}
            </label>
            <div className="grid grid-cols-12 gap-2">
              <div className="col-span-7">
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  required
                  value={farmArea}
                  onChange={(e) => setFarmArea(e.target.value)}
                  placeholder="5.0"
                  className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-primary focus:ring-1 focus:ring-secondary focus:outline-none"
                />
              </div>
              <div className="col-span-5">
                <select
                  value={farmAreaUnit}
                  onChange={(e) =>
                    setFarmAreaUnit(e.target.value as 'Acres' | 'Hectares' | 'Gunthas')
                  }
                  className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-2.5 py-2.5 text-xs font-bold text-primary focus:ring-1 focus:ring-secondary focus:outline-none cursor-pointer"
                >
                  <option value="Acres">{isMr ? 'एकर (Acres)' : 'Acres'}</option>
                  <option value="Gunthas">{isMr ? 'गुंठे (Gunthas)' : 'Gunthas'}</option>
                  <option value="Hectares">{isMr ? 'हेक्टर (Hectares)' : 'Hectares'}</option>
                </select>
              </div>
            </div>
          </div>

          {/* Field 4: Primary Irrigation Source */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-primary" htmlFor="irrigation-source">
              {isMr ? 'पाणी / सिंचनाचा मुख्य स्त्रोत *' : 'Primary Water / Irrigation Source *'}
            </label>
            <div className="relative">
              <select
                id="irrigation-source"
                value={irrigationSource}
                onChange={(e) => setIrrigationSource(e.target.value)}
                className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-primary focus:ring-1 focus:ring-secondary focus:outline-none appearance-none cursor-pointer pr-9"
              >
                <option value="Open Well + Canal">
                  {isMr ? 'विहीर + कालवा (Open Well + Canal)' : 'Open Well + Canal'}
                </option>
                <option value="Open Well">{isMr ? 'विहीर (Open Well)' : 'Open Well'}</option>
                <option value="Borewell">{isMr ? 'बोअरवेल (Borewell)' : 'Borewell'}</option>
                <option value="Canal">{isMr ? 'कालवा (Canal)' : 'Canal'}</option>
                <option value="Drip Irrigation">
                  {isMr ? 'ठिबक सिंचन (Drip Irrigation)' : 'Drip Irrigation'}
                </option>
                <option value="Rainfed Only">
                  {isMr ? 'फक्त पावसाचे पाणी (Rainfed Only)' : 'Rainfed Only'}
                </option>
              </select>
              <span className="material-symbols-outlined text-[18px] text-on-surface-variant absolute right-3 top-2.5 pointer-events-none">
                expand_more
              </span>
            </div>
          </div>

          {/* Hidden submit trigger so hitting Enter works */}
          <button type="submit" className="sr-only">
            Submit
          </button>
        </form>
      </div>

      {/* Sticky Bottom Continue CTA */}
      <footer className="fixed bottom-0 inset-x-0 p-5 bg-surface/95 backdrop-blur-md border-t border-outline-variant/20 z-40 max-w-md mx-auto">
        <button
          onClick={handleSubmit}
          className="w-full h-14 bg-primary-container hover:bg-primary rounded-2xl flex items-center justify-center gap-2 text-white font-bold text-sm shadow-md active:scale-[0.98] transition-all"
        >
          <span>{isMr ? 'माहिती पूर्ण करा व पुढे चला' : 'Complete Profile & Start'}</span>
          <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
        </button>
      </footer>
    </div>
  );
};
