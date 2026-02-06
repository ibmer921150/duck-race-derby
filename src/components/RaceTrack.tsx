import React from 'react';

interface Racer {
  id: number;
  name: string;
  color: string;
  position: number;
  finished: boolean;
  finishTime?: number;
  warmupOffset?: number;
}

interface RaceTrackProps {
  racers: Racer[];
  isRacing: boolean;
  isCountingDown?: boolean;
  winner?: Racer;
  loser?: Racer;
}

const RaceTrack: React.FC<RaceTrackProps> = ({ racers, isRacing, isCountingDown, winner, loser }) => {
  return (
    <div className="pond-track water-waves p-4 min-h-[300px]">
      {/* Start line */}
      <div className="absolute left-2 top-0 bottom-0 w-1 bg-white/30" />
      
      {/* Finish line */}
      <div className="finish-line" />
      
      {/* All ducks in a flex wrap layout */}
      <div className="flex flex-wrap gap-1 p-2 relative z-10">
        {racers.map((racer) => (
          <div
            key={racer.id}
            className={`
              flex flex-col items-center transition-all duration-100
              ${isCountingDown ? 'animate-bounce' : ''}
              ${winner?.id === racer.id ? 'scale-125 z-20' : ''}
              ${loser?.id === racer.id ? 'opacity-60' : ''}
            `}
            style={{
              transform: isCountingDown 
                ? `translateX(${racer.warmupOffset || 0}px)` 
                : isRacing || racer.finished
                  ? `translateX(${Math.min(racer.position, 100) * 2}px)`
                  : 'translateX(0)',
            }}
          >
            {/* Mini Duck */}
            <div className={`relative ${isRacing && !racer.finished ? 'animate-waddle' : ''}`}>
              <svg
                width="24"
                height="24"
                viewBox="0 0 64 64"
                className="drop-shadow-sm"
              >
                <ellipse cx="32" cy="40" rx="20" ry="16" fill={racer.color} />
                <circle cx="48" cy="28" r="12" fill={racer.color} />
                <ellipse cx="58" cy="30" rx="6" ry="4" fill="#FF9500" />
                <circle cx="52" cy="26" r="2" fill="white" />
                <circle cx="53" cy="26" r="1" fill="black" />
              </svg>
              {winner?.id === racer.id && (
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 text-xs">👑</div>
              )}
            </div>
            
            {/* Name tag */}
            <div 
              className={`
                px-1 py-0.5 rounded text-[8px] font-bold whitespace-nowrap max-w-[50px] truncate
                ${winner?.id === racer.id ? 'bg-winner-gold text-foreground' : 
                  loser?.id === racer.id ? 'bg-loser-gray text-white' : 
                  'bg-card/80 text-card-foreground'}
              `}
              title={racer.name}
            >
              {racer.name}
            </div>
          </div>
        ))}
      </div>
      
      {/* Water decorations */}
      <div className="absolute bottom-2 left-4 text-2xl opacity-50">🌊</div>
      <div className="absolute top-2 right-16 text-xl opacity-40">💨</div>
    </div>
  );
};

export default RaceTrack;
