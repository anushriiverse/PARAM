import React, { useState } from 'react';
import { AppLanguage, AppScreen, WeatherDay } from '../types';
import { Header } from '../components/Header';
import { BottomNav } from '../components/BottomNav';
import { DEFAULT_WEATHER_DAYS, DEMO_FIELDS_NOTE } from '../data/mockData';
import { playSpeech } from '../utils/audio';
import { useAgromet } from '../context/AgrometContext';

interface WeatherScreenProps {
  language: AppLanguage;
  onNavigate: (screen: AppScreen) => void;
  onToggleLanguage: () => void;
  onOpenProfile: () => void;
}

export const WeatherScreen: React.FC<WeatherScreenProps> = ({
  language,
  onNavigate,
  onToggleLanguage,
  onOpenProfile,
}) => {
  const isMr = language === 'mr';
  const [selectedDayId, setSelectedDayId] = useState<string>('mon');
  const { prediction, currentCoords, setLocation } = useAgromet();

  const weatherDays: WeatherDay[] = DEFAULT_WEATHER_DAYS;
  const activeDay = weatherDays.find((d) => d.id === selectedDayId) || weatherDays[0];

  const handleAudioSummary = () => {
    const tempText = prediction ? `${prediction.temp_c.toFixed(1)} degrees Celsius` : `${activeDay.tempHigh} degrees`;
    if (isMr) {
      playSpeech(
        `${prediction ? prediction.name : activeDay.dayNameMr}. कमाल तापमान ${prediction ? prediction.temp_c.toFixed(1) : activeDay.tempHigh} अंश. पाऊस अंदाज ${prediction ? Math.round(prediction.rainfall_jjas_mm) : activeDay.rainAmountMm} मिमी.`,
        'mr'
      );
    } else {
      playSpeech(
        `Weather for ${prediction ? prediction.name : activeDay.dayNameEn}. Downscaled temperature ${tempText}. Seasonal rainfall ${prediction ? Math.round(prediction.rainfall_jjas_mm) : activeDay.rainAmountMm} millimeters.`,
        'en'
      );
    }
  };

  return (
    <div className="relative w-full min-h-screen bg-transparent flex flex-col justify-between overflow-x-hidden text-on-surface">
      {/* Header Container */}
      <div className="relative z-10">
        <Header
          title={prediction ? `${prediction.name}, ${prediction.state}` : (isMr ? 'हवामान अंदाज (७ दिवस)' : '7-Day Weather')}
          subtitle={prediction ? `Elevation: ${prediction.elevation_m.toFixed(0)}m • ${prediction.inside_validated_band ? 'Validated Band' : 'Outside Band'}` : 'Sajani, MH'}
          language={language}
          onToggleLanguage={onToggleLanguage}
          onOpenProfile={onOpenProfile}
          onOpenNotifications={() => onNavigate('alerts')}
        />
      </div>

      {/* Main Container */}
      <main className="relative z-10 flex-1 w-full pt-16 pb-24 px-5 space-y-4">
        {/* Title Bar with Audio Guide */}
        <div className="flex items-center justify-between pt-3">
          <div>
            <h1 className="font-headline-sm text-headline-sm font-bold text-primary drop-shadow-xs">
              {prediction ? `${prediction.name} Forecast` : (isMr ? 'स्थानिक हवामान अंदाज' : 'Local Forecast')}
            </h1>
            <p className="text-xs text-on-surface-variant drop-shadow-xs">
              {prediction ? prediction.note : (isMr ? 'सजणी • मॉडेल आउटपुट' : 'Sajani • model output')}
            </p>
          </div>

          <button
            onClick={handleAudioSummary}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed-variant text-xs font-bold shadow-xs active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[16px]">volume_up</span>
            <span>{isMr ? 'हवामान ऐका' : 'Audio Forecast'}</span>
          </button>
        </div>

        {/* 7-Day Interactive Horizontal Strip (Demo Outlook) */}
        <section className="space-y-1.5 pointer-events-auto">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-primary drop-shadow-xs">
              {isMr ? 'दिवस निवडा (Select Day)' : 'Select Day'}
            </span>
            <span className="text-[11px] text-secondary font-semibold drop-shadow-xs">
              {isMr ? 'तपशील पाहण्यासाठी टॅप करा' : 'Tap to inspect day'}
            </span>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 pt-1 -mx-5 px-5 no-scrollbar scroll-smooth">
            {weatherDays.map((day) => {
              const isSelected = day.id === selectedDayId;
              return (
                <button
                  key={day.id}
                  onClick={() => setSelectedDayId(day.id)}
                  className={`min-w-[86px] p-3 rounded-2xl flex flex-col items-center justify-between text-center transition-all cursor-pointer shadow-xs active:scale-95 ${
                    isSelected
                      ? 'bg-primary-container text-on-primary ring-2 ring-secondary shadow-md'
                      : 'bg-surface-container-lowest/90 backdrop-blur-md text-on-surface border border-outline-variant/30 hover:bg-surface-container-low'
                  }`}
                >
                  <span
                    className={`text-[11px] uppercase font-bold ${
                      isSelected ? 'text-secondary-fixed' : 'text-on-surface-variant'
                    }`}
                  >
                    {isMr ? day.dayNameMr : day.dayNameEn}
                  </span>
                  <span className="text-2xl my-1.5">{day.icon}</span>
                  <span
                    className={`text-xs font-bold ${
                      isSelected ? 'text-surface-bright' : 'text-primary'
                    }`}
                  >
                    {day.tempHigh}° / {day.tempLow}°
                  </span>
                  <span
                    className={`text-[10px] font-bold mt-1 px-1.5 py-0.2 rounded-full ${
                      day.rainProb > 60
                        ? isSelected
                          ? 'bg-tertiary-fixed text-on-tertiary-fixed-variant'
                          : 'bg-error-container text-error'
                        : isSelected
                        ? 'bg-white/15 text-white'
                        : 'text-on-surface-variant'
                    }`}
                  >
                    {day.rainProb}%
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Selected Day Feature Hero Card */}
        <section className="rounded-3xl p-5 bg-gradient-to-br from-primary-container to-primary text-on-primary shadow-xl border border-primary-fixed/30 flex flex-col gap-4 pointer-events-auto backdrop-blur-md">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-white/15 text-white text-xs font-bold uppercase tracking-wide">
                  {isMr ? activeDay.dayNameMr : activeDay.dayNameEn} • {activeDay.date}
                </span>
                {/* Validation Band Badge Pill */}
                {prediction && (
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                      prediction.inside_validated_band
                        ? 'bg-emerald-500/25 text-emerald-200 border border-emerald-400/40'
                        : 'bg-amber-500/25 text-amber-200 border border-amber-400/40'
                    }`}
                  >
                    {prediction.inside_validated_band ? 'Gauge-validated' : 'Outside validated band'}
                  </span>
                )}
              </div>

              <h2 className="text-3xl font-extrabold tracking-tight mt-2 text-white flex flex-col items-start">
                <span>{prediction ? `${prediction.temp_c.toFixed(1)}°C` : `${activeDay.tempHigh}°C`}</span>
                <span className="text-xs text-surface-bright/80 font-medium mt-0.5">
                  seasonal mean (JJAS)
                </span>
              </h2>
              <p className="text-sm font-semibold text-secondary-fixed flex items-center gap-1.5 mt-1">
                <span className="text-lg">{activeDay.icon}</span>
                <span>{isMr ? activeDay.conditionMr : activeDay.conditionEn}</span>
              </p>
            </div>

            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-4xl shadow-inner">
              {activeDay.icon}
            </div>
          </div>

          {/* Live AgroMet Downscaled Variables: ETo & Rainfall (JJAS) */}
          <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-white/15">
            <div className="bg-white/10 rounded-2xl p-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center text-secondary-fixed">
                <span className="material-symbols-outlined text-[20px]">water_drop</span>
              </div>
              <div>
                <span className="text-[10px] text-surface-bright/80 uppercase font-bold block">
                  {isMr ? 'बाष्पोत्सर्जन (ETo)' : 'ETo (Crop Water)'}
                </span>
                <span className="text-xs font-bold text-white">
                  ETo  {prediction ? `${prediction.eto_mm_day.toFixed(1)} mm/day` : '-'}
                </span>
              </div>
            </div>

            <div className="bg-white/10 rounded-2xl p-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center text-tertiary-fixed-dim">
                <span className="material-symbols-outlined text-[20px]">cloud_sync</span>
              </div>
              <div>
                <span className="text-[10px] text-surface-bright/80 uppercase font-bold block">
                  {isMr ? 'हंगामी पाऊस (JJAS)' : 'Rainfall (JJAS)'}
                </span>
                <span className="text-xs font-bold text-white">
                  Rainfall (JJAS)  {prediction ? `${Math.round(prediction.rainfall_jjas_mm)} mm` : '-'}
                </span>
              </div>
            </div>
          </div>

          {/* Meteorological Metrics 4-Box Grid (Demo Placeholders) */}
          <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-white/15">
            {/* Rain Chance & Amount */}
            <div className="bg-white/10 rounded-2xl p-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center text-tertiary-fixed-dim">
                <span className="material-symbols-outlined text-[20px]">rainy</span>
              </div>
              <div>
                <span className="text-[10px] text-surface-bright/80 uppercase font-bold block">
                  {isMr ? 'पाऊस शक्यता (Demo)' : 'Rain Prob (Demo)'}
                </span>
                <span className="text-xs font-bold text-white">
                  {activeDay.rainProb}% • {activeDay.rainAmountMm} mm
                </span>
              </div>
            </div>

            {/* Humidity */}
            <div className="bg-white/10 rounded-2xl p-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center text-secondary-fixed">
                <span className="material-symbols-outlined text-[20px]">humidity_percentage</span>
              </div>
              <div>
                <span className="text-[10px] text-surface-bright/80 uppercase font-bold block">
                  {isMr ? 'सापेक्ष आर्द्रता (Demo)' : 'Rel. Humidity (Demo)'}
                </span>
                <span className="text-xs font-bold text-white">{activeDay.humidity}%</span>
              </div>
            </div>

            {/* Wind Speed & Direction */}
            <div className="bg-white/10 rounded-2xl p-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center text-secondary-fixed">
                <span className="material-symbols-outlined text-[20px]">air</span>
              </div>
              <div>
                <span className="text-[10px] text-surface-bright/80 uppercase font-bold block">
                  {isMr ? 'वारा (Demo)' : 'Wind (Demo)'}
                </span>
                <span className="text-xs font-bold text-white">
                  {activeDay.windSpeedKmH} km/h • {activeDay.windDirection}
                </span>
              </div>
            </div>

            {/* UV Index */}
            <div className="bg-white/10 rounded-2xl p-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center text-tertiary-fixed-dim">
                <span className="material-symbols-outlined text-[20px]">sunny</span>
              </div>
              <div>
                <span className="text-[10px] text-surface-bright/80 uppercase font-bold block">
                  {isMr ? 'अतिनील किरण (Demo)' : 'UV Index (Demo)'}
                </span>
                <span className="text-xs font-bold text-white">Index {activeDay.uvIndex}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Demo Placeholders Disclosure Note */}
        <div className="pointer-events-auto rounded-xl p-3 bg-surface-container-lowest/80 backdrop-blur-md border border-outline-variant/30 text-center shadow-xs">
          <p className="text-[11px] text-on-surface-variant leading-relaxed">
            {DEMO_FIELDS_NOTE}
          </p>
        </div>
      </main>

      {/* Bottom Nav */}
      <div className="relative z-10 pointer-events-auto">
        <BottomNav currentScreen="weather" onNavigate={onNavigate} language={language} />
      </div>
    </div>
  );
};
