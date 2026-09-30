import React from 'react';
import { AppLanguage } from '../types';

interface LanguageModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLanguage: AppLanguage;
  onSelectLanguage: (lang: AppLanguage) => void;
}

export const LanguageModal: React.FC<LanguageModalProps> = ({
  isOpen,
  onClose,
  currentLanguage,
  onSelectLanguage,
}) => {
  if (!isOpen) return null;

  const languages = [
    {
      id: 'mr' as AppLanguage,
      namePrimary: 'मराठी',
      nameSecondary: 'Marathi',
      tag: 'महाराष्ट्र विशेष • Maharashtra',
    },
    {
      id: 'en' as AppLanguage,
      namePrimary: 'English',
      nameSecondary: 'इंग्रजी',
      tag: 'Pan-India Advisory',
    },
    {
      id: 'hi' as AppLanguage,
      namePrimary: 'हिन्दी',
      nameSecondary: 'Hindi',
      tag: 'मध्य भारत • Central India',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-surface-container-lowest rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl border border-outline-variant/30 flex flex-col gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-1 border-b border-outline-variant/20">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-[24px]">translate</span>
            <h3 className="font-headline-sm text-headline-sm font-bold text-primary">
              {currentLanguage === 'mr'
                ? 'भाषा निवडा'
                : currentLanguage === 'hi'
                ? 'भाषा चुनें'
                : 'Select Language'}
            </h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-9 h-9 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <p className="text-xs text-on-surface-variant -mt-1">
          {currentLanguage === 'mr'
            ? 'सल्लागार, हवामान व पीक सूचना या भाषेत मिळतील.'
            : 'Advisory, weather, and crop alerts will be delivered in this language.'}
        </p>

        <div className="flex flex-col gap-2.5">
          {languages.map((item) => {
            const isSelected = currentLanguage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectLanguage(item.id);
                  onClose();
                }}
                className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all active:scale-98 text-left ${
                  isSelected
                    ? 'bg-secondary-container/30 border-secondary ring-1 ring-secondary shadow-xs'
                    : 'bg-surface-container-low border-outline-variant/40 hover:bg-surface-container'
                }`}
              >
                <div className="flex flex-col">
                  <div className="flex items-baseline gap-2">
                    <span className="font-headline-sm text-headline-sm font-extrabold text-primary">
                      {item.namePrimary}
                    </span>
                    <span className="text-xs font-semibold text-on-surface-variant">
                      {item.nameSecondary}
                    </span>
                  </div>
                  <span className="text-[11px] font-medium text-secondary mt-0.5">{item.tag}</span>
                </div>
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center ${
                    isSelected
                      ? 'bg-secondary text-on-secondary shadow-xs'
                      : 'border border-outline-variant text-transparent'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px] font-bold">check</span>
                </div>
              </button>
            );
          })}
        </div>

        <button
          onClick={onClose}
          className="w-full h-11 rounded-xl bg-primary text-on-primary font-label-md text-label-md font-bold mt-2 shadow-sm"
        >
          {currentLanguage === 'mr' ? 'पूर्ण झाले (Done)' : 'Done'}
        </button>
      </div>
    </div>
  );
};
