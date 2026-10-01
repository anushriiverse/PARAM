import React from 'react';
import { PARAM_LOGO_URL } from '../data/mockData';
import { AppLanguage, FarmerProfile } from '../types';
import { useAgromet } from '../context/AgrometContext';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  badge?: string;
  onBack?: () => void;
  language: AppLanguage;
  onToggleLanguage: () => void;
  onOpenProfile: () => void;
  onOpenNotifications?: () => void;
  onSync?: () => void;
  farmerProfile?: FarmerProfile;
  showBack?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  title = 'PARAM',
  subtitle,
  badge = '',
  onBack,
  language,
  onToggleLanguage,
  onOpenProfile,
  onOpenNotifications,
  onSync,
  farmerProfile,
  showBack = false,
}) => {
  const { prediction } = useAgromet();
  const resolvedSubtitle = subtitle !== undefined ? subtitle : (prediction ? `${prediction.name}, ${prediction.state}` : 'Sajani, MH');
  return (
    <header className="fixed top-0 inset-x-0 z-40 bg-surface/90 backdrop-blur-xl border-b border-outline-variant/20 shadow-[0_1px_8px_rgba(0,0,0,0.04)] pt-safe">
      <div className="h-16 px-4 flex items-center justify-between gap-2">
        {/* Left Section */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {showBack && onBack ? (
            <button
              onClick={onBack}
              aria-label="Go back"
              className="w-10 h-10 -ml-1 rounded-full flex items-center justify-center text-primary-container hover:bg-surface-container active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-[24px]">arrow_back</span>
            </button>
          ) : (
            <div className="w-10 h-10 rounded-full bg-[#fbfbf8] overflow-hidden flex items-center justify-center shrink-0 shadow-sm border border-secondary-fixed/50 p-0.5">
              <img src={PARAM_LOGO_URL} alt="PARAM Logo" className="w-full h-full object-contain" />
            </div>
          )}

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-headline-sm text-headline-sm text-primary-container font-bold truncate leading-tight">
                {title}
              </span>
              {badge && (
                <span className="text-[10px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-container shrink-0">
                  {badge}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 text-on-surface-variant text-[12px] truncate">
              <span className="material-symbols-outlined text-[14px] text-secondary shrink-0">
                location_on
              </span>
              <span className="truncate">{resolvedSubtitle}</span>
            </div>
          </div>
        </div>

        {/* Right Action Icons */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Language Switcher button */}
          <button
            onClick={onToggleLanguage}
            aria-label="Change Language"
            className="h-9 px-2.5 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center gap-1 text-primary-container text-xs font-bold transition-all active:scale-95 shadow-2xs"
            title="भाषा बदला / Change Language"
          >
            <span className="material-symbols-outlined text-[17px] text-secondary">translate</span>
            <span>{language === 'mr' ? 'मराठी' : language === 'hi' ? 'हिन्दी' : 'EN'}</span>
          </button>

          {/* Sync Button */}
          {onSync && (
            <button
              onClick={onSync}
              aria-label="Sync Data"
              className="w-9 h-9 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container transition-colors active:scale-95"
            >
              <span className="material-symbols-outlined text-[20px]">sync</span>
            </button>
          )}

          {/* Notifications Button */}
          <button
            onClick={onOpenNotifications}
            aria-label="Notifications"
            className="relative w-9 h-9 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container transition-colors active:scale-95"
          >
            <span className="material-symbols-outlined text-[20px]">notifications</span>
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-error ring-2 ring-surface"></span>
          </button>

          {/* Farmer Profile Avatar */}
          <button
            onClick={onOpenProfile}
            aria-label="Farmer Profile"
            className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-on-primary ml-0.5 shadow-sm active:scale-95 hover:opacity-95 transition-all"
            title={farmerProfile?.name || 'Farmer Profile'}
          >
            {farmerProfile?.name ? (
              <span className="text-xs font-bold uppercase">
                {farmerProfile.name.charAt(0)}
              </span>
            ) : (
              <span className="material-symbols-outlined text-[18px]">person</span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
