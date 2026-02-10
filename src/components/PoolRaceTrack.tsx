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
  currentCountdown?: number;
  totalCountdown?: number;
  winner?: Racer;
  theme: RaceTheme;
  raceFinished?: boolean;
  isSprintPhase?: boolean;
}

const THEME_BACKGROUNDS: Record<RaceTheme, string> = {
  duck: 'from-sky-300 via-cyan-400 to-blue-600',
  horse: 'from-lime-400 via-green-500 to-emerald-700',
  car: 'from-slate-500 via-gray-600 to-gray-900',
  marble: 'from-violet-400 via-purple-500 to-indigo-800',
};

const THEME_EMOJIS: Record<RaceTheme, { bg1: string; bg2: string }> = {
  duck: { bg1: '🌊', bg2: '💦' },
  horse: { bg1: '🌾', bg2: '☀️' },
  car: { bg1: '🛣️', bg2: '💨' },
  marble: { bg1: '✨', bg2: '⭐' },
};

const PoolRaceTrack: React.FC<PoolRaceTrackProps> = ({ 
  racers, 
  isRacing, 
  isCountingDown, 
  currentCountdown = 0,
  totalCountdown = 0,
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
          particleCount: 5,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.7 },
          colors: ['#FFD700', '#FF6B6B', '#4ECDC4', '#FF9500', '#E91E63'],
        });
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.7 },
          colors: ['#FFD700', '#FF6B6B', '#4ECDC4', '#FF9500', '#E91E63'],
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    }
  }, [raceFinished, winner]);

  // Reset confetti flag
  useEffect(() => {
    if (!raceFinished) {
      confettiFired.current = false;
    }
  }, [raceFinished]);

  const getYPosition = (racer: Racer, index: number) => {
    const totalRacers = racers.length;
    const margin = 10;
    const usableHeight = 100 - margin * 2;
    const baseY = margin + (index / Math.max(totalRacers - 1, 1)) * usableHeight;
    const wobble = racer.yOffset || 0;
    return Math.max(margin, Math.min(90, baseY + wobble));
  };

  // Show countdown numbers only for last 3 seconds
  const showCountdownNumber = isCountingDown && currentCountdown <= 3 && currentCountdown > 0;

  return (
    <div 
      ref={trackRef}
      className={`relative rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-b ${THEME_BACKGROUNDS[theme]} border-4 border-white/20`}
      style={{ minHeight: '600px', height: '70vh', maxHeight: '800px' }}
    >
      {/* Top bar with countdown timer - compact centered banner */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-black/30 backdrop-blur-sm px-3 py-1 text-center z-20 rounded-lg flex items-center justify-center gap-2">
        {/* Countdown timer display at top */}
        {isCountingDown && currentCountdown > 0 ? (
          <div className="flex items-center gap-2">
            <span className="text-white/80 font-bold text-base">⏱️</span>
            <span className={`font-black text-2xl drop-shadow-lg ${
              currentCountdown <= 3 ? 'text-yellow-300 animate-countdown' : 'text-white'
            }`}>
              {currentCountdown}
            </span>
            <span className="text-white/80 font-bold text-base">
              {currentCountdown <= 3 ? '🔥' : '⏱️'}
            </span>
          </div>
        ) : (
          <span className="text-white font-bold text-sm tracking-wide">
            {isSprintPhase ? '🔥 SPRINT! SPRINT! SPRINT! 🔥' :
             isRacing ? '🏃 GO GO GO! 🏃' : 
             raceFinished ? '🎉 Race Complete! 🎉' : '🏁 Ready to Race! 🏁'}
          </span>
        )}
      </div>

      {/* Big countdown overlay — only for last 3 seconds */}
      {showCountdownNumber && (
        <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="text-[10rem] font-black text-white/30 animate-countdown drop-shadow-2xl select-none">
            {currentCountdown}
          </div>
        </div>
      )}

      {/* "GO!" flash when countdown hits 0 */}
      {isCountingDown && currentCountdown === 0 && (
        <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="text-8xl font-black text-yellow-300 animate-countdown drop-shadow-2xl">
            GO! 🚀
          </div>
        </div>
      )}

      {/* Start line */}
      <div className="absolute left-[8%] top-12 bottom-4 w-1.5 bg-white/60 z-10 rounded-full">
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white/20 backdrop-blur-sm text-white font-black text-xs px-2 py-0.5 rounded-full whitespace-nowrap z-30">
          🏁 START
        </div>
      </div>
      
      {/* Finish line */}
      <div 
        className="absolute right-[5%] top-12 bottom-4 w-4 z-10 rounded-sm"
        style={{
          background: 'repeating-linear-gradient(0deg, white 0px, white 8px, #222 8px, #222 16px)'
        }}
      >
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white/20 backdrop-blur-sm text-white font-black text-xs px-2 py-0.5 rounded-full whitespace-nowrap z-30">
          🏆 FINISH
        </div>
      </div>

      {/* Racing area */}
      <div className="absolute inset-0 top-12 bottom-4 left-0 right-0">
        {racers.map((racer, index) => {
          const isWinner = winner?.id === racer.id;
          const xPosition = 8 + Math.min(racer.position, 100) * 0.82;
          const yPosition = getYPosition(racer, index);
          const crossedFinish = racer.position >= 100;
          
          return (
            <div
              key={racer.id}
              className={`absolute transition-all duration-75 ease-linear ${crossedFinish ? 'z-40' : ''}`}
              style={{
                left: `${xPosition}%`,
                top: `${yPosition}%`,
                transform: 'translate(-50%, -50%)',
                zIndex: isWinner ? 100 : crossedFinish ? 50 : Math.round(racer.position),
              }}
            >
              {/* Name tag */}
              <div 
                className={`
                  absolute -top-7 left-1/2 -translate-x-1/2
                  px-2 py-0.5 rounded-full text-xs font-black whitespace-nowrap z-30
                  ${isWinner 
                    ? 'bg-yellow-400 text-gray-900 shadow-lg shadow-yellow-400/50 scale-110' 
                    : crossedFinish 
                      ? 'bg-green-500 text-white shadow-md' 
                      : 'bg-black/50 text-white backdrop-blur-sm'}
                `}
              >
                {isWinner && '👑 '}{crossedFinish && !isWinner && '✅ '}{racer.name}
              </div>
              
              {/* Character with finish-crossing glow */}
              <div className={`relative ${isWinner ? 'scale-125' : ''} transition-transform duration-300`}>
                {/* Winner glow ring */}
                {isWinner && (
                  <div className="absolute inset-0 -m-3 rounded-full bg-yellow-400/40 animate-ping" />
                )}
                
                {/* Finish flash */}
                {crossedFinish && !isWinner && (
                  <div className="absolute inset-0 -m-2 rounded-full bg-green-400/30 animate-pulse" />
                )}
                
                <RaceCharacter
                  theme={theme}
                  color={racer.color}
                  isRacing={isRacing && !racer.finished}
                  isWinner={isWinner}
                />
                
                {/* Speed lines */}
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
        <div className="absolute top-10 left-1/2 -translate-x-1/2 pointer-events-none z-30">
          <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-4 py-1 rounded-full font-black text-sm animate-bounce shadow-lg shadow-red-500/30">
            🔥 FINAL SPRINT! 🔥
          </div>
        </div>
      )}

      {/* Winner announcement overlay */}
      {raceFinished && winner && (
        <div className="absolute inset-0 pointer-events-none flex items-end justify-center pb-16 z-30">
          <div className="bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 text-gray-900 px-8 py-4 rounded-2xl font-black text-2xl shadow-2xl shadow-yellow-500/40 animate-scale-in border-4 border-white/40">
            👑 {winner.name} WINS! 🏆
          </div>
        </div>
      )}

      {/* Racer count */}
      <div className="absolute bottom-2 left-4 bg-black/40 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full z-20 font-bold">
        {racers.length} racers
      </div>

      {/* Theme decorations */}
      <div className="absolute bottom-2 right-4 text-2xl opacity-50 pointer-events-none">{THEME_EMOJIS[theme].bg1}</div>
      <div className="absolute top-16 right-20 text-xl opacity-40 pointer-events-none">{THEME_EMOJIS[theme].bg2}</div>
    </div>
  );
};

export default PoolRaceTrack;
