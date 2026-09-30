import React, { useEffect, useRef } from 'react';
import { Map, Marker } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

interface MapBackgroundProps {
  center: { lat: number; lon: number };
  onPick: (lat: number, lon: number) => void;
  onLocate?: () => void;
}

export const MapBackground: React.FC<MapBackgroundProps> = ({ center, onPick, onLocate }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);
  const markerRef = useRef<Marker | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const map = new Map({
      container: containerRef.current,
      style: {
        version: 8,
        sources: {
          'osm-raster': {
            type: 'raster',
            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '&copy; OpenStreetMap contributors',
          },
        },
        layers: [
          {
            id: 'osm-raster-layer',
            type: 'raster',
            source: 'osm-raster',
            minzoom: 0,
            maxzoom: 19,
          },
        ],
      },
      center: [center.lon, center.lat],
      zoom: 10,
    });

    const marker = new Marker({ color: '#2563eb' })
      .setLngLat([center.lon, center.lat])
      .addTo(map);

    markerRef.current = marker;

    map.on('click', (e) => {
      const { lng, lat } = e.lngLat;
      marker.setLngLat([lng, lat]);
      onPick(lat, lng);
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, []);

  // Sync marker and camera when center updates
  useEffect(() => {
    if (mapRef.current && markerRef.current) {
      markerRef.current.setLngLat([center.lon, center.lat]);
      mapRef.current.flyTo({ center: [center.lon, center.lat], essential: true });
    }
  }, [center.lat, center.lon]);

  return (
    <>
      <div
        ref={containerRef}
        className="fixed inset-0 z-0 pointer-events-auto"
        style={{ position: 'fixed', inset: 0, width: '100vw', height: '100vh', zIndex: 0 }}
      />
      {onLocate && (
        <button
          onClick={onLocate}
          aria-label="Locate me"
          title="Locate me"
          className="fixed right-4 bottom-[156px] md:bottom-8 w-12 h-12 rounded-full bg-white/90 hover:bg-white text-neutral-700 hover:text-primary shadow-lg border border-white/60 backdrop-blur-md flex items-center justify-center pointer-events-auto active:scale-95 transition-all z-20"
          style={{ zIndex: 20, width: '48px', height: '48px' }}
        >
          <span className="material-symbols-outlined text-[24px]">my_location</span>
        </button>
      )}
    </>
  );
};
