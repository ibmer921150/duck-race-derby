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
  yOffset?: number;
}

interface PoolRaceTrackProps {
  racers: Racer[];
  isRacing: boolean;
  isCountingDown?: boolean;
  winner?: Racer;
  theme: RaceTheme;
  raceFinished?: boolean;
  isSprintPhase?: boolean;
}

const THEME_BACKGROUNDS: Record<RaceTheme, string> = {
  duck: 'from-secondary to-pond-dark',
  horse: 'from-green-500 to-green-800',
  car: 'from-gray-600 to-gray-900',
  marble: 'from-purple-500 to-purple-900',
};

const PoolRaceTrack: React.FC<PoolRaceTrackProps> = ({ 
  racers, 
  isRacing, 
  isCountingDown, 
  winner, 
  theme,
  raceFinished,
  isSprintPhase
}) => {
  const confettiFired = useRef(false);
  const trackRef = useRef<HTMLDivElement>(null);

  // Fire confetti when winner is determined
  useEffect(() => {
    if (raceFinished && winner && !confettiFired.current) {
      confettiFired.current = true;
      
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

  // Calculate Y positions for racers to spread them vertically
  const getYPosition = (racer: Racer, index: number) => {
    const totalRacers = racers.length;
    const trackHeight = 100; // percentage
    const margin = 10; // top/bottom margin
    const usableHeight = trackHeight - margin * 2;
    
    // Distribute racers vertically with some randomness
    const baseY = margin + (index / Math.max(totalRacers - 1, 1)) * usableHeight;
    const wobble = racer.yOffset || 0;
    
    return Math.max(margin, Math.min(trackHeight - margin, baseY + wobble));
  };

  return (
    <div 
      ref={trackRef}
      className={`relative rounded-2xl overflow-hidden shadow-xl bg-gradient-to-b ${THEME_BACKGROUNDS[theme]}`}
      style={{ height: '500px' }}
    >
      {/* Track header */}
      <div className="bg-black/20 px-4 py-2 text-center z-20 relative">
        <span className="text-white/90 font-bold text-sm">
          {isCountingDown ? '🏁 Get Ready!' : 
           isSprintPhase ? '🔥 SPRINT! SPRINT! SPRINT!' :
           isRacing ? '🏃 GO GO GO!' : 
           raceFinished ? '🎉 Race Complete!' : '🏁 Ready to Race'}
        </span>
      </div>

      {/* Start line */}
      <div className="absolute left-[8%] top-12 bottom-4 w-1 bg-white/50 z-10" />
      
      {/* Finish line */}
      <div 
        className="absolute right-[5%] top-12 bottom-4 w-3 z-10"
        style={{
          background: 'repeating-linear-gradient(0deg, white 0px, white 8px, #333 8px, #333 16px)'
        }}
      />

      {/* Racing area - all racers in same pool */}
      <div className="absolute inset-0 top-12 bottom-4 left-0 right-0">
        {racers.map((racer, index) => {
          const isWinner = winner?.id === racer.id;
          const xPosition = 8 + Math.min(racer.position, 100) * 0.82; // 8% start, 90% finish
          const yPosition = getYPosition(racer, index);
          
          return (
            <div
              key={racer.id}
              className="absolute transition-all duration-75 ease-linear"
              style={{
                left: `${xPosition}%`,
                top: `${yPosition}%`,
                transform: 'translate(-50%, -50%)',
                zIndex: isWinner ? 100 : Math.round(racer.position),
              }}
            >
              {/* Name tag ABOVE the character */}
              <div 
                className={`
                  absolute -top-6 left-1/2 -translate-x-1/2
                  px-2 py-0.5 rounded text-xs font-bold whitespace-nowrap z-30
                  ${isWinner ? 'bg-winner-gold text-foreground' : 'bg-black/60 text-white'}
                  shadow-md
                `}
              >
                {isWinner && '👑 '}{racer.name}
              </div>
              
              {/* Character */}
              <div className="relative">
                <RaceCharacter
                  theme={theme}
                  color={racer.color}
                  isRacing={isRacing && !racer.finished}
                  isWinner={isWinner}
                />
                
                {/* Speed lines when racing */}
                {isRacing && !racer.finished && (
                  <div className="absolute -left-6 top-1/2 -translate-y-1/2 flex gap-0.5 opacity-60">
                    {[...Array(isSprintPhase ? 5 : 3)].map((_, i) => (
                      <div
                        key={i}
                        className="h-0.5 bg-white rounded-full animate-pulse"
                        style={{
                          width: `${isSprintPhase ? 16 - i * 2 : 10 - i * 2}px`,
                          animationDelay: `${i * 50}ms`,
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Sprint phase indicator */}
      {isSprintPhase && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-red-500/10 animate-pulse" />
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-red-600 text-white px-4 py-2 rounded-full font-bold animate-bounce">
            🔥 FINAL SPRINT! 🔥
          </div>
        </div>
      )}

      {/* Racer count */}
      <div className="absolute bottom-2 left-4 bg-black/40 text-white text-xs px-2 py-1 rounded z-20">
        {racers.length} racers
      </div>

      {/* Theme decorations */}
      {theme === 'duck' && (
        <>
          <div className="absolute bottom-2 right-4 text-2xl opacity-50 pointer-events-none">🌊</div>
          <div className="absolute top-14 right-20 text-xl opacity-40 pointer-events-none">💨</div>
        </>
      )}
      {theme === 'horse' && (
        <>
          <div className="absolute bottom-2 right-4 text-2xl opacity-50 pointer-events-none">🌾</div>
          <div className="absolute top-14 right-20 text-xl opacity-40 pointer-events-none">☀️</div>
        </>
      )}
      {theme === 'car' && (
        <>
          <div className="absolute bottom-2 right-4 text-2xl opacity-50 pointer-events-none">🛣️</div>
          <div className="absolute top-14 right-20 text-xl opacity-40 pointer-events-none">💨</div>
        </>
      )}
      {theme === 'marble' && (
        <>
          <div className="absolute bottom-2 right-4 text-2xl opacity-50 pointer-events-none">✨</div>
          <div className="absolute top-14 right-20 text-xl opacity-40 pointer-events-none">⭐</div>
        </>
      )}
    </div>
  );
};

export default PoolRaceTrack;
