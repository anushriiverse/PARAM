import React, { useState, useEffect, useRef } from 'react';
import { search, SearchResultItem } from '../services/agromet';

interface MapSearchBoxProps {
  onSelectResult: (lat: number, lon: number) => void;
  isMobile: boolean;
}

export const MapSearchBox: React.FC<MapSearchBoxProps> = ({ onSelectResult, isMobile }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      const data = await search(query.trim());
      if (data) {
        setResults(data.slice(0, 8));
        setIsOpen(true);
      } else {
        setResults([]);
      }
      setLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (item: SearchResultItem) => {
    setQuery(item.name);
    setIsOpen(false);
    onSelectResult(item.lat, item.lon);
  };

  return (
    <div
      ref={containerRef}
      className="pointer-events-auto"
      style={{
        position: 'fixed',
        top: '16px',
        left: '16px',
        right: isMobile ? '16px' : 'auto',
        width: isMobile ? 'calc(100% - 32px)' : '320px',
        zIndex: 20,
      }}
    >
      <div
        style={{
          background: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRadius: '14px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.6)',
        }}
        className="flex items-center px-3.5 py-2.5 gap-2"
      >
        <span className="material-symbols-outlined text-[20px] text-neutral-500">search</span>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true);
          }}
          placeholder="Search village or station..."
          className="bg-transparent text-sm text-neutral-800 placeholder-neutral-500 outline-none w-full font-medium"
        />
        {loading && (
          <span className="material-symbols-outlined text-[18px] text-neutral-400 animate-spin">
            progress_activity
          </span>
        )}
        {query && !loading && (
          <button
            onClick={() => {
              setQuery('');
              setResults([]);
              setIsOpen(false);
            }}
            className="text-neutral-400 hover:text-neutral-600 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.92)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderRadius: '14px',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.15)',
            border: '1px solid rgba(255, 255, 255, 0.6)',
            maxHeight: '260px',
          }}
          className="mt-2 overflow-y-auto overflow-x-hidden py-1.5"
        >
          {results.map((item, idx) => (
            <button
              key={`${item.name}-${item.lat}-${item.lon}-${idx}`}
              onClick={() => handleSelect(item)}
              className="w-full text-left px-3.5 py-2 hover:bg-black/5 flex items-center justify-between gap-2 text-xs text-neutral-800 transition-colors border-b border-black/[0.04] last:border-b-0 cursor-pointer"
            >
              <div className="min-w-0 flex-1 truncate">
                <span className="font-semibold">{item.name}</span>
                <span className="text-neutral-500 ml-1.5">{item.state}</span>
              </div>
              <span className="text-[10px] text-neutral-400 font-mono shrink-0">
                {item.lat.toFixed(2)}°, {item.lon.toFixed(2)}°
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
