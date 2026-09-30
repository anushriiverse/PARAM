import React from 'react';
import { AppLanguage, CropItem } from '../types';

interface CropSelectorScreenProps {
  crops: CropItem[];
  activeCropId: string;
  onSelectCrop: (cropId: string) => void;
  onAddNewCrop: () => void;
  onClose: () => void;
  language: AppLanguage;
}

export const CropSelectorScreen: React.FC<CropSelectorScreenProps> = ({
  crops,
  activeCropId,
  onSelectCrop,
  onAddNewCrop,
  onClose,
  language,
}) => {
  const isMr = language === 'mr';

  return (
    <div className="relative w-full min-h-screen bg-surface flex flex-col justify-between overflow-x-hidden text-on-surface">
      {/* Top Header */}
      <header className="fixed top-0 inset-x-0 z-40 bg-surface/90 backdrop-blur-xl border-b border-outline-variant/30 shadow-xs pt-safe">
        <div className="h-16 px-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              aria-label="Close"
              className="w-10 h-10 rounded-full flex items-center justify-center text-primary hover:bg-surface-container transition-colors active:scale-95"
            >
              <span className="material-symbols-outlined text-[24px]">close</span>
            </button>
            <div>
              <h1 className="font-headline-sm text-headline-sm font-bold text-primary">
                {isMr ? 'पीक निवडा (Crop Selector)' : 'Select Crop'}
              </h1>
              <span className="text-[11px] text-on-surface-variant">
                {isMr ? 'सल्ला केंद्रासाठी पीक बदला' : 'Switch active crop for advisory'}
              </span>
            </div>
          </div>

          <button
            onClick={onAddNewCrop}
            className="px-3 py-1.5 rounded-xl bg-secondary-container text-on-secondary-container text-xs font-bold flex items-center gap-1 shadow-xs"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            <span>{isMr ? 'नवीन पीक' : 'Add New'}</span>
          </button>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 px-5 pt-20 pb-28 space-y-3">
        <p className="text-xs text-on-surface-variant">
          {isMr
            ? 'खालीलपैकी ज्या पिकाचा सल्ला पाहायचा आहे ते पीक निवडा:'
            : 'Select the crop you want to view advisories and nutrient plans for:'}
        </p>

        <div className="flex flex-col gap-3">
          {crops.map((crop) => {
            const isSelected = crop.id === activeCropId;
            return (
              <div
                key={crop.id}
                onClick={() => {
                  onSelectCrop(crop.id);
                  onClose();
                }}
                className={`p-4 rounded-3xl flex items-center justify-between gap-3 cursor-pointer transition-all active:scale-[0.98] shadow-xs ${
                  isSelected
                    ? 'bg-primary-container text-on-primary ring-2 ring-secondary shadow-md'
                    : 'bg-surface-container-lowest border border-outline-variant/30 text-on-surface hover:border-secondary/50'
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-14 h-14 rounded-2xl overflow-hidden bg-surface-container shrink-0 border border-outline-variant/30">
                    <img
                      src={crop.imageUrl}
                      alt={crop.nameEn}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3
                        className={`text-sm font-extrabold truncate ${
                          isSelected ? 'text-white' : 'text-primary'
                        }`}
                      >
                        {isMr ? crop.nameMr : crop.nameEn}
                      </h3>
                      {isSelected && (
                        <span className="px-2 py-0.2 rounded-full bg-secondary-fixed text-primary text-[10px] font-bold">
                          Active
                        </span>
                      )}
                    </div>
                    <p
                      className={`text-xs mt-0.5 truncate ${
                        isSelected ? 'text-surface-bright/90' : 'text-on-surface-variant'
                      }`}
                    >
                      {isMr ? crop.stageMr : crop.stageEn} • {crop.acres} {isMr ? 'एकर' : 'Acres'}
                    </p>
                    <span
                      className={`text-[10px] block mt-0.5 ${
                        isSelected ? 'text-secondary-fixed font-semibold' : 'text-on-surface-variant'
                      }`}
                    >
                      {isMr ? 'पेरणी:' : 'Sown:'} {crop.sowingDate}
                    </span>
                  </div>
                </div>

                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                    isSelected
                      ? 'bg-secondary-fixed text-primary shadow-xs'
                      : 'bg-surface-container text-outline-variant'
                  }`}
                >
                  {isSelected ? (
                    <span className="material-symbols-outlined text-[18px] font-bold">check</span>
                  ) : (
                    <div className="w-2.5 h-2.5 rounded-full bg-outline-variant"></div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Sticky Bottom Bar */}
      <footer className="fixed bottom-0 inset-x-0 p-5 bg-surface/95 backdrop-blur-md border-t border-outline-variant/30 z-40 max-w-md mx-auto">
        <button
          onClick={onClose}
          className="w-full h-14 rounded-2xl bg-primary-container text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md active:scale-[0.98] transition-all cursor-pointer"
        >
          <span>{isMr ? 'निवड पूर्ण करा' : 'Confirm Selection'}</span>
        </button>
      </footer>
    </div>
  );
};
