import React, { useState } from 'react';
import { AppLanguage, CropItem } from '../types';
import { playSpeech } from '../utils/audio';
import { RICE_FIELD_IMAGE, WHEAT_FIELD_IMAGE, SOYBEAN_FIELD_IMAGE, SUGARCANE_FIELD_IMAGE } from '../data/mockData';

interface AddCropScreenProps {
  crops: CropItem[];
  onAddOrUpdateCrop: (crop: CropItem) => void;
  onContinueToHome: () => void;
  onBack: () => void;
  language: AppLanguage;
  isInitialOnboarding?: boolean;
}

export const AddCropScreen: React.FC<AddCropScreenProps> = ({
  crops,
  onAddOrUpdateCrop,
  onContinueToHome,
  onBack,
  language,
  isInitialOnboarding = false,
}) => {
  const isMr = language === 'mr';

  const [mode, setMode] = useState<'add' | 'edit'>('add');
  const [selectedCropType, setSelectedCropType] = useState<string>('rice');
  const [sowingDate, setSowingDate] = useState<string>('2026-08-15');
  const [selectedStage, setSelectedStage] = useState<string>('vegetative');
  const [plotName, setPlotName] = useState<string>('North Field (Radhanagari Plot 1)');
  const [area, setArea] = useState<number>(2.5);
  const [soilType, setSoilType] = useState<string>('Medium Black Clay');
  const [irrigationSource, setIrrigationSource] = useState<string>('Canal + Borewell');
  const [isFarmDetailsOpen, setIsFarmDetailsOpen] = useState(false);

  // Calculate days elapsed from sowing date
  const calculateDaysAgo = (dateStr: string) => {
    try {
      const sowing = new Date(dateStr);
      const now = new Date('2026-09-08');
      const diffMs = now.getTime() - sowing.getTime();
      const days = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
      return days;
    } catch {
      return 24;
    }
  };

  const daysAgo = calculateDaysAgo(sowingDate);

  const formattedDate = new Date(sowingDate).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const availableCropTiles = [
    {
      id: 'rice',
      nameEn: 'Rice',
      nameMr: 'भात',
      subEn: 'Paddy',
      subMr: 'इंद्रायणी',
      emoji: '🌾',
      varietyEn: 'Indrayani',
      varietyMr: 'इंद्रायणी',
      image: RICE_FIELD_IMAGE,
    },
    {
      id: 'wheat',
      nameEn: 'Wheat',
      nameMr: 'गहू',
      subEn: 'Grain',
      subMr: 'शरबती / लोकवन',
      emoji: '🌾',
      varietyEn: 'Lokwan (HD 2189)',
      varietyMr: 'लोकवन (एचडी २१८९)',
      image: WHEAT_FIELD_IMAGE,
    },
    {
      id: 'sugarcane',
      nameEn: 'Sugarcane',
      nameMr: 'ऊस',
      subEn: 'Cash crop',
      subMr: 'को ८६०३२',
      emoji: '🎋',
      varietyEn: 'Co 86032',
      varietyMr: 'को ८६०३२',
      image: SUGARCANE_FIELD_IMAGE,
    },
    {
      id: 'soybean',
      nameEn: 'Soybean',
      nameMr: 'सोयाबीन',
      subEn: 'Oilseed',
      subMr: 'जे.एस. ३३५',
      emoji: '🫘',
      varietyEn: 'JS-335',
      varietyMr: 'जे.एस. ३३५',
      image: SOYBEAN_FIELD_IMAGE,
    },
    {
      id: 'cotton',
      nameEn: 'Cotton',
      nameMr: 'कापूस',
      subEn: 'Fibre crop',
      subMr: 'बीटी कापूस',
      emoji: '🌱',
      varietyEn: 'Bt Cotton',
      varietyMr: 'बीटी',
      image: RICE_FIELD_IMAGE,
    },
    {
      id: 'groundnut',
      nameEn: 'Groundnut',
      nameMr: 'भुईमूग',
      subEn: 'Peanut',
      subMr: 'टीएजी २४',
      emoji: '🥜',
      varietyEn: 'TAG 24',
      varietyMr: 'टीएजी २४',
      image: RICE_FIELD_IMAGE,
    },
  ];

  const stages = [
    {
      id: 'sowing',
      titleEn: 'Sowing / Germination',
      titleMr: 'पेरणी / उगवण अवस्था',
      descEn: 'Seed sowing or transplanting (Day 0 - 7)',
      descMr: 'बियाणे पेरणी किंवा पुनर्लागवड (दिवस ० - ७)',
      emoji: '🌱',
    },
    {
      id: 'seedling',
      titleEn: 'Germination & Seedling',
      titleMr: 'उगवण व रोपावस्था',
      descEn: 'Sprouting & seedling establishment (Day 8 - 20)',
      descMr: 'रोप निर्मिती व प्राथमिक मुळे (दिवस ८ - २०)',
      emoji: '🌿',
    },
    {
      id: 'vegetative',
      titleEn: 'Vegetative Growth',
      titleMr: 'फुटवे व शाकीय वाढ',
      descEn: 'Rapid foliage & tiller development (Day 21 - 45)',
      descMr: 'जोमदार फुटवे व पानांची वाढ (दिवस २१ - ४५)',
      emoji: '🌾',
    },
    {
      id: 'flowering',
      titleEn: 'Flowering & Heading',
      titleMr: 'फुलोरा व कणसे बाहेर पडणे',
      descEn: 'Panicle emergence & blooming (Day 46 - 70)',
      descMr: 'कणीस निसवणे व परागीभवन (दिवस ४६ - ७०)',
      emoji: '🌼',
    },
    {
      id: 'grain',
      titleEn: 'Grain Formation / Filling',
      titleMr: 'दाणे भरणे व दुधाळ अवस्था',
      descEn: 'Milking & dough grain development (Day 71 - 95)',
      descMr: 'दुधाळ व टणक दाणे भरणे (दिवस ७१ - ९५)',
      emoji: '🫘',
    },
    {
      id: 'maturity',
      titleEn: 'Maturity / Harvest Ready',
      titleMr: 'पक्वता व काढणी तयार',
      descEn: 'Golden turn & ready for harvest (Day 96+)',
      descMr: 'सोनेरी रंग व काढणीस योग्य (दिवस ९६+)',
      emoji: '🚜',
    },
  ];

  const handleSaveCrop = () => {
    const selectedCropData = availableCropTiles.find((c) => c.id === selectedCropType);
    const selectedStageData = stages.find((s) => s.id === selectedStage);

    const newCrop: CropItem = {
      id: `${selectedCropType}-${Date.now()}`,
      nameEn: `${selectedCropData?.nameEn} (${selectedCropData?.varietyEn})`,
      nameMr: `${selectedCropData?.nameMr} (${selectedCropData?.varietyMr})`,
      varietyEn: selectedCropData?.varietyEn || 'Standard',
      varietyMr: selectedCropData?.varietyMr || 'प्रमाणित',
      plotNameEn: plotName,
      plotNameMr: isMr ? 'प्लॉट क्रमांक १' : plotName,
      acres: area,
      sowingDate,
      stageEn: selectedStageData?.titleEn || 'Vegetative Growth',
      stageMr: selectedStageData?.titleMr || 'शाकीय वाढ',
      stageProgress: selectedStage === 'vegetative' ? 27 : selectedStage === 'flowering' ? 50 : 70,
      currentDay: daysAgo || 28,
      totalDays: selectedCropType === 'sugarcane' ? 365 : selectedCropType === 'wheat' ? 115 : 105,
      statusBadgeEn: 'Active Monitored',
      statusBadgeMr: 'सक्रिय देखरेख',
      alertEn: 'Personalized advisory active based on sowing date',
      alertMr: 'पेरणी तारखेनुसार सल्ला सक्रिय',
      imageUrl: selectedCropData?.image || RICE_FIELD_IMAGE,
      isActiveForAdvisory: true,
    };

    onAddOrUpdateCrop(newCrop);
    onContinueToHome();
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
              <h1 className="font-headline-sm text-headline-sm text-primary font-bold">
                {isMr ? 'पीक जोडा (Add Crop)' : 'Add Crop'}
              </h1>
              <span className="text-[11px] text-on-surface-variant">
                {isInitialOnboarding
                  ? isMr
                    ? 'पाऊल २ • पीक नोंदणी'
                    : 'Step 2 • Crop Setup'
                  : isMr
                  ? 'माझी पिके'
                  : 'My Crops Management'}
              </span>
            </div>
          </div>

          <button
            onClick={() =>
              playSpeech(
                isMr
                  ? 'तुमचे पीक निवडा, पेरणीची तारीख आणि सद्य वाढीचा टप्पा निवडा.'
                  : 'Select your crop, sowing date and growth stage.',
                isMr ? 'mr' : 'en'
              )
            }
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed text-xs font-semibold shadow-xs active:scale-95"
          >
            <span className="material-symbols-outlined text-[16px] text-on-tertiary-fixed-variant">
              volume_up
            </span>
            <span>{isMr ? 'ऐका' : 'Listen'}</span>
          </button>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 px-5 pt-20 pb-36 space-y-5">
        {/* Mode switcher if not onboarding */}
        {!isInitialOnboarding && (
          <div className="flex items-center justify-between bg-surface-container p-1 rounded-full shadow-xs">
            <button
              onClick={() => setMode('add')}
              className={`flex-1 min-h-[38px] flex items-center justify-center gap-1.5 rounded-full font-label-md text-label-md transition-all ${
                mode === 'add'
                  ? 'bg-primary-container text-on-primary shadow-xs'
                  : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">add_circle</span>
              <span>{isMr ? 'नवीन पीक जोडा' : 'Add New Crop'}</span>
            </button>
            <button
              onClick={() => setMode('edit')}
              className={`flex-1 min-h-[38px] flex items-center justify-center gap-1.5 rounded-full font-label-md text-label-md transition-all ${
                mode === 'edit'
                  ? 'bg-primary-container text-on-primary shadow-xs'
                  : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">edit_note</span>
              <span>{isMr ? 'बदल करा' : 'Edit Existing'}</span>
            </button>
          </div>
        )}

        {/* Intro Card */}
        <div className="bg-surface-container-low rounded-2xl p-4 shadow-xs border border-outline-variant/30">
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-container text-[11px] font-bold uppercase flex items-center gap-1.5">
              <img src="/param_logo.png" alt="PARAM" className="w-3.5 h-3.5 rounded-full object-contain" />
              <span>PARAM • Kharif 2026</span>
            </span>
            <span className="text-xs text-on-surface-variant font-medium">
              {isMr ? 'हंगाम २०२६' : 'Season 2026'}
            </span>
          </div>
          <h2 className="font-headline-sm text-headline-sm font-bold text-primary">
            {isMr ? 'तुमच्या पिकाची माहिती द्या' : 'Tell us about your crop'}
          </h2>
          <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
            {isMr
              ? 'स्थानिक उपग्रह हवामान सल्ला, फवारणीच्या योग्य वेळा आणि अवस्था निहाय सूचना मिळवा.'
              : 'Get hyper-local satellite weather advisories, spray windows, and stage-specific alerts.'}
          </p>
        </div>

        {/* 1. SELECT CROP (3-Column Grid) */}
        <section className="space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-secondary"></span>
              <span>{isMr ? '१. पीक निवडा *' : '1. SELECT CROP *'}</span>
            </label>
            <span className="text-[11px] text-secondary font-bold">
              {isMr ? 'भात व गहू समाविष्ट' : 'Rice & Wheat Recommended'}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            {availableCropTiles.map((crop) => {
              const isSelected = selectedCropType === crop.id;
              return (
                <button
                  key={crop.id}
                  type="button"
                  onClick={() => {
                    setSelectedCropType(crop.id);
                    if (crop.id === 'wheat') {
                      setSowingDate('2026-11-12');
                      setSelectedStage('sowing');
                    } else if (crop.id === 'rice') {
                      setSowingDate('2026-08-15');
                      setSelectedStage('vegetative');
                    }
                  }}
                  className={`relative flex flex-col items-center text-center p-3 rounded-2xl min-h-[102px] justify-between transition-all cursor-pointer shadow-xs active:scale-95 ${
                    isSelected
                      ? 'bg-primary-container text-on-primary ring-2 ring-secondary shadow-md'
                      : 'bg-surface-container-lowest text-on-surface border border-outline-variant/30 hover:border-secondary/40'
                  }`}
                >
                  {isSelected && (
                    <span className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center shadow-xs">
                      <span className="material-symbols-outlined text-[14px] font-bold">check</span>
                    </span>
                  )}
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center text-2xl shadow-2xs ${
                      isSelected ? 'bg-white/15' : 'bg-surface-container'
                    }`}
                  >
                    {crop.emoji}
                  </div>
                  <div>
                    <p className="font-label-md text-label-md font-bold leading-tight">
                      {isMr ? crop.nameMr : crop.nameEn}
                    </p>
                    <span
                      className={`text-[10px] block mt-0.5 ${
                        isSelected ? 'text-secondary-fixed font-semibold' : 'text-on-surface-variant'
                      }`}
                    >
                      {isMr ? crop.subMr : crop.subEn}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* 2. SOWING DATE WITH CALENDAR DATE PICKER */}
        <section className="space-y-2 bg-surface-container-lowest rounded-2xl p-4 border border-outline-variant/30 shadow-xs">
          <div className="flex items-center justify-between">
            <label
              htmlFor="sowing-date-picker"
              className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-secondary"></span>
              <span>{isMr ? '२. पेरणी / लागवड तारीख *' : '2. SOWING DATE *'}</span>
            </label>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-bold">
              {daysAgo} {isMr ? 'दिवस झाले' : 'Days Ago'}
            </span>
          </div>

          <div className="relative bg-surface-container-low rounded-xl p-3 flex items-center justify-between cursor-pointer border border-outline-variant/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-secondary-container/60 flex items-center justify-center text-secondary">
                <span className="material-symbols-outlined text-[22px]">calendar_month</span>
              </div>
              <div>
                <span className="text-[11px] text-on-surface-variant block uppercase font-bold">
                  {isMr ? 'पेरणीची तारीख' : 'Planting / Sowing Date'}
                </span>
                <span className="text-sm font-bold text-primary">{formattedDate}</span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-secondary font-bold text-xs">
              <span>{isMr ? 'बदला' : 'Change'}</span>
              <span className="material-symbols-outlined text-[18px]">calendar_today</span>
            </div>
            {/* Native HTML5 Calendar Date Picker overlay */}
            <input
              id="sowing-date-picker"
              type="date"
              value={sowingDate}
              onChange={(e) => setSowingDate(e.target.value)}
              className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
            />
          </div>
          <p className="text-[11px] text-on-surface-variant flex items-center gap-1 mt-1">
            <span className="material-symbols-outlined text-[14px] text-secondary">psychology</span>
            <span>
              {isMr
                ? 'या तारखेवरून पिकाचा वाढीचा टप्पा व फवारणीचे वेळापत्रक ठरते.'
                : 'This helps our system calculate real-time growth milestones and predict harvest windows.'}
            </span>
          </p>
        </section>

        {/* 3. SMART GROWTH ESTIMATION CALLOUT */}
        <section className="bg-gradient-to-r from-surface-container-high to-secondary-container/30 rounded-2xl p-4 shadow-xs border border-secondary-container/50">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-tertiary-fixed text-on-tertiary-fixed flex items-center justify-center shrink-0 shadow-xs">
              <span className="material-symbols-outlined text-[22px]">auto_awesome</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-title-md text-title-md text-primary font-bold">
                  {isMr ? 'स्मार्ट पीक वाढ अंदाज' : 'Smart Growth Estimation'}
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-white font-bold">
                  {isMr ? 'अचूक' : 'Accurate'}
                </span>
              </div>
              <p className="text-xs text-on-surface mt-1 leading-relaxed">
                {isMr ? (
                  <>
                    पेरणीच्या तारखेनुसार (<strong>{formattedDate}, {daysAgo} दिवस</strong>), आपले पीक{' '}
                    <strong className="text-secondary">शाकीय वाढ व फुटवे (Vegetative)</strong> या टप्प्यात असण्याचा अंदाज आहे.
                  </>
                ) : (
                  <>
                    Based on your sowing date (<strong>{formattedDate}, {daysAgo} days ago</strong>), your crop is estimated to be in{' '}
                    <strong className="text-secondary">Vegetative Growth</strong> stage.
                  </>
                )}
              </p>
              <div className="mt-2.5 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedStage('vegetative')}
                  className="px-3.5 py-1.5 rounded-full bg-secondary text-white text-xs font-bold flex items-center gap-1 shadow-xs active:scale-95 transition-all"
                >
                  <span className="material-symbols-outlined text-[16px]">check_circle</span>
                  <span>{isMr ? 'हा टप्पा निवडा' : 'Use Suggested Stage'}</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* 4. CURRENT CROP STAGE SELECTOR */}
        <section className="space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-secondary"></span>
              <span>{isMr ? '३. सद्य पीक वाढीचा टप्पा *' : '3. CURRENT CROP STAGE *'}</span>
            </label>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-bold">
              {stages.find((s) => s.id === selectedStage)?.titleEn || 'Vegetative Growth'}
            </span>
          </div>

          <div className="flex flex-col gap-2">
            {stages.map((st) => {
              const isSelected = selectedStage === st.id;
              return (
                <div
                  key={st.id}
                  onClick={() => setSelectedStage(st.id)}
                  className={`p-3.5 rounded-2xl flex items-center justify-between cursor-pointer transition-all active:scale-98 ${
                    isSelected
                      ? 'bg-primary-container text-on-primary shadow-sm ring-1 ring-secondary'
                      : 'bg-surface-container-lowest text-on-surface border border-outline-variant/30 hover:bg-surface-container-low'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                        isSelected
                          ? 'bg-secondary-fixed text-on-secondary-fixed'
                          : 'bg-surface-container border border-outline-variant'
                      }`}
                    >
                      {isSelected ? (
                        <span className="material-symbols-outlined text-[14px] font-bold">check</span>
                      ) : null}
                    </div>
                    <span className="text-xl">{st.emoji}</span>
                    <div className="min-w-0">
                      <p
                        className={`text-xs font-bold truncate ${
                          isSelected ? 'text-white' : 'text-primary'
                        }`}
                      >
                        {isMr ? st.titleMr : st.titleEn}
                      </p>
                      <span
                        className={`text-[11px] block mt-0.5 truncate ${
                          isSelected ? 'text-white/80' : 'text-on-surface-variant'
                        }`}
                      >
                        {isMr ? st.descMr : st.descEn}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`material-symbols-outlined text-[20px] ${
                      isSelected ? 'text-secondary-fixed' : 'text-outline-variant'
                    }`}
                  >
                    {isSelected ? 'verified' : 'chevron_right'}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* 5. OPTIONAL PLOT & FARM DETAILS (Collapsible) */}
        <section className="bg-surface-container-lowest rounded-2xl p-4 border border-outline-variant/30 shadow-xs">
          <button
            type="button"
            onClick={() => setIsFarmDetailsOpen(!isFarmDetailsOpen)}
            className="w-full flex items-center justify-between text-left"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-surface-container flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[20px]">landscape</span>
              </div>
              <div>
                <span className="text-xs font-bold text-primary block">
                  {isMr ? '४. शेताचा तपशील (पर्यायी)' : '4. Optional Plot & Farm Details'}
                </span>
                <p className="text-[11px] text-on-surface-variant">
                  {isMr ? 'प्लॉट नाव, क्षेत्र आणि पाणी स्त्रोत' : 'Field name, acreage & irrigation source'}
                </p>
              </div>
            </div>
            <span
              className={`material-symbols-outlined text-[20px] text-on-surface-variant transition-transform ${
                isFarmDetailsOpen ? 'rotate-180' : ''
              }`}
            >
              expand_more
            </span>
          </button>

          {isFarmDetailsOpen && (
            <div className="mt-4 pt-3 border-t border-outline-variant/20 flex flex-col gap-3">
              <div>
                <label className="text-[11px] font-bold text-primary uppercase block mb-1">
                  {isMr ? 'प्लॉटचे नाव' : 'Farm / Plot Name'}
                </label>
                <input
                  type="text"
                  value={plotName}
                  onChange={(e) => setPlotName(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-3 py-2 text-xs font-semibold text-primary focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] font-bold text-primary uppercase block mb-1">
                    {isMr ? 'क्षेत्र (एकर)' : 'Area (Acres)'}
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={area}
                    onChange={(e) => setArea(parseFloat(e.target.value) || 2.5)}
                    className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-3 py-2 text-xs font-semibold text-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-primary uppercase block mb-1">
                    {isMr ? 'मातीचा प्रकार' : 'Soil Type'}
                  </label>
                  <select
                    value={soilType}
                    onChange={(e) => setSoilType(e.target.value)}
                    className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-3 py-2 text-xs font-semibold text-primary focus:outline-none cursor-pointer"
                  >
                    <option value="Medium Black Clay">
                      {isMr ? 'काळी मध्यम जमीन' : 'Medium Black Clay'}
                    </option>
                    <option value="Red Loam">{isMr ? 'तांबडी पोयटा' : 'Red Loam'}</option>
                    <option value="Alluvial Soil">{isMr ? 'गाळाची जमीन' : 'Alluvial Soil'}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-primary uppercase block mb-1">
                  {isMr ? 'पाणी / सिंचन' : 'Irrigation Source'}
                </label>
                <select
                  value={irrigationSource}
                  onChange={(e) => setIrrigationSource(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-3 py-2 text-xs font-semibold text-primary focus:outline-none cursor-pointer"
                >
                  <option value="Canal + Borewell">Canal + Borewell</option>
                  <option value="Drip Irrigation">Drip Irrigation</option>
                  <option value="Open Well">Open Well</option>
                  <option value="Rainfed Only">Rainfed Only</option>
                </select>
              </div>
            </div>
          )}
        </section>

        {/* Confirmation Summary Card */}
        <section className="rounded-2xl p-4 bg-surface-container-lowest border border-secondary/40 shadow-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-12 h-12 rounded-xl overflow-hidden bg-surface-container shrink-0 border border-outline-variant/30">
              <img
                src={
                  availableCropTiles.find((c) => c.id === selectedCropType)?.image ||
                  RICE_FIELD_IMAGE
                }
                alt="Selected Crop"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h4 className="font-title-md text-title-md font-bold text-primary truncate">
                  {isMr
                    ? availableCropTiles.find((c) => c.id === selectedCropType)?.nameMr
                    : availableCropTiles.find((c) => c.id === selectedCropType)?.nameEn}
                </h4>
                <span className="text-[10px] px-2 py-0.2 rounded-full bg-secondary-container text-on-secondary-container font-bold">
                  Active
                </span>
              </div>
              <p className="text-[11px] text-on-surface-variant truncate mt-0.5">
                {formattedDate} • {stages.find((s) => s.id === selectedStage)?.titleEn}
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Sticky Bottom Actions */}
      <footer className="fixed bottom-0 inset-x-0 p-5 bg-surface/95 backdrop-blur-md border-t border-outline-variant/30 z-40 max-w-md mx-auto flex flex-col gap-2">
        <button
          onClick={handleSaveCrop}
          className="w-full h-14 rounded-2xl bg-primary-container hover:bg-primary text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md active:scale-[0.98] transition-all cursor-pointer"
        >
          <span>
            {isInitialOnboarding
              ? isMr
                ? 'पीक जोडा व मुख्य पानावर जा'
                : 'Add Crop & Continue to Home'
              : isMr
              ? 'बदल जतन करा (Save Crop)'
              : 'Save Crop Changes'}
          </span>
          <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
        </button>

        <p className="text-[10px] text-center text-on-surface-variant">
          ✓{' '}
          {isMr
            ? 'तुम्ही नंतर कधीही "माझी पिके" मधून पिकांची माहिती बदलू शकता.'
            : 'You can update stages, sowing dates, or add more crops anytime from My Crops.'}
        </p>
      </footer>
    </div>
  );
};
