import React from 'react';
import { AppLanguage } from '../types';

interface MandiRatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: AppLanguage;
}

export const MandiRatesModal: React.FC<MandiRatesModalProps> = ({ isOpen, onClose, language }) => {
  if (!isOpen) return null;

  const isMr = language === 'mr';

  const rates = [
    {
      commodityEn: 'Rice (Paddy Indrayani)',
      commodityMr: 'भात (इंद्रायणी)',
      mandi: 'Kolhapur APMC',
      min: '₹2,450',
      max: '₹2,850',
      modal: '₹2,720',
      trend: '+₹40',
      isUp: true,
    },
    {
      commodityEn: 'Wheat (Sharbati / Lokwan)',
      commodityMr: 'गहू (शरबती / लोकवन)',
      mandi: 'Kolhapur APMC',
      min: '₹2,600',
      max: '₹3,150',
      modal: '₹2,980',
      trend: '+₹25',
      isUp: true,
    },
    {
      commodityEn: 'Soybean (Yellow)',
      commodityMr: 'सोयाबीन (पिवळा)',
      mandi: 'Sangli APMC',
      min: '₹4,300',
      max: '₹4,750',
      modal: '₹4,620',
      trend: '-₹15',
      isUp: false,
    },
    {
      commodityEn: 'Sugarcane (FRP Rate)',
      commodityMr: 'ऊस (एफआरपी दर)',
      mandi: 'Kolhapur District',
      min: '₹3,100',
      max: '₹3,350',
      modal: '₹3,250',
      trend: 'Stable',
      isUp: true,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-surface-container-lowest rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl border border-outline-variant/30 flex flex-col gap-4 max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-1 border-b border-outline-variant/20">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-tertiary-fixed-dim text-[24px]">
              query_stats
            </span>
            <div>
              <h3 className="font-headline-sm text-headline-sm font-bold text-primary">
                {isMr ? 'बाजार भाव (Mandi Rates)' : 'Live Mandi Rates'}
              </h3>
              <p className="text-[11px] text-on-surface-variant">
                {isMr ? 'कोल्हापूर व सांगली बाजार समिती' : 'Kolhapur & Sangli APMC Markets'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <div className="flex flex-col gap-2.5">
          {rates.map((item, idx) => (
            <div
              key={idx}
              className="p-3 rounded-2xl bg-surface-container-low border border-outline-variant/30 flex flex-col gap-1.5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-label-md text-label-md font-bold text-primary">
                    {isMr ? item.commodityMr : item.commodityEn}
                  </h4>
                  <span className="text-[11px] text-on-surface-variant">{item.mandi}</span>
                </div>
                <span
                  className={`text-[11px] px-2 py-0.5 rounded-full font-bold flex items-center gap-0.5 ${
                    item.isUp
                      ? 'bg-secondary-container text-on-secondary-container'
                      : 'bg-error-container text-on-error-container'
                  }`}
                >
                  {item.trend}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 pt-1 border-t border-outline-variant/20 text-center text-xs">
                <div>
                  <span className="text-[10px] text-on-surface-variant block uppercase">
                    {isMr ? 'किमान' : 'Min'}
                  </span>
                  <span className="font-semibold text-on-surface">{item.min}</span>
                </div>
                <div>
                  <span className="text-[10px] text-on-surface-variant block uppercase">
                    {isMr ? 'सरासरी' : 'Modal'}
                  </span>
                  <span className="font-bold text-primary">{item.modal}</span>
                </div>
                <div>
                  <span className="text-[10px] text-on-surface-variant block uppercase">
                    {isMr ? 'कमाल' : 'Max'}
                  </span>
                  <span className="font-semibold text-on-surface">{item.max}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          className="w-full h-11 rounded-xl bg-primary text-on-primary font-label-md text-label-md font-bold mt-1 shadow-sm"
        >
          {isMr ? 'बंद करा' : 'Close'}
        </button>
      </div>
    </div>
  );
};
