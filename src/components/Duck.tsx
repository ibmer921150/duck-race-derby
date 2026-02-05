import React from 'react';

interface DuckProps {
  color: string;
  name: string;
  position: number;
  isRacing: boolean;
  isWinner?: boolean;
  isLoser?: boolean;
}

const Duck: React.FC<DuckProps> = ({ color, name, position, isRacing, isWinner, isLoser }) => {
  return (
    <div
      className="absolute flex items-center gap-2 transition-all duration-100 ease-linear"
      style={{ left: `${position}%` }}
    >
      <div className={`relative ${isRacing ? 'animate-waddle' : ''} ${isWinner ? 'animate-celebrate' : ''}`}>
        {/* Duck SVG */}
        <svg
          width="48"
          height="48"
          viewBox="0 0 64 64"
          className="drop-shadow-lg"
        >
          {/* Body */}
          <ellipse cx="32" cy="40" rx="20" ry="16" fill={color} />
          {/* Head */}
          <circle cx="48" cy="28" r="12" fill={color} />
          {/* Beak */}
          <ellipse cx="58" cy="30" rx="6" ry="4" fill="#FF9500" />
          {/* Eye */}
          <circle cx="52" cy="26" r="3" fill="white" />
          <circle cx="53" cy="26" r="1.5" fill="black" />
          {/* Wing */}
          <ellipse cx="28" cy="38" rx="8" ry="10" fill={color} className="opacity-80" />
          {/* Highlight */}
          <ellipse cx="46" cy="24" rx="4" ry="3" fill="white" className="opacity-30" />
        </svg>
        
        {/* Winner crown */}
        {isWinner && (
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-2xl">👑</div>
        )}
      </div>
      
      {/* Name tag */}
      <div 
        className={`
          px-2 py-1 rounded-full text-xs font-bold whitespace-nowrap
          ${isWinner ? 'bg-winner-gold text-foreground' : isLoser ? 'bg-loser-gray text-white' : 'bg-card/90 text-card-foreground'}
          shadow-md backdrop-blur-sm
        `}
      >
        {name}
      </div>
    </div>
  );
};

export default Duck;
