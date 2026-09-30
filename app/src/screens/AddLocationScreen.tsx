import React, { useState } from 'react';
import { AppLanguage, FarmerProfile } from '../types';
import { playSpeech } from '../utils/audio';
import { useAgromet } from '../context/AgrometContext';

interface AddLocationScreenProps {
  farmerProfile: FarmerProfile;
  onUpdateProfile: (updated: Partial<FarmerProfile>) => void;
  onContinue: () => void;
  onBack: () => void;
  language: AppLanguage;
}

export const AddLocationScreen: React.FC<AddLocationScreenProps> = ({
  farmerProfile,
  onUpdateProfile,
  onContinue,
  onBack,
  language,
}) => {
  const isMr = language === 'mr';
  const { prediction } = useAgromet();
  const [locating, setLocating] = useState(false);
  const [gpsLocked, setGpsLocked] = useState(false);

  const [district, setDistrict] = useState(farmerProfile.district || 'Kolhapur');
  const [taluka, setTaluka] = useState(farmerProfile.taluka || 'Radhanagari');
  const [village, setVillage] = useState(farmerProfile.village || 'Shiroli');
  const [panchayat, setPanchayat] = useState(
    farmerProfile.panchayat || 'Radhanagari Gram Panchayat'
  );

  const handleGpsDetect = () => {
    setLocating(true);
    setTimeout(() => {
      setLocating(false);
      setGpsLocked(true);
      const locName = prediction ? prediction.name : 'Sajani';
      const locState = prediction ? prediction.state : 'MH';
      setDistrict(prediction ? prediction.state : 'Kolhapur');
      setTaluka(prediction ? prediction.name : 'Radhanagari');
      setVillage(prediction ? prediction.name : 'Shiroli');
      setPanchayat(prediction ? `${prediction.name} Gram Panchayat` : 'Radhanagari Gram Panchayat');
      onUpdateProfile({
        district: prediction ? prediction.state : 'Kolhapur',
        taluka: prediction ? prediction.name : 'Radhanagari',
        village: prediction ? prediction.name : 'Shiroli',
        panchayat: prediction ? `${prediction.name} Gram Panchayat` : 'Radhanagari Gram Panchayat',
      });
      playSpeech(
        isMr
          ? `स्थान शोधले: ${locName}, ${locState}.`
          : `Location identified: ${locName}, ${locState}.`,
        isMr ? 'mr' : 'en'
      );
    }, 1000);
  };

  const handleContinueClick = () => {
    onUpdateProfile({
      district,
      taluka,
      village,
      panchayat,
    });
    onContinue();
  };

  return (
    <div className="relative w-full min-h-screen bg-surface flex flex-col justify-between overflow-x-hidden text-on-surface">
      {/* Background with lush agricultural tint */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <img
          alt="Agricultural background"
          className="w-full h-full object-cover object-center filter brightness-95 opacity-20"
          src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1200&q=80"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-surface/80 via-surface/95 to-surface"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col flex-1 px-5 pt-safe pt-3 pb-32">
        {/* Top Navigation */}
        <header className="flex items-center justify-between mb-4">
          <button
            onClick={onBack}
            aria-label="Go Back"
            className="w-10 h-10 rounded-full bg-white border border-outline-variant/40 flex items-center justify-center text-primary-container active:scale-95 transition-all shadow-xs"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </button>

          <div className="px-3.5 py-1.5 rounded-full bg-white border border-outline-variant/40 flex items-center gap-2 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            <span className="text-xs font-semibold text-primary">
              {isMr ? 'पाऊल २ / Step 2 of 3' : 'Step 2 of 3'}
            </span>
          </div>

          <button
            onClick={() =>
              playSpeech(
                isMr
                  ? 'आपल्या शेताचे अचूक स्थान नोंदवा किंवा GPS द्वारे शोधा.'
                  : 'Add your farm location manually or use GPS.',
                isMr ? 'mr' : 'en'
              )
            }
            className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed text-xs font-semibold shadow-xs"
          >
            <span className="material-symbols-outlined text-[16px] text-on-tertiary-fixed-variant">
              volume_up
            </span>
            <span>{isMr ? 'ऐका' : 'Audio'}</span>
          </button>
        </header>

        {/* Title Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-primary-container">
              {isMr ? 'शेताचे स्थान जोडा' : 'Add Farm Location'}
            </h1>
            <p className="text-xs text-on-surface-variant mt-0.5">
              {isMr ? 'अचूक हवामान व स्थानिक सल्ला मिळवण्यासाठी' : 'For hyper-local weather & advisories'}
            </p>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary-container text-on-secondary-container font-bold text-xs shadow-xs">
            <img src="/param_logo.png" alt="PARAM" className="w-4 h-4 rounded-full object-contain" />
            <span>PARAM</span>
          </div>
        </div>

        {/* SECTION 1: GPS Auto Detect */}
        <section className="bg-surface-container-lowest rounded-2xl p-4 border border-outline-variant/30 shadow-xs mb-3">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-secondary-container/50 flex items-center justify-center text-secondary shrink-0">
              <span className="material-symbols-outlined text-[22px]">my_location</span>
            </div>
            <div>
              <h2 className="text-sm font-bold text-primary">
                {isMr ? 'सध्याचे स्थान वापरा' : 'Use Current Location'}
              </h2>
              <p className="text-xs text-on-surface-variant">
                {gpsLocked
                  ? isMr
                    ? `स्थान लॉक झाले: ${prediction ? prediction.name : 'सजणी'}`
                    : `Locked: ${prediction ? `${prediction.name}, ${prediction.state}` : 'Sajani, MH'}`
                  : isMr
                  ? 'मोबाईल GPS द्वारे स्थान शोधा'
                  : 'Locate via device GPS'}
              </p>
            </div>
          </div>

          <button
            onClick={handleGpsDetect}
            disabled={locating}
            className={`w-full py-2.5 px-4 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 shadow-sm active:scale-[0.98] transition-all ${
              gpsLocked
                ? 'bg-secondary text-white'
                : 'bg-primary-container hover:bg-primary text-white'
            }`}
          >
            {locating ? (
              <>
                <span className="material-symbols-outlined animate-spin text-[16px]">sync</span>
                <span>{isMr ? 'स्थान शोधत आहे...' : 'Detecting GPS Coordinates...'}</span>
              </>
            ) : gpsLocked ? (
              <>
                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                <span>{isMr ? 'स्थान यशस्वीरित्या नोंदवले!' : 'GPS Location Locked!'}</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[16px]">near_me</span>
                <span>{isMr ? 'GPS द्वारे स्थान शोधा' : 'Locate via GPS'}</span>
              </>
            )}
          </button>
        </section>

        {/* Divider */}
        <div className="flex items-center my-2">
          <div className="flex-grow border-t border-outline-variant/40"></div>
          <span className="mx-3 text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
            {isMr ? 'किंवा (OR)' : 'OR'}
          </span>
          <div className="flex-grow border-t border-outline-variant/40"></div>
        </div>

        {/* SECTION 2: Manual Location Dropdowns */}
        <section className="bg-surface-container-lowest rounded-2xl p-4 border border-outline-variant/30 shadow-xs space-y-3">
          <div className="pb-1 border-b border-outline-variant/20 flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-secondary flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">home_pin</span>
              {isMr ? 'स्थानाचा तपशील' : 'Location Details'}
            </h2>
            <span className="text-[10px] text-on-surface-variant font-medium">
              Maharashtra (MH)
            </span>
          </div>

          {/* State */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-primary">
              {isMr ? 'राज्य' : 'State'}
            </label>
            <div className="bg-surface-container-low rounded-xl px-3.5 py-2.5 text-xs text-primary font-bold flex items-center justify-between">
              <span>Maharashtra (महाराष्ट्र)</span>
              <span className="text-[11px] text-secondary font-bold">MH</span>
            </div>
          </div>

          {/* District */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-primary">
              {isMr ? 'जिल्हा' : 'District'}
            </label>
            <div className="relative">
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-3.5 py-2.5 text-xs text-primary font-medium focus:ring-1 focus:ring-secondary focus:outline-none appearance-none"
              >
                <option value="Kolhapur">Kolhapur (कोल्हापूर)</option>
                <option value="Sangli">Sangli (सांगली)</option>
                <option value="Satara">Satara (सातारा)</option>
                <option value="Pune">Pune (पुणे)</option>
                <option value="Solapur">Solapur (सोलापूर)</option>
              </select>
              <span className="material-symbols-outlined text-[18px] text-on-surface-variant absolute right-3 top-2.5 pointer-events-none">
                expand_more
              </span>
            </div>
          </div>

          {/* Taluka */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-primary">
              {isMr ? 'तालुका' : 'Taluka'}
            </label>
            <div className="relative">
              <select
                value={taluka}
                onChange={(e) => setTaluka(e.target.value)}
                className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-3.5 py-2.5 text-xs text-primary font-medium focus:ring-1 focus:ring-secondary focus:outline-none appearance-none"
              >
                <option value="Radhanagari">राधानगरी / Radhanagari</option>
                <option value="Karveer">करवीर / Karveer</option>
                <option value="Hatkanangale">हातकणंगले / Hatkanangale</option>
                <option value="Kagal">कागल / Kagal</option>
                <option value="Panhala">पन्हाळा / Panhala</option>
              </select>
              <span className="material-symbols-outlined text-[18px] text-on-surface-variant absolute right-3 top-2.5 pointer-events-none">
                expand_more
              </span>
            </div>
          </div>

          {/* Village */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-primary">
              {isMr ? 'गाव' : 'Village'}
            </label>
            <div className="relative">
              <select
                value={village}
                onChange={(e) => setVillage(e.target.value)}
                className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-3.5 py-2.5 text-xs text-primary font-medium focus:ring-1 focus:ring-secondary focus:outline-none appearance-none"
              >
                <option value="Shiroli">शिरोली / Shiroli</option>
                <option value="Radhanagari">राधानगरी / Radhanagari</option>
                <option value="Tarale">तारळे / Tarale</option>
                <option value="Kasaba Tarale">कसबा तारळे / Kasaba Tarale</option>
                <option value="Kauravwadi">कौरववाडी / Kauravwadi</option>
              </select>
              <span className="material-symbols-outlined text-[18px] text-on-surface-variant absolute right-3 top-2.5 pointer-events-none">
                expand_more
              </span>
            </div>
          </div>

          {/* Panchayat */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-primary">
              {isMr ? 'ग्रामपंचायत' : 'Gram Panchayat'}
            </label>
            <div className="relative">
              <select
                value={panchayat}
                onChange={(e) => setPanchayat(e.target.value)}
                className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-3.5 py-2.5 text-xs text-primary font-medium focus:ring-1 focus:ring-secondary focus:outline-none appearance-none"
              >
                <option value="Shiroli Gram Panchayat">
                  शिरोली ग्रामपंचायत / Shiroli Gram Panchayat
                </option>
                <option value="Radhanagari Gram Panchayat">
                  राधानगरी ग्रामपंचायत / Radhanagari Gram Panchayat
                </option>
                <option value="Tarale Gram Panchayat">
                  तारळे ग्रामपंचायत / Tarale Gram Panchayat
                </option>
              </select>
              <span className="material-symbols-outlined text-[18px] text-on-surface-variant absolute right-3 top-2.5 pointer-events-none">
                expand_more
              </span>
            </div>
          </div>
        </section>
      </div>

      {/* Fixed Bottom Continue CTA */}
      <footer className="fixed bottom-0 inset-x-0 p-5 bg-surface/95 backdrop-blur-md border-t border-outline-variant/20 z-40 max-w-md mx-auto">
        <button
          onClick={handleContinueClick}
          className="w-full h-14 bg-primary-container hover:bg-primary rounded-2xl flex items-center justify-center gap-2 text-white font-bold text-sm shadow-md active:scale-[0.98] transition-all"
        >
          <span>{isMr ? 'पुढे चला / Continue' : 'Continue'}</span>
          <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
        </button>
      </footer>
    </div>
  );
};
