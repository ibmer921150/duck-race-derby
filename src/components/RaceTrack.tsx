import React, { useEffect, useRef } from 'react';
import RaceCharacter, { RaceTheme } from './RaceCharacter';
import confetti from 'canvas-confetti';

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
  theme: RaceTheme;
  raceFinished?: boolean;
}

const THEME_BACKGROUNDS: Record<RaceTheme, string> = {
  duck: 'from-secondary to-pond-dark',
  horse: 'from-green-500 to-green-800',
  car: 'from-gray-600 to-gray-900',
  marble: 'from-purple-500 to-purple-900',
};

const THEME_LANE_COLORS: Record<RaceTheme, string> = {
  duck: 'border-white/20',
  horse: 'border-white/30',
  car: 'border-yellow-400/30',
  marble: 'border-purple-300/30',
};

const RaceTrack: React.FC<RaceTrackProps> = ({ 
  racers, 
  isRacing, 
  isCountingDown, 
  winner, 
  loser, 
  theme,
  raceFinished 
}) => {
  const confettiFired = useRef(false);
  const displayRacers = racers.slice(0, 20); // Show max 20 lanes for visibility

  // Fire confetti when winner is determined
  useEffect(() => {
    if (raceFinished && winner && !confettiFired.current) {
      confettiFired.current = true;
      
      // Fire confetti from both sides
      const duration = 3000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.7 },
          colors: ['#FFD700', '#FFA500', '#FF6B6B', '#4ECDC4'],
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.7 },
          colors: ['#FFD700', '#FFA500', '#FF6B6B', '#4ECDC4'],
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    }
  }, [raceFinished, winner]);

  // Reset confetti flag when race resets
  useEffect(() => {
    if (!raceFinished) {
      confettiFired.current = false;
    }
  }, [raceFinished]);

  return (
    <div className={`relative rounded-2xl overflow-hidden shadow-xl bg-gradient-to-b ${THEME_BACKGROUNDS[theme]}`}>
      {/* Track header */}
      <div className="bg-black/20 px-4 py-2 text-center">
        <span className="text-white/90 font-bold text-sm">
          {isCountingDown ? '🏁 Get Ready!' : isRacing ? '🏃 GO GO GO!' : raceFinished ? '🎉 Race Complete!' : '🏁 Ready to Race'}
        </span>
      </div>

      {/* Start line */}
      <div className="absolute left-10 top-12 bottom-0 w-1 bg-white/50 z-10" />
      
      {/* Finish line */}
      <div 
        className="absolute right-4 top-12 bottom-0 w-3 z-10"
        style={{
          background: 'repeating-linear-gradient(0deg, white 0px, white 8px, #333 8px, #333 16px)'
        }}
      />

      {/* Racing lanes */}
      <div className="p-2 space-y-1">
        {displayRacers.map((racer, index) => {
          const isWinner = winner?.id === racer.id;
          const isLoser = loser?.id === racer.id;
          
          return (
            <div 
              key={racer.id}
              className={`
                relative h-12 flex items-center rounded-lg overflow-hidden
                border-b ${THEME_LANE_COLORS[theme]}
                ${isWinner ? 'bg-winner-gold/30 ring-2 ring-winner-gold' : ''}
                ${isLoser ? 'bg-black/20' : ''}
              `}
            >
              {/* Lane number */}
              <div className="absolute left-1 text-white/60 font-bold text-xs w-6 text-center z-20">
                {index + 1}
              </div>
              
              {/* Racing character */}
              <div
                className="absolute flex items-center gap-1 transition-all duration-75 ease-linear z-10"
                style={{
                  left: `${12 + Math.min(racer.position, 100) * 0.78}%`,
                  transform: isCountingDown 
                    ? `translateX(${racer.warmupOffset || 0}px)` 
                    : undefined,
                }}
              >
                <RaceCharacter
                  theme={theme}
                  color={racer.color}
                  isRacing={isRacing && !racer.finished}
                  isWinner={isWinner}
                />
                
                {/* Speed lines when racing */}
                {isRacing && !racer.finished && (
                  <div className="absolute -left-8 top-1/2 -translate-y-1/2 flex gap-0.5 opacity-60">
                    {[...Array(3)].map((_, i) => (
                      <div
                        key={i}
                        className="h-0.5 bg-white rounded-full animate-pulse"
                        style={{
                          width: `${12 - i * 3}px`,
                          animationDelay: `${i * 100}ms`,
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
              
              {/* Name tag at end of lane */}
              <div 
                className={`
                  absolute right-8 px-2 py-0.5 rounded text-xs font-bold truncate max-w-[80px] z-20
                  ${isWinner ? 'bg-winner-gold text-foreground' : 
                    isLoser ? 'bg-loser-gray text-white' : 
                    'bg-black/40 text-white'}
                `}
                title={racer.name}
              >
                {isWinner && '👑 '}{racer.name}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* More racers indicator */}
      {racers.length > 20 && (
        <div className="bg-black/30 px-4 py-2 text-center">
          <span className="text-white/80 text-sm">
            +{racers.length - 20} more racers competing
          </span>
        </div>
      )}

      {/* Theme decorations */}
      {theme === 'duck' && (
        <>
          <div className="absolute bottom-2 left-4 text-2xl opacity-50 pointer-events-none">🌊</div>
          <div className="absolute top-14 right-20 text-xl opacity-40 pointer-events-none">💨</div>
        </>
      )}
      {theme === 'horse' && (
        <>
          <div className="absolute bottom-2 left-4 text-2xl opacity-50 pointer-events-none">🌾</div>
          <div className="absolute top-14 right-20 text-xl opacity-40 pointer-events-none">☀️</div>
        </>
      )}
      {theme === 'car' && (
        <>
          <div className="absolute bottom-2 left-4 text-2xl opacity-50 pointer-events-none">🛣️</div>
          <div className="absolute top-14 right-20 text-xl opacity-40 pointer-events-none">💨</div>
        </>
      )}
      {theme === 'marble' && (
        <>
          <div className="absolute bottom-2 left-4 text-2xl opacity-50 pointer-events-none">✨</div>
          <div className="absolute top-14 right-20 text-xl opacity-40 pointer-events-none">⭐</div>
        </>
      )}
    </div>
  );
};

export default RaceTrack;
