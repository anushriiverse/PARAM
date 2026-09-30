import React, { useState } from 'react';
import { AppLanguage, AppScreen } from '../types';
import { CropScannerModal } from '../components/CropScannerModal';
import { RICE_DISEASE_IMAGE } from '../data/mockData';
import { playSpeech } from '../utils/audio';
import { useAgromet } from '../context/AgrometContext';

interface AlertDetailsScreenProps {
  onBack: () => void;
  onNavigate: (screen: AppScreen) => void;
  language: AppLanguage;
}

export const AlertDetailsScreen: React.FC<AlertDetailsScreenProps> = ({
  onBack,
  language,
}) => {
  const isMr = language === 'mr';
  const { prediction } = useAgromet();
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  const handleAudioAlert = () => {
    if (isMr) {
      playSpeech(
        'धोका सूचना: जास्त आर्द्रता व ढगाळ हवामानामुळे भातावर करपा रोगाचा तीव्र धोका निर्माण झाला आहे. प्रतिबंधासाठी ट्रायसायक्लॅझोल फवारणीची शिफारस करण्यात येत आहे.',
        'mr'
      );
    } else {
      playSpeech(
        'High Risk Alert: Rice Blast & Sheath Blight risk elevated due to 78% relative humidity and overcast skies. Recommend preventative spray of Tricyclazole 75 WP.',
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
              <h1 className="font-headline-sm text-headline-sm font-bold text-error flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[20px]">warning</span>
                <span>{isMr ? 'रोग अनुकूल धोका सूचना' : 'Disease Conducive Risk'}</span>
              </h1>
              <span className="text-[11px] text-on-surface-variant">
                {prediction ? `${prediction.name}, ${prediction.state}` : (isMr ? 'सजणी, महाराष्ट्र' : 'Sajani, MH')} • {isMr ? 'उच्च धोका' : 'High Risk'}
              </span>
            </div>
          </div>

          <button
            onClick={handleAudioAlert}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-error text-white text-xs font-bold shadow-xs active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[16px]">volume_up</span>
            <span>{isMr ? 'ऐका' : 'Listen'}</span>
          </button>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 px-5 pt-20 pb-36 space-y-4">
        {/* Severity Banner */}
        <section className="p-4 rounded-3xl bg-error-container text-on-error-container border border-error/40 shadow-sm flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="px-3 py-0.5 rounded-full bg-error text-white text-xs font-bold uppercase tracking-wider">
              {isMr ? 'तीव्र धोका (HIGH RISK)' : 'HIGH SEVERITY ALERT'}
            </span>
            <span className="text-xs font-semibold text-error">
              {isMr ? 'सक्रिय: पुढील ४८ तास' : 'Active next 48 hours'}
            </span>
          </div>
          <h2 className="text-lg font-bold text-error">
            {isMr
              ? 'भात करपा रोग व खोडकुज (Rice Blast & Sheath Blight)'
              : 'Rice Blast (Pyricularia oryzae) & Sheath Blight'}
          </h2>
          <p className="text-xs text-on-error-container leading-relaxed">
            {isMr
              ? 'सध्याचे तापमान (२४-२८°C) आणि ७८% सापेक्ष आर्द्रता यांमुळे करपा रोगाच्या बीजाणूंचा प्रादुर्भाव वाढण्याची अत्यंत अनुकूल परिस्थिती निर्माण झाली आहे.'
              : 'Persistent 78% relative humidity combined with intermittent overcast drizzle creates high microclimate pressure for blast spore sporulation.'}
          </p>
        </section>

        {/* Visual Symptom Identification Card */}
        <section className="rounded-3xl overflow-hidden bg-surface-container-lowest border border-outline-variant/30 shadow-xs flex flex-col">
          <div className="relative w-full h-44 bg-black overflow-hidden">
            <img
              src={RICE_DISEASE_IMAGE}
              alt="Rice Blast Symptoms"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent"></div>
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
              <span className="font-bold">
                {isMr ? 'पानांवरील करपा रोगाचे लांबट तपकिरी डाग' : 'Elliptical eye-shaped lesions with brown border'}
              </span>
              <button
                onClick={() => setIsScannerOpen(true)}
                className="px-3 py-1 rounded-xl bg-secondary-fixed text-primary font-bold flex items-center gap-1 shadow-sm active:scale-95"
              >
                <span className="material-symbols-outlined text-[16px]">camera</span>
                <span>{isMr ? 'पान स्कॅन करा' : 'Scan Leaf'}</span>
              </button>
            </div>
          </div>

          <div className="p-4 space-y-2">
            <h3 className="font-headline-sm text-headline-sm text-primary">
              {isMr ? 'रोग लक्षणे कशी ओळखावीत?' : 'Diagnostic Symptoms to Inspect'}
            </h3>
            <ul className="text-xs text-on-surface-variant space-y-1.5 list-disc list-inside">
              <li>
                {isMr
                  ? 'पानांवर डोळ्याच्या आकाराचे, मध्यभागी राखाडी आणि कडेला तपकिरी रंगाचे डाग दिसतात.'
                  : 'Spindle-shaped elliptical spots on leaves with ash-gray center and dark reddish-brown margins.'}
              </li>
              <li>
                {isMr
                  ? 'खोड व पानाच्या बेचक्यात पाणी साचल्यासारखे मऊ डाग पडतात.'
                  : 'Water-soaked greenish lesions on leaf sheaths near water line (sheath blight).'}
              </li>
            </ul>
          </div>
        </section>

        {/* Recommended Chemical & Cultural Management */}
        <section className="space-y-3">
          <h3 className="font-headline-sm text-headline-sm text-primary flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[20px] text-secondary">
              verified_user
            </span>
            <span>{isMr ? 'तातडीच्या उपाययोजना व फवारणी शिफारस' : 'Immediate Management & Sprays'}</span>
          </h3>

          {/* Chemical Spray 1 */}
          <div className="p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-xs space-y-1.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-primary">
                {isMr ? '१. ट्रायसायक्लॅझोल ७५% WP (प्रतिबंधक)' : '1. Tricyclazole 75 WP (Fungicide)'}
              </h4>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-bold">
                Recommended
              </span>
            </div>
            <p className="text-xs text-on-surface-variant">
              <strong>{isMr ? 'प्रमाण:' : 'Dosage:'}</strong> 0.6 g / liter water (120 g per acre in 200 liters of water).
            </p>
            <p className="text-[11px] text-on-surface-variant">
              {isMr
                ? 'उद्याच्या पावसापूर्वी किंवा पाऊस थांबल्यावर पाने सुकल्यावर त्वरित फवारणी करावी.'
                : 'Apply before tomorrow’s rains or right after rain clears and leaf surface dries.'}
            </p>
          </div>

          {/* Chemical Spray 2 */}
          <div className="p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-xs space-y-1.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-primary">
                {isMr ? '२. अझोक्सीस्ट्रोबिन + डायफेनोकोनॅझोल' : '2. Azoxystrobin 18.2% + Difenoconazole 11.4%'}
              </h4>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-bold">
                Curative
              </span>
            </div>
            <p className="text-xs text-on-surface-variant">
              <strong>{isMr ? 'प्रमाण:' : 'Dosage:'}</strong> 1 ml / liter water (200 ml per acre).
            </p>
          </div>

          {/* Cultural Practices */}
          <div className="p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-xs space-y-1.5">
            <h4 className="text-xs font-bold text-primary">
              {isMr ? '३. शेती कामे खबरदारी' : '3. Cultural Precautions'}
            </h4>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              {isMr
                ? 'अतिरिक्त युरिया खताचा वापर टाळावा. शेतात पाणी जास्त काळ साचून राहू देऊ नये.'
                : 'Suspend top-dressing of pure nitrogen until infection clears. Excessive nitrogen makes leaves succulent and prone to fungal attack.'}
            </p>
          </div>
        </section>
      </main>

      {/* Sticky Bottom Actions */}
      <footer className="fixed bottom-0 inset-x-0 p-5 bg-surface/95 backdrop-blur-md border-t border-outline-variant/30 z-40 max-w-md mx-auto flex gap-2.5">
        <button
          onClick={() => setIsScannerOpen(true)}
          className="flex-1 h-14 rounded-2xl bg-secondary text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-[0.98] transition-all cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">photo_camera</span>
          <span>{isMr ? 'कॅमेऱ्याने पान तपासा' : 'Diagnose Leaf with AI'}</span>
        </button>

        <a
          href="tel:18001801551"
          className="h-14 px-4 rounded-2xl bg-primary-container text-on-primary font-bold text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-[0.98] transition-all"
        >
          <span className="material-symbols-outlined text-[18px]">call</span>
          <span>{isMr ? 'कृषी सल्लागार कॉल' : 'Call Expert'}</span>
        </a>
      </footer>

      {/* Scanner Modal */}
      <CropScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        language={language}
      />
    </div>
  );
};
