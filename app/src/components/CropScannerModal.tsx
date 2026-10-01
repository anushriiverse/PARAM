import React, { useState } from 'react';
import { AppLanguage } from '../types';
import { RICE_DISEASE_IMAGE } from '../data/mockData';

interface CropScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: AppLanguage;
  onViewAlertDetails?: () => void;
}

export const CropScannerModal: React.FC<CropScannerModalProps> = ({
  isOpen,
  onClose,
  language,
  onViewAlertDetails,
}) => {
  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState(false);

  if (!isOpen) return null;

  const handleScan = () => {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      setScanned(true);
    }, 1400);
  };

  const isMr = language === 'mr';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-surface-container-lowest rounded-3xl overflow-hidden shadow-2xl border border-outline-variant/30 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 flex items-center justify-between border-b border-outline-variant/20 bg-surface">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-[24px]">
              document_scanner
            </span>
            <div>
              <h3 className="font-title-md text-title-md font-bold text-primary">
                {isMr ? 'पीक डॉक्टर / पान तपासणी' : 'Crop Doctor / Leaf Scan'}
              </h3>
              <p className="text-[11px] text-on-surface-variant">
                {isMr ? 'रोग व कीड त्वरित ओळखा' : 'Diagnose pests & leaf diseases instantly'}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setScanned(false);
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Viewfinder / Image Preview */}
        <div className="relative w-full h-64 bg-black overflow-hidden flex items-center justify-center">
          <img
            src={RICE_DISEASE_IMAGE}
            alt="Leaf Lesion Specimen"
            className="w-full h-full object-cover opacity-85"
          />

          {/* Scanner Overlay Box */}
          <div className="absolute inset-6 border-2 border-dashed border-secondary-fixed rounded-2xl pointer-events-none flex items-center justify-center">
            {scanning && (
              <div className="w-full h-1 bg-secondary animate-pulse shadow-[0_0_12px_#1b6d24]"></div>
            )}
            <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/60 text-secondary-fixed text-[10px] font-bold">
              AI SCANNER LIVE
            </div>
          </div>
        </div>

        {/* Result Area */}
        <div className="p-5 flex flex-col gap-3">
          {!scanned ? (
            <div className="flex flex-col gap-3 text-center">
              <p className="text-xs text-on-surface-variant">
                {isMr
                  ? 'पानाचे स्पष्ट छायाचित्र चौकोनात ठेवा आणि खालील बटण दाबा.'
                  : 'Align the leaf inside the frame and tap scan to diagnose.'}
              </p>
              <button
                onClick={handleScan}
                disabled={scanning}
                className="w-full h-12 rounded-xl bg-primary-container text-on-primary font-label-md text-label-md font-bold flex items-center justify-center gap-2 shadow-sm hover:opacity-95 transition-all"
              >
                {scanning ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-[20px]">sync</span>
                    <span>{isMr ? 'तपासत आहे...' : 'Analyzing leaf with AI...'}</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[20px]">camera</span>
                    <span>{isMr ? 'पान तपासा' : 'Capture & Diagnose'}</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3 animate-in fade-in">
              <div className="p-3 rounded-xl bg-error-container/40 border border-error/30 flex items-start gap-2.5">
                <span className="material-symbols-outlined text-error text-[20px] shrink-0 mt-0.5">
                  warning
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-label-md text-label-md font-bold text-error">
                      {isMr ? 'करपा व खोडकुज रोगाचा धोका (Rice Blast)' : 'Rice Blast & Sheath Blight Detected'}
                    </h4>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-error text-white font-bold">
                      92% Match
                    </span>
                  </div>
                  <p className="text-[11px] text-on-error-container mt-1">
                    {isMr
                      ? 'तपकिरी रंगाचे लांबट डाग दिसून आले आहेत. ट्रायसायक्लॅझोल फवारणीची शिफारस.'
                      : 'Spindle-shaped elliptical lesions identified. Immediate scouting and curative fungicide recommended.'}
                  </p>
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                {onViewAlertDetails && (
                  <button
                    onClick={() => {
                      onClose();
                      onViewAlertDetails();
                    }}
                    className="flex-1 h-11 rounded-xl bg-primary-container text-on-primary font-label-sm text-label-sm font-bold flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <span>{isMr ? 'सविस्तर उपाय पहा' : 'View Full Advisory'}</span>
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </button>
                )}
                <button
                  onClick={() => setScanned(false)}
                  className="px-4 h-11 rounded-xl bg-surface-container hover:bg-surface-container-high text-primary font-label-sm text-label-sm font-semibold transition-colors"
                >
                  {isMr ? 'पुन्हा तपासा' : 'Rescan'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
