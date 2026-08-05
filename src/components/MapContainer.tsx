import React, { useState } from 'react';
import { MapPin, Info, Phone, ExternalLink, Minimize2, Maximize2, Map } from 'lucide-react';
import { Hospital } from '../types';

interface MapContainerProps {
  hospitals: Hospital[];
  onSelectHospital: (hospital: Hospital) => void;
  onOpenContact: (hospitalId: string) => void;
}

// Approximate relative percentages for each region's rough position over the
// India map illustration -- not real geo-projection (the background is a
// static stylized image, not a real map library), just enough to place a
// pin in the right quadrant of the country.
const REGION_BASE_POSITIONS: Record<Hospital['region'], { top: number; left: number }> = {
  north: { top: 35, left: 42 },
  west: { top: 56, left: 34 },
  east: { top: 54, left: 72 },
  south: { top: 75, left: 46 },
};

// Spreads multiple hospitals sharing a region around their base point
// instead of stacking every pin from that region on the exact same spot.
function pinPosition(hospital: Hospital, indexInRegion: number): { top: string; left: string } {
  const base = REGION_BASE_POSITIONS[hospital.region] || { top: 50, left: 50 };
  const angle = (indexInRegion * 47) % 360; // 47 -- coprime-ish spread, avoids repeating patterns
  const radius = indexInRegion === 0 ? 0 : 6;
  const top = base.top + radius * Math.sin((angle * Math.PI) / 180);
  const left = base.left + radius * Math.cos((angle * Math.PI) / 180);
  return { top: `${top}%`, left: `${left}%` };
}

export default function MapContainer({ hospitals, onSelectHospital, onOpenContact }: MapContainerProps) {
  const [selectedPin, setSelectedPin] = useState<Hospital | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const regionCounts: Partial<Record<Hospital['region'], number>> = {};

  const handlePinClick = (hosp: Hospital) => {
    setSelectedPin(hosp === selectedPin ? null : hosp);
  };

  return (
    <>
      {isFullscreen && (
        <div 
          className="fixed inset-0 bg-neutral-950/40 backdrop-blur-md z-45 transition-all duration-300"
          onClick={() => setIsFullscreen(false)}
        />
      )}
      <div className={`bg-white rounded-xl shadow-[0px_4px_20px_rgba(13,92,99,0.05)] border border-outline-variant overflow-hidden flex flex-col transition-all duration-300 ${
        isFullscreen ? 'fixed inset-4 z-50 md:inset-12 shadow-[0px_24px_64px_rgba(0,0,0,0.3)]' : 'h-[430px]'
      }`}>
      {/* Map Control Bar */}
      <div className="p-3 bg-surface-container-highest border-b border-outline-variant flex justify-between items-center">
        <h3 className="font-title-md text-sm text-primary flex items-center gap-2">
          <Map className="w-4 h-4 text-primary" /> Network Map
        </h3>
        <button 
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="text-primary hover:bg-surface-container p-1 rounded-md transition-colors cursor-pointer"
          title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Map'}
        >
          {isFullscreen ? <Minimize2 className="w-4.5 h-4.5" /> : <Maximize2 className="w-4.5 h-4.5" />}
        </button>
      </div>

      {/* Simulated Map Background */}
      <div className="flex-grow bg-[#f0f4ff] bg-[radial-gradient(#dce4f7_1.5px,transparent_1.5px)] [background-size:20px_20px] relative overflow-hidden select-none">
        
        {/* India Map Image (from user mockup HTML) */}
        <div 
          className="absolute inset-0 bg-contain bg-center bg-no-repeat opacity-90 transition-all duration-300 mix-blend-multiply"
          style={{ 
            backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAheJJpGZ8RrezVPU9kxXQzlP3vaZZZ6vQKBy6KHRvuSKZ0sl9lTQ-HliPbSoWAPy_Z3xYhqyF7QgtAvvgBWS6d-pPn60TYmWde6-J8LabhEEsjmPXOMu0RWMkSRkJSfZAW0c2qEgzBbhwgk_AXufmO21tjLJgQyc9XjG6wW4SdTXLnf1R0w9AMfBA1Qh-QXbz-yftI5iF6KB9asakwj3tnGX9tHrYCCDLxs9ZI4gYpambE5Eb5QiJ5iw')",
            imageRendering: "-webkit-optimize-contrast"
          }}
        />

        {/* Instructions overlay */}
        <div className="absolute bottom-2 left-2 bg-white/95 px-2.5 py-1.5 rounded border border-outline-variant/30 text-[10px] text-on-surface-variant max-w-[180px] shadow-sm backdrop-blur-sm z-10">
          <span className="font-bold text-primary">Interactive Directory:</span> Click on any pulsing location pin to explore partner oncology clinics.
        </div>

        {/* Map Pins */}
        {hospitals.map(hosp => {
          const indexInRegion = regionCounts[hosp.region] ?? 0;
          regionCounts[hosp.region] = indexInRegion + 1;
          const pos = pinPosition(hosp, indexInRegion);
          const isSelected = selectedPin?.id === hosp.id;
          
          return (
            <div 
              key={hosp.id}
              className="absolute transition-transform duration-200 z-20"
              style={{ top: pos.top, left: pos.left }}
            >
              {/* Pulsing beacon behind pin */}
              <span className={`absolute -inset-2.5 rounded-full opacity-40 animate-ping ${
                hosp.type === 'Center of Excellence' ? 'bg-primary' : 'bg-secondary'
              }`} />

              <button
                onClick={() => handlePinClick(hosp)}
                className={`relative w-8 h-8 rounded-full flex items-center justify-center shadow-md border transition-all transform hover:scale-115 cursor-pointer ${
                  isSelected 
                    ? 'bg-primary border-white scale-110 text-white' 
                    : hosp.type === 'Center of Excellence'
                      ? 'bg-white border-primary text-primary'
                      : 'bg-white border-secondary text-secondary'
                }`}
              >
                <MapPin className="w-5 h-5" fill={isSelected ? 'currentColor' : 'none'} />
              </button>
            </div>
          );
        })}

        {/* Interactive Tooltip Card */}
        {selectedPin && (
          <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 bg-white border border-outline-variant rounded-xl p-4 shadow-[0px_12px_24px_rgba(13,92,99,0.15)] w-72 z-30 transition-all">
            <div className="flex justify-between items-start mb-2">
              <div>
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                  selectedPin.type === 'Center of Excellence' 
                    ? 'bg-primary/10 text-primary' 
                    : 'bg-secondary/10 text-secondary'
                }`}>
                  {selectedPin.type}
                </span>
                <h4 className="font-title-md text-xs font-semibold text-primary mt-1 line-clamp-1">{selectedPin.name}</h4>
                <p className="text-[10px] text-on-surface-variant font-medium flex items-center gap-0.5">
                  <MapPin className="w-3.5 h-3.5 text-primary" />
                  {selectedPin.city}, {selectedPin.state}
                </p>
              </div>
              <button 
                onClick={() => setSelectedPin(null)}
                className="text-on-surface-variant hover:text-on-surface text-xs p-0.5 font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-[11px] text-on-surface-variant line-clamp-2 mb-3">
              {selectedPin.description}
            </p>

            <div className="flex flex-wrap gap-1 mb-3">
              {selectedPin.specialties.map(spec => (
                <span key={spec} className="bg-surface-container text-primary text-[9px] px-2 py-0.5 rounded-full border border-primary-fixed-dim/30">
                  {spec}
                </span>
              ))}
            </div>

            <div className="flex space-x-2 pt-2 border-t border-outline-variant/20">
              <button
                onClick={() => {
                  onSelectHospital(selectedPin);
                  setSelectedPin(null);
                }}
                className="flex-1 py-1.5 bg-surface-variant text-primary text-[10px] font-bold rounded hover:bg-surface-container transition-colors cursor-pointer flex items-center justify-center gap-1"
              >
                <Info className="w-3 h-3" /> View Details
              </button>
              <button
                onClick={() => {
                  onOpenContact(selectedPin.id);
                  setSelectedPin(null);
                }}
                className="flex-1 py-1.5 bg-primary text-white text-[10px] font-bold rounded hover:opacity-90 transition-opacity cursor-pointer flex items-center justify-center gap-1"
              >
                <Phone className="w-3 h-3" /> Contact
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  </>
  );
}
