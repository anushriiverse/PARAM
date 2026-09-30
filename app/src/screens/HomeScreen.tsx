import { useAgromet } from '../context/AgrometContext';
import React, { useState } from 'react';
import { AppLanguage, AppScreen, FarmerProfile } from '../types';
import { Header } from '../components/Header';
import { BottomNav } from '../components/BottomNav';
import { CropScannerModal } from '../components/CropScannerModal';
import { MandiRatesModal } from '../components/MandiRatesModal';
import { playSpeech } from '../utils/audio';

interface HomeScreenProps {
  farmerProfile: FarmerProfile;
  language: AppLanguage;
  onNavigate: (screen: AppScreen) => void;
  onToggleLanguage: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  farmerProfile,
  language,
  onNavigate,
  onToggleLanguage,
}) => {
  const isMr = language === 'mr';
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isMandiOpen, setIsMandiOpen] = useState(false);
  const { prediction } = useAgromet();

  // Extract farmer first name or full name
  const farmerDisplayName = farmerProfile.name || (isMr ? 'राजेश पाटील' : 'Rajesh Patil');

  const handleAudioGreeting = () => {
    if (isMr) {
      playSpeech(
        `नमस्ते ${farmerDisplayName}. ${prediction ? prediction.name : 'सजणी'}मध्ये आज अंशतः ढगाळ हवामान राहील. दुपारपर्यंत खत देणे सोयीचे ठरेल.`,
        'mr'
      );
    } else {
      playSpeech(
        `Namaste ${farmerDisplayName}. In ${prediction ? prediction.name : 'Sajani'}, expect partly cloudy skies today with 28 degrees Celsius. Please apply fertilizers before 2 PM.`,
        'en'
      );
    }
  };

  const handleAudioAdvisory = () => {
    if (isMr) {
      playSpeech(
        'आजचा शेती सल्ला: शाकीय वाढीसाठी अनुकूल हवामान. दुपारी २:०० वाजेपूर्वी खत देणे योग्य ठरेल. संध्याकाळी पावसाची शक्यता असल्याने फवारणी टाळावी.',
        'mr'
      );
    } else {
      playSpeech(
        "Today's Farm Advisory: Favorable conditions for vegetative growth. Ideal window for fertilizer application before 2:00 PM. Avoid pesticide spraying this evening due to expected gusty showers.",
        'en'
      );
    }
  };

  return (
    <div className="relative w-full min-h-screen bg-surface flex flex-col justify-between overflow-x-hidden text-on-surface">
      {/* Header */}
      <Header
        title={isMr ? 'PARAM | परम' : 'PARAM'}
        subtitle={prediction ? `${prediction.name}, ${prediction.state}` : 'Sajani, MH'}
        badge="PARAM"
        language={language}
        onToggleLanguage={onToggleLanguage}
        onOpenProfile={() => onNavigate('farmer_profile')}
        onOpenNotifications={() => onNavigate('alerts')}
        farmerProfile={farmerProfile}
      />

      {/* Main Body */}
      <main className="flex-1 w-full pt-16 pb-24">
        {/* Top Hero Landscape Banner */}
        <div className="relative w-full overflow-hidden mb-2">
          {/* Background image & gradient */}
          <div className="absolute inset-0 z-0">
            <img
              alt="Maharashtra landscape"
              className="w-full h-full object-cover object-center"
              src="https://lh3.googleusercontent.com/aida/AEtjO1VYXGhrza3RdSj1FIVs2Hg6S0EoI-xgT9VmH5xJkruKTmceZx3BlAuk0wgMPL3DdwOet2cPOCNG3Cps3L058eT0bou7ypUmXBpEdFfh0OdWgYlEpSmwcjzig2Ih2O0CfcPvOom_6LpjeKpZ_npJnBDutL_scqJJ9N8-tth5iUL2OqJjCIbiyCsFa6O6tXmGCg_RGKhbRq2_YyvYTUx1GuIgYFlB5A0SRGcDRFDBOgyxL10PGvdriiXEqQg"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-surface via-primary/75 to-primary/90"></div>
          </div>

          <div className="relative z-10 px-5 pt-4 pb-4 flex flex-col gap-4">
            {/* Greeting Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-lg shadow-sm shrink-0">
                    👨‍🌾
                  </span>
                  <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-white tracking-tight">
                    {isMr ? 'नमस्ते,' : 'Namaste,'}
                    <span className="block mt-0.5 text-secondary-fixed">{farmerDisplayName}</span>
                  </h1>
                </div>
                <div className="flex items-center gap-1 mt-1 text-surface-bright/90">
                  <span className="material-symbols-outlined text-[16px] text-secondary-fixed">
                    location_on
                  </span>
                  <span className="text-xs truncate">
                    {prediction ? `${prediction.name}, ${prediction.state}` : 'Sajani, MH'}
                  </span>
                </div>
              </div>

              <button
                onClick={handleAudioGreeting}
                aria-label="Listen audio guidance"
                className="h-9 px-3 rounded-full bg-tertiary-fixed text-on-tertiary-fixed-variant text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition-all shrink-0 mt-1"
              >
                <span className="material-symbols-outlined text-[16px] text-on-tertiary-container animate-pulse">
                  volume_up
                </span>
                <span className="font-bold">{isMr ? 'ऐका' : 'Listen'}</span>
              </button>
            </div>

            {/* Live Telemetry Weather Card */}
            <section className="relative rounded-2xl overflow-hidden bg-primary-container/95 border border-primary-fixed/20 shadow-xl text-on-primary backdrop-blur-md p-4 flex flex-col gap-3.5">
              <div className="text-xs text-surface-bright/70 font-medium">
                Model output · seasonal mean (JJAS)
              </div>

              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold tracking-tighter text-white">{prediction ? `${prediction.temp_c.toFixed(1)}°` : "28°"}</span>
                    <span className="text-lg text-secondary-fixed font-bold">C</span>
                  </div>
                  <span className="text-xs text-surface-bright/80 font-medium">seasonal mean (JJAS)</span>
                  <p className="text-sm font-semibold text-surface-bright flex items-center gap-1.5 mt-0.5">
                    {isMr ? 'अंशतः ढगाळ' : 'Partly Cloudy'}
                  </p>
                </div>
                <div className="w-14 h-14 rounded-full bg-white/15 border border-white/20 backdrop-blur-md flex items-center justify-center shadow-inner">
                  <span
                    className="material-symbols-outlined text-[32px] text-tertiary-fixed-dim"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    partly_cloudy_day
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-1">
                <div className="bg-white/10 rounded-xl p-2.5 flex flex-col items-center text-center border border-white/10">
                  <span className="material-symbols-outlined text-[18px] text-secondary-fixed">
                    humidity_percentage
                  </span>
                  <span className="text-[11px] text-surface-bright/90 mt-0.5">
                    {isMr ? 'आर्द्रता (DEMO)' : 'Humidity (DEMO)'}
                  </span>
                  <span className="text-sm font-bold text-white">78%</span>
                </div>
                <div className="bg-white/10 rounded-xl p-2.5 flex flex-col items-center text-center border border-white/10">
                  <span className="material-symbols-outlined text-[18px] text-secondary-fixed">
                    air
                  </span>
                  <span className="text-[11px] text-surface-bright/90 mt-0.5">
                    {isMr ? 'वारा (DEMO)' : 'Wind (DEMO)'}
                  </span>
                  <span className="text-sm font-bold text-white">12 km/h</span>
                </div>
                <div className="bg-white/10 rounded-xl p-2.5 flex flex-col items-center text-center border border-white/10">
                  <span className="material-symbols-outlined text-[18px] text-tertiary-fixed-dim">
                    rainy
                  </span>
                  <span className="text-[11px] text-surface-bright/90 mt-0.5">
                    {isMr ? 'पाऊस शक्यता (DEMO)' : 'Rain Chance (DEMO)'}
                  </span>
                  <span className="text-sm font-bold text-tertiary-fixed">65%</span>
                </div>
              </div>

              {/* View 7-Day Forecast & Rain Window CTA */}
              <button
                onClick={() => onNavigate('weather')}
                className="mt-1 w-full inline-flex items-center justify-between px-4 py-2.5 rounded-xl bg-white/20 hover:bg-white/25 transition-colors text-xs font-bold text-surface-bright active:scale-[0.99]"
              >
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">calendar_view_week</span>
                  <span>
                    {isMr
                      ? '७ दिवसांचा सविस्तर हवामान अंदाज पहा'
                      : 'View 7-Day Forecast & Rain Window'}
                  </span>
                </span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </section>
          </div>
        </div>

        {/* Body Content Container */}
        <div className="px-5 flex flex-col gap-4 pb-6">
          {/* Today's Farm Advisory Card */}
          <section className="rounded-2xl p-4 bg-surface-container-lowest shadow-sm border border-outline-variant/30 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-7 h-7 rounded-full bg-tertiary-fixed flex items-center justify-center text-on-tertiary-fixed-variant">
                  <span className="material-symbols-outlined text-[16px]">psychology_alt</span>
                </span>
                <h2 className="font-headline-sm text-headline-sm text-primary flex items-center gap-1">
                  <span>{isMr ? 'आजचा शेती सल्ला' : "Today's Farm Advisory"}</span>
                  <span className="text-on-tertiary-container">⭐</span>
                </h2>
              </div>

              <button
                onClick={handleAudioAdvisory}
                className="px-2.5 py-1.5 rounded-full bg-on-tertiary-container text-on-tertiary flex items-center gap-1 shadow-xs active:scale-95 transition-all text-xs font-bold"
              >
                <span className="material-symbols-outlined text-[16px]">volume_up</span>
                <span>{isMr ? 'सल्ला ऐका' : 'Listen Advisory'}</span>
              </button>
            </div>

            <p className="text-xs text-on-surface-variant leading-relaxed">
              {isMr
                ? 'शाकीय वाढीसाठी अत्यंत अनुकूल हवामान. दुपारी २:०० वाजेपूर्वी खत देणे योग्य ठरेल. संध्याकाळी वादळी पावसाची शक्यता असल्याने कीटकनाशक फवारणी टाळावी.'
                : 'Favorable conditions for vegetative growth. Ideal window for fertilizer application before 2:00 PM. Avoid pesticide spraying this evening due to expected gusty showers.'}
            </p>

            <div className="flex items-center gap-2 pt-1 flex-wrap">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container text-xs font-bold">
                <span className="material-symbols-outlined text-[14px]">check_circle</span>
                {isMr ? 'खत देणे योग्य ✓' : 'Fertilizer Safe ✓'}
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed-variant text-xs font-bold">
                <span className="material-symbols-outlined text-[14px]">warning</span>
                {isMr ? 'फवारणी सावधगिरी ⚠️' : 'Spray Warning ⚠️'}
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-surface-container text-on-surface-variant text-xs font-medium">
                {isMr ? 'जमिनीचे तापमान: २४°C' : 'Soil Temp: 24°C'}
              </span>
            </div>
          </section>

          {/* Severe Weather Alert Card */}
          <section className="rounded-2xl p-4 bg-error-container/80 text-on-error-container shadow-sm border border-error/20 flex flex-col gap-2.5">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-error text-on-error flex items-center justify-center shrink-0 shadow-xs">
                <span className="material-symbols-outlined text-[20px]">thunderstorm</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-xs tracking-wider uppercase font-bold text-error">
                    {isMr ? 'हवामान इशारा' : 'Severe Weather Alert'}
                  </span>
                  <span className="text-[11px] text-error font-semibold">
                    {isMr ? 'उद्या दुपारी १:००' : 'Tomorrow 1:00 PM'}
                  </span>
                </div>
                <p className="text-xs text-on-error-container mt-1 font-medium leading-relaxed">
                  {isMr
                    ? `${prediction ? prediction.name : 'सजणी'} परिसरात उद्या दुपारी मध्यम ते मुसळधार वादळी पावसाची शक्यता. शेतात पाणी साचू नये म्हणून चारी काढावी.`
                    : `Moderate to Heavy Thunderstorms expected tomorrow afternoon across ${prediction ? `${prediction.name}, ${prediction.state}` : 'Sajani, MH'}. Secure harvested produce and clear farm drainage channels.`}
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                onClick={() => onNavigate('alerts')}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-surface-container-lowest text-on-error-container text-xs font-bold shadow-xs hover:bg-surface-container active:scale-95 transition-all"
              >
                <span>{isMr ? 'मार्गदर्शक सूचना पहा' : 'View Safety Guidelines'}</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>
          </section>

          {/* Quick Actions Grid */}
          <section className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <h2 className="font-headline-sm text-headline-sm text-primary tracking-tight">
                {isMr ? 'जलद साधने (Quick Actions)' : 'Quick Actions'}
              </h2>
              <span className="text-xs text-on-surface-variant font-medium">
                {isMr ? 'त्वरित मदत' : 'Instant Tools'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {/* Leaf Scan / Doctor (Span 2) */}
              <button
                onClick={() => setIsScannerOpen(true)}
                className="col-span-2 p-3.5 rounded-2xl bg-primary-container text-on-primary flex items-center justify-between shadow-sm active:scale-[0.99] transition-transform cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-secondary-fixed text-primary-container flex items-center justify-center shadow-xs shrink-0">
                    <span className="material-symbols-outlined text-[24px]">photo_camera</span>
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-sm font-bold text-surface-bright leading-tight">
                      📸 {isMr ? 'पीक डॉक्टर / पान स्कॅन' : 'Crop Doctor / Leaf Scan'}
                    </span>
                    <span className="text-xs text-on-primary-container mt-0.5">
                      {isMr ? 'रोग व कीड त्वरित ओळखा' : 'Diagnose pests & leaf rust instantly'}
                    </span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-surface-bright text-[20px]">
                  chevron_right
                </span>
              </button>

              {/* Spray Window Advisor */}
              <button
                onClick={() => onNavigate('weather')}
                className="p-3 rounded-2xl bg-surface-container-lowest shadow-xs border border-outline-variant/30 flex flex-col gap-2 text-left active:bg-surface-container transition-colors cursor-pointer"
              >
                <div className="w-9 h-9 rounded-xl bg-surface-container flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[20px]">water_drop</span>
                </div>
                <div>
                  <span className="text-xs font-bold text-on-surface block leading-snug">
                    💧 {isMr ? 'फवारणी वेळ' : 'Spray Window'}
                  </span>
                  <span className="text-[11px] text-on-surface-variant">
                    {isMr ? 'वारा व पाऊस रडार' : 'Wind & rain radar'}
                  </span>
                </div>
              </button>

              {/* Mandi Market Rates */}
              <button
                onClick={() => setIsMandiOpen(true)}
                className="p-3 rounded-2xl bg-surface-container-lowest shadow-xs border border-outline-variant/30 flex flex-col gap-2 text-left active:bg-surface-container transition-colors cursor-pointer"
              >
                <div className="w-9 h-9 rounded-xl bg-tertiary-fixed flex items-center justify-center text-on-tertiary-fixed-variant">
                  <span className="material-symbols-outlined text-[20px]">query_stats</span>
                </div>
                <div>
                  <span className="text-xs font-bold text-on-surface block leading-snug">
                    🌾 {isMr ? 'बाजार भाव' : 'Mandi Rates'}
                  </span>
                  <span className="text-[11px] text-on-surface-variant">
                    {isMr ? 'कोल्हापूर व सांगली' : 'Kolhapur & Sangli'}
                  </span>
                </div>
              </button>

              {/* Govt Schemes */}
              <button
                onClick={() => {
                  alert(
                    isMr
                      ? 'पीएम-किसान आणि महाडीबीटी योजना: पात्र शेतकऱ्यांना पुढील हप्ता लवकरच वितरित केला जाईल.'
                      : 'Govt Schemes: PM-Kisan & MahaDBT portal integration active. Check eligibility in portal.'
                  );
                }}
                className="p-3 rounded-2xl bg-surface-container-lowest shadow-xs border border-outline-variant/30 flex flex-col gap-2 text-left active:bg-surface-container transition-colors cursor-pointer"
              >
                <div className="w-9 h-9 rounded-xl bg-surface-container flex items-center justify-center text-secondary">
                  <span className="material-symbols-outlined text-[20px]">account_balance</span>
                </div>
                <div>
                  <span className="text-xs font-bold text-on-surface block leading-snug">
                    🏛️ {isMr ? 'शासकीय योजना' : 'Govt Schemes'}
                  </span>
                  <span className="text-[11px] text-on-surface-variant">
                    PM-Kisan & MahaDBT
                  </span>
                </div>
              </button>

              {/* Kisan Call Center */}
              <a
                href="tel:18001801551"
                className="p-3 rounded-2xl bg-surface-container-lowest shadow-xs border border-outline-variant/30 flex flex-col gap-2 text-left active:bg-surface-container transition-colors"
              >
                <div className="w-9 h-9 rounded-xl bg-secondary-container flex items-center justify-center text-on-secondary-container">
                  <span className="material-symbols-outlined text-[20px]">support_agent</span>
                </div>
                <div>
                  <span className="text-xs font-bold text-on-surface block leading-snug">
                    📞 {isMr ? 'किसान कॉल सेंटर' : 'Kisan Call Center'}
                  </span>
                  <span className="text-[11px] text-on-surface-variant">
                    {isMr ? 'कृषी तज्ज्ञ सल्ला' : 'Toll-free Agronomist'}
                  </span>
                </div>
              </a>
            </div>
          </section>

          {/* 7-Day Weather Preview (Horizontal Swipeable Strip) */}
          <section className="flex flex-col gap-2 pt-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-lg">🌦️</span>
                <h2 className="font-headline-sm text-headline-sm text-primary tracking-tight">
                  {isMr ? '७ दिवसांचा हवामान अंदाज' : '7-Day Weather Preview'}
                </h2>
              </div>
              <button
                onClick={() => onNavigate('weather')}
                className="text-xs text-secondary font-bold hover:underline"
              >
                {isMr ? 'सर्व दिवस →' : 'Swipe horizontally →'}
              </button>
            </div>

            {/* Clickable horizontal cards */}
            <div
              onClick={() => onNavigate('weather')}
              className="flex gap-2.5 overflow-x-auto pb-2 pt-1 -mx-5 px-5 scroll-smooth no-scrollbar cursor-pointer"
              title="Click to view detailed 7-day weather forecast"
            >
              {/* Mon (Today) */}
              <div className="min-w-[108px] p-3 rounded-2xl bg-primary-container text-on-primary shadow-xs flex flex-col items-center text-center shrink-0 hover:scale-[1.02] transition-transform">
                <span className="text-[11px] text-secondary-fixed uppercase font-bold">
                  {isMr ? 'सोमवार (आज)' : 'Mon (Today)'}
                </span>
                <span className="text-2xl my-1">⛅</span>
                <span className="text-sm font-bold text-surface-bright">28° / 22°</span>
                <span className="text-[11px] text-on-primary-container mt-1 truncate max-w-[90px]">
                  {isMr ? 'अंशतः ढगाळ' : 'Partly Cloudy'}
                </span>
                <span className="text-[10px] font-semibold text-secondary-fixed mt-0.5">
                  Rain: 65%
                </span>
              </div>

              {/* Tue (Alert) */}
              <div className="min-w-[108px] p-3 rounded-2xl bg-error-container text-on-error-container shadow-xs flex flex-col items-center text-center shrink-0 hover:scale-[1.02] transition-transform">
                <span className="text-[11px] text-error uppercase font-bold">
                  {isMr ? 'मंगळवार ⚠️' : 'Tue ⚠️'}
                </span>
                <span className="text-2xl my-1">⛈️</span>
                <span className="text-sm font-bold text-on-error-container">26° / 21°</span>
                <span className="text-[11px] text-on-error-container mt-1 font-bold truncate max-w-[90px]">
                  {isMr ? 'वादळी पाऊस' : 'Thunderstorm'}
                </span>
                <span className="text-[10px] font-bold text-error mt-0.5">Rain: 85%</span>
              </div>

              {/* Wed */}
              <div className="min-w-[108px] p-3 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-xs flex flex-col items-center text-center shrink-0 hover:scale-[1.02] transition-transform">
                <span className="text-[11px] text-on-surface-variant uppercase font-bold">
                  {isMr ? 'बुधवार' : 'Wed'}
                </span>
                <span className="text-2xl my-1">🌦️</span>
                <span className="text-sm font-bold text-primary">27° / 22°</span>
                <span className="text-[11px] text-on-surface-variant mt-1 truncate max-w-[90px]">
                  {isMr ? 'हलका पाऊस' : 'Light Rain'}
                </span>
                <span className="text-[10px] font-semibold text-on-tertiary-container mt-0.5">
                  Rain: 40%
                </span>
              </div>

              {/* Thu */}
              <div className="min-w-[108px] p-3 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-xs flex flex-col items-center text-center shrink-0 hover:scale-[1.02] transition-transform">
                <span className="text-[11px] text-on-surface-variant uppercase font-bold">
                  {isMr ? 'गुरुवार' : 'Thu'}
                </span>
                <span className="text-2xl my-1">🌤️</span>
                <span className="text-sm font-bold text-primary">29° / 23°</span>
                <span className="text-[11px] text-on-surface-variant mt-1 truncate max-w-[90px]">
                  {isMr ? 'सूर्यप्रकाश' : 'Sunny Intervals'}
                </span>
                <span className="text-[10px] font-semibold text-secondary mt-0.5">Rain: 15%</span>
              </div>

              {/* Fri */}
              <div className="min-w-[108px] p-3 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-xs flex flex-col items-center text-center shrink-0 hover:scale-[1.02] transition-transform">
                <span className="text-[11px] text-on-surface-variant uppercase font-bold">
                  {isMr ? 'शुक्रवार' : 'Fri'}
                </span>
                <span className="text-2xl my-1">☀️</span>
                <span className="text-sm font-bold text-primary">30° / 22°</span>
                <span className="text-[11px] text-on-surface-variant mt-1 truncate max-w-[90px]">
                  {isMr ? 'स्वच्छ ऊन' : 'Sunny'}
                </span>
                <span className="text-[10px] font-semibold text-secondary mt-0.5">Rain: 5%</span>
              </div>
            </div>
          </section>

          {/* Satellite Drone Pass Card */}
          <section className="rounded-2xl overflow-hidden bg-surface-container-lowest border border-outline-variant/30 shadow-xs flex flex-col">
            <div
              className="relative w-full h-36 bg-cover bg-center"
              style={{
                backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuATTeaR3c82IveH_c4kPytJBqr3vcmpXxn_Sg2-zl7hjJKM6u0JMsz0KXs3vapJswtdUjhbh58_VfBx_mcWB1F0-4Www4LdKGBhGqrkWhtTd-zcHMqOJ2wHSSBRTYXv_EXeke-j8yiCKLIEba93zhHgSxY55xOTqfT2PW0fpRBUR277i9elWWoftlYgdu6v_BfUypinuyoR5nlT8QD3UnTVrBHwlIuMW6z1Sew0eeeQNB5tg_bCxtxW')`,
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-primary/85 via-primary/30 to-transparent"></div>
              <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full bg-white/85 backdrop-blur-md flex items-center gap-1.5 text-xs text-primary font-bold shadow-xs">
                <span className="material-symbols-outlined text-[15px] text-secondary">
                  satellite_alt
                </span>
                <span>{isMr ? 'उपग्रह ड्रोन सर्वेक्षण' : `${prediction ? prediction.name : 'Sajani'} Satellite Drone Pass`}</span>
              </div>
              <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white text-xs">
                <span className="font-semibold">
                  {isMr ? 'वनस्पती निर्देशांक (NDVI): ०.८४ - उत्तम' : 'Vegetative Index (NDVI): 0.84 - Vigorous'}
                </span>
                <span className="px-2 py-0.5 rounded bg-secondary text-white font-bold text-[11px]">
                  Field Pass A1
                </span>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNav currentScreen="home" onNavigate={onNavigate} language={language} alertCount={3} />

      {/* Leaf Scanner Modal */}
      <CropScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        language={language}
        onViewAlertDetails={() => onNavigate('alerts')}
      />

      {/* Mandi Rates Modal */}
      <MandiRatesModal
        isOpen={isMandiOpen}
        onClose={() => setIsMandiOpen(false)}
        language={language}
      />
    </div>
  );
};
