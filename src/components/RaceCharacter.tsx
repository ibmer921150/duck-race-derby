import React from 'react';

export type RaceTheme = 'duck' | 'horse' | 'car' | 'marble';

interface RaceCharacterProps {
  theme: RaceTheme;
  color: string;
  isRacing: boolean;
  isWinner?: boolean;
}

const RaceCharacter: React.FC<RaceCharacterProps> = ({ theme, color, isRacing, isWinner }) => {
  const baseClass = `drop-shadow-md ${isRacing ? 'animate-waddle' : ''} ${isWinner ? 'animate-celebrate' : ''}`;

  switch (theme) {
    case 'duck':
      return (
        <svg width="40" height="40" viewBox="0 0 64 64" className={baseClass}>
          <ellipse cx="32" cy="40" rx="20" ry="16" fill={color} />
          <circle cx="48" cy="28" r="12" fill={color} />
          <ellipse cx="58" cy="30" rx="6" ry="4" fill="#FF9500" />
          <circle cx="52" cy="26" r="3" fill="white" />
          <circle cx="53" cy="26" r="1.5" fill="black" />
          <ellipse cx="28" cy="38" rx="8" ry="10" fill={color} className="opacity-80" />
          <ellipse cx="46" cy="24" rx="4" ry="3" fill="white" className="opacity-30" />
        </svg>
      );
    
    case 'horse':
      return (
        <svg width="40" height="40" viewBox="0 0 64 64" className={baseClass}>
          {/* Body */}
          <ellipse cx="28" cy="38" rx="18" ry="14" fill={color} />
          {/* Neck */}
          <ellipse cx="44" cy="24" rx="8" ry="14" fill={color} transform="rotate(20 44 24)" />
          {/* Head */}
          <ellipse cx="52" cy="16" rx="10" ry="8" fill={color} />
          {/* Eye */}
          <circle cx="56" cy="14" r="2" fill="white" />
          <circle cx="56.5" cy="14" r="1" fill="black" />
          {/* Mane */}
          <path d="M42 10 Q44 6 48 8 Q50 4 54 6 Q52 10 50 14" fill="#333" />
          {/* Legs */}
          <rect x="18" y="46" width="4" height="12" rx="2" fill={color} />
          <rect x="26" y="46" width="4" height="12" rx="2" fill={color} />
          <rect x="34" y="46" width="4" height="10" rx="2" fill={color} />
        </svg>
      );
    
    case 'car':
      return (
        <svg width="40" height="40" viewBox="0 0 64 64" className={baseClass}>
          {/* Body */}
          <rect x="8" y="28" width="48" height="16" rx="4" fill={color} />
          {/* Roof */}
          <path d="M20 28 L24 16 L44 16 L48 28" fill={color} />
          {/* Windows */}
          <path d="M22 26 L25 18 L33 18 L33 26" fill="#87CEEB" />
          <path d="M35 26 L35 18 L43 18 L46 26" fill="#87CEEB" />
          {/* Wheels */}
          <circle cx="18" cy="44" r="7" fill="#333" />
          <circle cx="18" cy="44" r="3" fill="#666" />
          <circle cx="46" cy="44" r="7" fill="#333" />
          <circle cx="46" cy="44" r="3" fill="#666" />
          {/* Headlight */}
          <rect x="52" y="32" width="4" height="4" rx="1" fill="#FFD700" />
        </svg>
      );
    
    case 'marble':
      return (
        <svg width="40" height="40" viewBox="0 0 64 64" className={baseClass}>
          {/* Main sphere */}
          <circle cx="32" cy="32" r="24" fill={color} />
          {/* Glass highlight */}
          <ellipse cx="24" cy="22" rx="10" ry="8" fill="white" className="opacity-40" />
          <circle cx="20" cy="18" r="4" fill="white" className="opacity-60" />
          {/* Inner swirl pattern */}
          <path 
            d="M20 32 Q32 20 44 32 Q32 44 20 32" 
            fill="none" 
            stroke="white" 
            strokeWidth="2" 
            className="opacity-30"
          />
          {/* Shadow */}
          <ellipse cx="32" cy="54" rx="16" ry="4" fill="black" className="opacity-20" />
        </svg>
      );
  }
};

export default RaceCharacter;
