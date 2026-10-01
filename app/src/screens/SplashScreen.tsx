import React, { useEffect, useState } from 'react';

interface SplashScreenProps {
  onDismiss: () => void;
  onStart?: () => void;
  language?: string;
  onToggleLanguage?: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onDismiss, onStart }) => {
  const [logoOpacity, setLogoOpacity] = useState(0);
  const [splashOpacity, setSplashOpacity] = useState(1);

  useEffect(() => {
    // 1. Logo fades in over 400ms immediately on mount
    const fadeInTimer = setTimeout(() => {
      setLogoOpacity(1);
    }, 20);

    // 2. Minimum hold 1200ms, then fade out over 400ms
    const holdTimer = setTimeout(() => {
      setSplashOpacity(0);
    }, 1200);

    // 3. Complete dismissal after fadeout (1200ms + 400ms = 1600ms)
    const dismissTimer = setTimeout(() => {
      if (onDismiss) onDismiss();
      if (onStart) onStart();
    }, 1600);

    // 4. Hard cap 2500ms total
    const hardCapTimer = setTimeout(() => {
      if (onDismiss) onDismiss();
      if (onStart) onStart();
    }, 2500);

    return () => {
      clearTimeout(fadeInTimer);
      clearTimeout(holdTimer);
      clearTimeout(dismissTimer);
      clearTimeout(hardCapTimer);
    };
  }, [onDismiss, onStart]);

  return (
    <div
      className="select-none flex flex-col items-center justify-center pointer-events-auto"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        background: '#f7f6f1',
        opacity: splashOpacity,
        transition: 'opacity 400ms cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      <div
        className="flex flex-col items-center justify-center text-center px-4"
        style={{
          opacity: logoOpacity,
          transition: 'opacity 400ms cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <img
          src="/param-logo.png"
          alt="PARAM Logo"
          style={{
            width: '200px',
            height: '200px',
            objectFit: 'contain',
          }}
          className="drop-shadow-sm"
        />
        <p className="mt-4 text-sm font-medium text-neutral-500 tracking-wide">
          seasonal agromet downscaling
        </p>
      </div>
    </div>
  );
};
