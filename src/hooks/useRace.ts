import { useState, useCallback, useRef, useEffect } from 'react';

type RacingBehavior =
  | 'slow-mid-fade' // Slow start → mid surge → late fade
  | 'fast-burnout' // Fast start → early burnout
  | 'consistent' // Consistent pace from start to finish
  | 'slow-ramp-strong' // Slow start → constant ramp → strongest at the end
  | 'mid-attack' // Average start → mid‑race attack → stable finish
  | 'erratic' // Erratic pace with highs and lows
  | 'aggro-plateau-recovery' // Early aggression → mid plateau → late recovery
  | 'conserve-finisher' // Early conserve → late‑race finisher
  | 'weather-dependent' // Track/weather‑dependent performance swings
  | 'high-speed-poor-endurance' // High peak speed → poor endurance
  | 'low-speed-excellent-endurance' // Low peak speed → excellent endurance
  | 'clutch-comeback' // Late‑race clutch comeback
  | 'risk-taker' // Risk‑taking, unpredictable attacker
  | 'defender' // Strong defender, hard to pass
  | 'sprinter-cooldown'; // Short‑burst sprinter → cooldown cycles

interface Racer {
  id: number;
  name: string;
  color: string;
  position: number;
  speed: number;
  finished: boolean;
  finishTime?: number;
  finishOrder?: number;
  warmupOffset?: number;
  behavior: RacingBehavior;
  behaviorCycle?: number; // For cyclic behaviors
  earlyLeader?: boolean; // True if was in top 3 early in the race
}

const DUCK_COLORS = [
  '#FFD700', // Gold
  '#FF6B6B', // Coral
  '#4ECDC4', // Teal
  '#9B59B6', // Purple
  '#3498DB', // Blue
  '#E67E22', // Orange
  '#1ABC9C', // Emerald
  '#E91E63', // Pink
  '#00BCD4', // Cyan
  '#8BC34A', // Light Green
  '#FF5722', // Deep Orange
  '#673AB7', // Deep Purple
  '#009688', // Teal Dark
  '#FFC107', // Amber
  '#795548', // Brown
  '#607D8B', // Blue Grey
  '#F44336', // Red
  '#2196F3', // Light Blue
  '#4CAF50', // Green
  '#FFEB3B', // Yellow
];

const RACING_BEHAVIORS: RacingBehavior[] = [
  'slow-mid-fade',
  'fast-burnout',
  'consistent',
  'slow-ramp-strong',
  'mid-attack',
  'erratic',
  'aggro-plateau-recovery',
  'conserve-finisher',
  'weather-dependent',
  'high-speed-poor-endurance',
  'low-speed-excellent-endurance',
  'clutch-comeback',
  'risk-taker',
  'defender',
  'sprinter-cooldown',
];

// Calculate speed multiplier based on racing behavior and race progress (0-1)
const calculateBehaviorMultiplier = (behavior: RacingBehavior, progress: number, behaviorCycle: number): number => {
  switch (behavior) {
    case 'slow-mid-fade':
      // Slow start (0.6x), mid surge (1.4x at 50%), late fade (0.7x)
      if (progress < 0.3) return 0.6 + progress * 0.5;
      if (progress < 0.6) return 0.75 + (progress - 0.3) * 2.17;
      return 1.4 - (progress - 0.6) * 1.75;
      
    case 'fast-burnout':
      // Fast start (1.5x), exponential burnout
      return 1.5 * Math.exp(-progress * 2.5);
      
    case 'consistent':
      // Minimal variation around 1.0
      return 0.95 + Math.sin(progress * 20) * 0.05;
      
    case 'slow-ramp-strong':
      // Slow start (0.5x), constant ramp, strongest at end (1.6x)
      return 0.5 + progress * 1.1;
      
    case 'mid-attack':
      // Average start (0.9x), mid-race attack (1.5x at 40-60%), stable finish (1.0x)
      if (progress < 0.3) return 0.9;
      if (progress < 0.4) return 0.9 + (progress - 0.3) * 6;
      if (progress < 0.6) return 1.5;
      if (progress < 0.7) return 1.5 - (progress - 0.6) * 5;
      return 1.0;
      
    case 'erratic':
      // Random highs (1.6x) and lows (0.4x)
      return 1.0 + Math.sin(progress * 15 + behaviorCycle) * 0.6;
      
    case 'aggro-plateau-recovery':
      // Early aggression (1.4x), mid plateau (0.8x), late recovery (1.2x)
      if (progress < 0.25) return 1.4;
      if (progress < 0.65) return 0.8;
      return 0.8 + (progress - 0.65) * 1.14;
      
    case 'conserve-finisher':
      // Early conserve (0.7x), explosive late-race (1.7x)
      if (progress < 0.6) return 0.7;
      return 0.7 + (progress - 0.6) * 2.5;
      
    case 'weather-dependent':
      // Random swings to simulate track/weather changes
      const weatherFactor = Math.sin(progress * 8 + behaviorCycle * 2) * 0.4;
      return 1.0 + weatherFactor;
      
    case 'high-speed-poor-endurance':
      // High initial speed (1.6x), declining rapidly
      return 1.6 - progress * 0.9;
      
    case 'low-speed-excellent-endurance':
      // Low initial speed (0.65x), slight improvement
      return 0.65 + progress * 0.4;
      
    case 'clutch-comeback':
      // Terrible until late (0.6x), then explosive comeback (1.8x)
      if (progress < 0.7) return 0.6;
      return 0.6 + (progress - 0.7) * 4;
      
    case 'risk-taker':
      // Unpredictable with extreme variations
      const riskFactor = Math.sin(progress * 25 + behaviorCycle * 3) * 0.7;
      return Math.max(0.4, 1.0 + riskFactor);
      
    case 'defender':
      // Steady, slight increase when behind
      return 1.05 + Math.sin(progress * 10) * 0.08;
      
    case 'sprinter-cooldown':
      // Cycles of sprint (1.6x) then cooldown (0.6x)
      const cycle = (progress * 3.33) % 1;
      return cycle < 0.5 ? 1.6 : 0.6;
      
    default:
      return 1.0;
  }
};

export const useRace = () => {
  const [racers, setRacers] = useState<Racer[]>([]);
  const [isRacing, setIsRacing] = useState(false);
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [currentCountdown, setCurrentCountdown] = useState(0);
  const [winner, setWinner] = useState<Racer | null>(null);
  const [loser, setLoser] = useState<Racer | null>(null);
  const [raceFinished, setRaceFinished] = useState(false);
  
  const animationRef = useRef<number>();
  const finishOrderRef = useRef(0);
  const countdownIntervalRef = useRef<NodeJS.Timeout>();
  const earlyLeadersIdentifiedRef = useRef(false);
  const raceStartTimeRef = useRef(0);

  const initializeRacers = useCallback((names: string[]) => {
    const validNames = names.filter(n => n.trim()).slice(0, 2000);
    const newRacers: Racer[] = validNames.map((name, index) => {
      // Randomly assign a racing behavior to each racer
      const behavior = RACING_BEHAVIORS[Math.floor(Math.random() * RACING_BEHAVIORS.length)];
      console.log(`🎭 [Behavior Assignment] ${name} → ${behavior}`);
      return {
        id: index,
        name: name.trim(),
        color: DUCK_COLORS[index % DUCK_COLORS.length],
        position: 0,
        speed: 0.5 + Math.random() * 1.5,
        finished: false,
        warmupOffset: 0,
        behavior,
        behaviorCycle: Math.random() * Math.PI * 2, // Random phase for cyclic behaviors
      };
    });
    console.log(`🎭 [Behaviors Summary] Total racers: ${newRacers.length}, Unique behaviors assigned`);
    setRacers(newRacers);
    setWinner(null);
    setLoser(null);
    setRaceFinished(false);
    finishOrderRef.current = 0;
  }, []);

  const startCountdown = useCallback((countdownTime: number, onComplete: () => void) => {
    if (countdownTime === 0) {
      onComplete();
      return;
    }
    
    setIsCountingDown(true);
    setCurrentCountdown(countdownTime);
    
    countdownIntervalRef.current = setInterval(() => {
      setCurrentCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownIntervalRef.current);
          setIsCountingDown(false);
          onComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  // Warmup animation during countdown
  useEffect(() => {
    if (!isCountingDown) return;
    
    const warmupInterval = setInterval(() => {
      setRacers(prev => prev.map(racer => ({
        ...racer,
        warmupOffset: (Math.random() - 0.5) * 20,
      })));
    }, 150);
    
    return () => clearInterval(warmupInterval);
  }, [isCountingDown]);

  // Race animation
  useEffect(() => {
    if (!isRacing) return;
    
    const startTime = Date.now();
    raceStartTimeRef.current = startTime;
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      
      setRacers(prev => {
        // Identify early leaders at ~15% race progress (around 3 seconds into typical race)
        if (!earlyLeadersIdentifiedRef.current && elapsed > 3000) {
          const sorted = [...prev].sort((a, b) => b.position - a.position);
          const top3Ids = new Set(sorted.slice(0, 3).map(r => r.id));
          earlyLeadersIdentifiedRef.current = true;
          
          console.log('🥇 [Early Leaders Identified at 3s]');
          sorted.slice(0, 3).forEach((racer, idx) => {
            console.log(`  ${idx + 1}. ${racer.name} (${racer.behavior}) - Position: ${racer.position.toFixed(1)}%`);
          });
          
          // Mark early leaders
          prev.forEach(racer => {
            if (top3Ids.has(racer.id)) {
              racer.earlyLeader = true;
            }
          });
        }
        
        const updated = prev.map(racer => {
          if (racer.finished) return racer;
          
          // Calculate race progress (0-1)
          const progress = racer.position / 100;
          
          // Get behavior-based speed multiplier
          const behaviorMultiplier = calculateBehaviorMultiplier(
            racer.behavior,
            progress,
            racer.behaviorCycle || 0
          );
          
          // Log behavior multiplier for first racer every 2 seconds for demonstration
          if (racer.id === 0 && Math.floor(elapsed / 2000) !== Math.floor((elapsed - 16) / 2000)) {
            console.log(`📊 [${racer.name}] Progress: ${(progress * 100).toFixed(1)}%, Behavior: ${racer.behavior}, Multiplier: ${behaviorMultiplier.toFixed(2)}x`);
          }
          
          // Small random wobble for variety
          const wobble = (Math.random() - 0.5) * 0.3;
          
          // Early leader penalty: reduce speed after 25% to prevent early leaders from winning
          let earlyLeaderPenalty = 1.0;
          if (racer.earlyLeader && progress > 0.25) {
            // Progressive penalty that increases as race progresses
            // At 25% progress: 0.85x speed, at 100%: 0.55x speed
            earlyLeaderPenalty = 0.85 - (progress - 0.25) * 0.4;
            
            // Log early leader penalty application
            if (progress > 0.3 && Math.floor(elapsed / 2000) !== Math.floor((elapsed - 16) / 2000)) {
              console.log(`⚠️ [Early Leader Penalty] ${racer.name} - Progress: ${(progress * 100).toFixed(1)}%, Penalty: ${earlyLeaderPenalty.toFixed(2)}x`);
            }
          }
          
          // Combine base speed, behavior, wobble, and early leader penalty
          const adjustedSpeed = racer.speed * behaviorMultiplier * earlyLeaderPenalty;
          const newPosition = racer.position + adjustedSpeed + wobble;
          
          if (newPosition >= 100) {
            finishOrderRef.current += 1;
            return {
              ...racer,
              position: 100,
              finished: true,
              finishTime: Date.now() - startTime,
              finishOrder: finishOrderRef.current,
            };
          }
          
          return { ...racer, position: newPosition };
        });
        
        const allFinished = updated.every(r => r.finished);
        if (allFinished) {
          setIsRacing(false);
          
          const sorted = [...updated].sort((a, b) => (a.finishOrder || 0) - (b.finishOrder || 0));
          setWinner(sorted[0]);
          setLoser(sorted[sorted.length - 1]);
          setRaceFinished(true);
          
          console.log('🏁 [Race Finished] Final Results:');
          sorted.slice(0, 5).forEach((racer, idx) => {
            const earlyLeaderTag = racer.earlyLeader ? ' ⚠️ (was early leader)' : '';
            console.log(`  ${idx + 1}. ${racer.name} (${racer.behavior})${earlyLeaderTag}`);
          });
          
          const winnerWasEarlyLeader = sorted[0].earlyLeader;
          if (winnerWasEarlyLeader) {
            console.log('❌ [FAILED] Winner WAS an early leader!');
          } else {
            console.log('✅ [SUCCESS] Winner was NOT an early leader!');
          }
        }
        
        return updated;
      });
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isRacing]);

  const startRace = useCallback((countdownTime: number) => {
    setRacers(prev => prev.map(racer => ({
      ...racer,
      position: 0,
      speed: 0.5 + Math.random() * 1.5,
      finished: false,
      finishTime: undefined,
      finishOrder: undefined,
      warmupOffset: 0,
      // Keep behavior but randomize cycle for variety
      behaviorCycle: Math.random() * Math.PI * 2,
      earlyLeader: false, // Reset early leader status
    })));
    setWinner(null);
    setLoser(null);
    setRaceFinished(false);
    finishOrderRef.current = 0;
    earlyLeadersIdentifiedRef.current = false; // Reset early leader tracking
    
    startCountdown(countdownTime, () => {
      setIsRacing(true);
    });
  }, [startCountdown]);

  const resetRace = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    setIsRacing(false);
    setIsCountingDown(false);
    setCurrentCountdown(0);
    setRacers(prev => prev.map(racer => ({
      ...racer,
      position: 0,
      finished: false,
      finishTime: undefined,
      finishOrder: undefined,
      earlyLeader: false,
    })));
    setWinner(null);
    setLoser(null);
    setRaceFinished(false);
    finishOrderRef.current = 0;
    earlyLeadersIdentifiedRef.current = false;
  }, []);

  return {
    racers,
    isRacing,
    isCountingDown,
    currentCountdown,
    winner,
    loser,
    raceFinished,
    initializeRacers,
    startRace,
    resetRace,
  };
};
