import React from 'react';
import { AppLanguage, AppScreen } from '../types';

interface BottomNavProps {
  currentScreen: AppScreen;
  onNavigate: (screen: AppScreen) => void;
  language: AppLanguage;
  alertCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentScreen,
  onNavigate,
  language,
  alertCount = 3,
}) => {
  const isHome = currentScreen === 'home';
  const isWeather = currentScreen === 'weather';
  const isAdvisory =
    currentScreen === 'advisory' ||
    currentScreen === 'advisory_fertilizer' ||
    currentScreen === 'advisory_irrigation' ||
    currentScreen === 'advisory_crop_selector';
  const isCrops =
    currentScreen === 'crops' ||
    currentScreen === 'crop_detail_rice' ||
    currentScreen === 'crop_detail_wheat' ||
    currentScreen === 'add_crop';
  const isAlerts = currentScreen === 'alerts';

  const labels = {
    home: language === 'mr' ? 'मुख्य' : language === 'hi' ? 'होम' : 'Home',
    weather: language === 'mr' ? 'हवामान' : language === 'hi' ? 'मौसम' : 'Weather',
    advisory: language === 'mr' ? 'सल्ला' : language === 'hi' ? 'सलाह' : 'Advisory',
    crops: language === 'mr' ? 'पिके' : language === 'hi' ? 'फसलें' : 'Crops',
    alerts: language === 'mr' ? 'इशारे' : language === 'hi' ? 'अलर्ट' : 'Alerts',
  };

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 pb-safe bg-surface/92 backdrop-blur-xl border-t border-outline-variant/30 shadow-[0_-4px_24px_-4px_rgba(22,56,32,0.08)]">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto px-2">
        {/* Home */}
        <button
          onClick={() => onNavigate('home')}
          className={`flex flex-col items-center justify-center min-w-[56px] h-12 transition-all ${
            isHome ? 'text-primary-container font-bold scale-105' : 'text-on-surface-variant hover:text-primary-container'
          }`}
        >
          <span
            className="material-symbols-outlined text-[22px]"
            style={{ fontVariationSettings: isHome ? "'FILL' 1" : "'FILL' 0" }}
          >
            home
          </span>
          <span className="text-[11px] mt-0.5 tracking-tight">{labels.home}</span>
        </button>

        {/* Weather */}
        <button
          onClick={() => onNavigate('weather')}
          className={`flex flex-col items-center justify-center min-w-[56px] h-12 transition-all ${
            isWeather ? 'text-primary-container font-bold scale-105' : 'text-on-surface-variant hover:text-primary-container'
          }`}
        >
          <span
            className="material-symbols-outlined text-[22px]"
            style={{ fontVariationSettings: isWeather ? "'FILL' 1" : "'FILL' 0" }}
          >
            cloud_sync
          </span>
          <span className="text-[11px] mt-0.5 tracking-tight">{labels.weather}</span>
        </button>

        {/* Advisory */}
        <button
          onClick={() => onNavigate('advisory')}
          className={`flex flex-col items-center justify-center min-w-[62px] h-12 transition-all ${
            isAdvisory ? 'text-primary-container font-bold scale-105' : 'text-on-surface-variant hover:text-primary-container'
          }`}
        >
          <div
            className={`px-3 py-1 rounded-full flex items-center justify-center transition-all ${
              isAdvisory ? 'bg-secondary-container text-on-secondary-container shadow-xs' : ''
            }`}
          >
            <span
              className="material-symbols-outlined text-[20px]"
              style={{ fontVariationSettings: isAdvisory ? "'FILL' 1" : "'FILL' 0" }}
            >
              agriculture
            </span>
          </div>
          <span className="text-[11px] tracking-tight">{labels.advisory}</span>
        </button>

        {/* Crops */}
        <button
          onClick={() => onNavigate('crops')}
          className={`flex flex-col items-center justify-center min-w-[56px] h-12 transition-all ${
            isCrops ? 'text-primary-container font-bold scale-105' : 'text-on-surface-variant hover:text-primary-container'
          }`}
        >
          <div
            className={`px-2.5 py-0.5 rounded-full flex items-center justify-center transition-all ${
              isCrops ? 'bg-secondary-container text-on-secondary-container' : ''
            }`}
          >
            <span
              className="material-symbols-outlined text-[22px]"
              style={{ fontVariationSettings: isCrops ? "'FILL' 1" : "'FILL' 0" }}
            >
              eco
            </span>
          </div>
          <span className="text-[11px] tracking-tight">{labels.crops}</span>
        </button>

        {/* Alerts */}
        <button
          onClick={() => onNavigate('alerts')}
          className={`flex flex-col items-center justify-center min-w-[56px] h-12 transition-all relative ${
            isAlerts ? 'text-primary-container font-bold scale-105' : 'text-on-surface-variant hover:text-primary-container'
          }`}
        >
          <div className="relative">
            <span
              className="material-symbols-outlined text-[22px]"
              style={{ fontVariationSettings: isAlerts ? "'FILL' 1" : "'FILL' 0" }}
            >
              emergency_home
            </span>
            {alertCount > 0 && (
              <span className="absolute -top-1 -right-2 px-1 min-w-[15px] h-[15px] rounded-full bg-error text-white font-bold text-[9px] flex items-center justify-center shadow-xs">
                {alertCount}
              </span>
            )}
          </div>
          <span className="text-[11px] mt-0.5 tracking-tight">{labels.alerts}</span>
        </button>
      </div>
    </nav>
  );
};
