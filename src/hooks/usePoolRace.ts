import { useState, useCallback, useRef, useEffect } from 'react';

interface Racer {
  id: number;
  name: string;
  color: string;
  position: number;
  speed: number;
  baseSpeed: number;
  finished: boolean;
  finishTime?: number;
  finishOrder?: number;
  warmupOffset?: number;
  yOffset?: number;
}

const DUCK_COLORS = [
  '#FFD700', '#FF6B6B', '#4ECDC4', '#9B59B6', '#3498DB',
  '#E67E22', '#1ABC9C', '#E91E63', '#00BCD4', '#8BC34A',
  '#FF5722', '#673AB7', '#009688', '#FFC107', '#795548',
  '#607D8B', '#F44336', '#2196F3', '#4CAF50', '#FFEB3B',
];

const SPRINT_DURATION = 5000; // Last 5 seconds sprint phase

export const usePoolRace = () => {
  const [racers, setRacers] = useState<Racer[]>([]);
  const [isRacing, setIsRacing] = useState(false);
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [currentCountdown, setCurrentCountdown] = useState(0);
  const [winner, setWinner] = useState<Racer | null>(null);
  const [loser, setLoser] = useState<Racer | null>(null);
  const [raceFinished, setRaceFinished] = useState(false);
  const [isSprintPhase, setIsSprintPhase] = useState(false);
  
  const animationRef = useRef<number | null>(null);
  const finishOrderRef = useRef(0);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const raceStartTimeRef = useRef<number>(0);
  const raceDurationRef = useRef<number>(10000);
  const isRacingRef = useRef(false);

  const initializeRacers = useCallback((names: string[]) => {
    const validNames = names.filter(n => n.trim()).slice(0, 2000);
    const newRacers: Racer[] = validNames.map((name, index) => ({
      id: index,
      name: name.trim(),
      color: DUCK_COLORS[index % DUCK_COLORS.length],
      position: 0,
      speed: 0,
      baseSpeed: 0.3 + Math.random() * 0.7,
      finished: false,
      warmupOffset: 0,
      yOffset: (Math.random() - 0.5) * 8,
    }));
    setRacers(newRacers);
    setWinner(null);
    setLoser(null);
    setRaceFinished(false);
    setIsSprintPhase(false);
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
          if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current);
          }
          setIsCountingDown(false);
          onComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  // Preserve hook order - warmup removed but useEffect kept for stable hook count
  useEffect(() => {
    // intentionally empty — movement handled by race animation loop
  }, [isCountingDown]);

  // Race animation - characters move based on countdown duration and track length
  useEffect(() => {
    if (!isRacing) {
      isRacingRef.current = false;
      return;
    }
    
    isRacingRef.current = true;
    const startTime = raceStartTimeRef.current;
    const totalDuration = raceDurationRef.current;
    
    let localFinishOrder = 0;
    let lastFrameTime = startTime;
    
    const animate = () => {
      if (!isRacingRef.current) return;
      
      const now = Date.now();
      const elapsed = now - startTime;
      const deltaTime = now - lastFrameTime;
      lastFrameTime = now;
      
      // Target speed: 100% track / totalDuration ms, per frame
      const baseFrameSpeed = (100 / totalDuration) * deltaTime;
      
      setRacers(prev => {
        const updated = prev.map(racer => {
          if (racer.finished) return racer;
          
          // Randomness: each racer gets a multiplier between 0.4 and 1.8
          const rand = Math.random();
          let speedMultiplier: number;
          if (rand > 0.9) {
            speedMultiplier = 1.4 + Math.random() * 0.4; // burst
          } else if (rand < 0.1) {
            speedMultiplier = 0.3 + Math.random() * 0.2; // slow down
          } else {
            speedMultiplier = 0.7 + Math.random() * 0.6; // normal variance
          }
          
          const currentSpeed = baseFrameSpeed * racer.baseSpeed * speedMultiplier * 1.8;
          
          const newYOffset = (racer.yOffset || 0) + (Math.random() - 0.5) * 2;
          const clampedYOffset = Math.max(-15, Math.min(15, newYOffset));
          
          const newPosition = racer.position + currentSpeed;
          
          if (newPosition >= 100) {
            localFinishOrder += 1;
            return {
              ...racer,
              position: 100,
              finished: true,
              finishTime: elapsed,
              finishOrder: localFinishOrder,
              speed: currentSpeed,
            };
          }
          
          return { 
            ...racer, 
            position: newPosition, 
            speed: currentSpeed,
            yOffset: clampedYOffset,
          };
        });
        
        const nowAllFinished = updated.every(r => r.finished);
        if (nowAllFinished && updated.length > 0) {
          isRacingRef.current = false;
          setIsRacing(false);
          setIsSprintPhase(false);
          
          const sorted = [...updated].sort((a, b) => (a.finishOrder || 0) - (b.finishOrder || 0));
          setWinner(sorted[0]);
          setLoser(sorted[sorted.length - 1]);
          setRaceFinished(true);
        }
        
        return updated;
      });
      
      if (isRacingRef.current) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isRacing]);

  const startRace = useCallback((countdownTime: number) => {
    const baseDuration = 8000;
    const countdownBonus = countdownTime * 1500;
    raceDurationRef.current = Math.min(baseDuration + countdownBonus, 20000);
    
    setRacers(prev => prev.map(racer => ({
      ...racer,
      position: 0,
      speed: 0,
      baseSpeed: 0.3 + Math.random() * 0.7,
      finished: false,
      finishTime: undefined,
      finishOrder: undefined,
      warmupOffset: 0,
      yOffset: (Math.random() - 0.5) * 8,
    })));
    setWinner(null);
    setLoser(null);
    setRaceFinished(false);
    setIsSprintPhase(false);
    finishOrderRef.current = 0;
    
    // Race duration = countdown time (min 5s) — racers finish around when countdown hits 0
    const duration = Math.max(countdownTime * 1000, 5000);
    raceStartTimeRef.current = Date.now();
    raceDurationRef.current = duration;
    setIsRacing(true);
    
    if (countdownTime > 0) {
      startCountdown(countdownTime, () => {
        // Countdown finished — race continues until all cross finish
      });
    }
  }, [startCountdown]);

  const resetRace = useCallback(() => {
    isRacingRef.current = false;
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }
    setIsRacing(false);
    setIsCountingDown(false);
    setCurrentCountdown(0);
    setIsSprintPhase(false);
    setRacers(prev => prev.map(racer => ({
      ...racer,
      position: 0,
      speed: 0,
      finished: false,
      finishTime: undefined,
      finishOrder: undefined,
      yOffset: (Math.random() - 0.5) * 8,
    })));
    setWinner(null);
    setLoser(null);
    setRaceFinished(false);
    finishOrderRef.current = 0;
  }, []);

  return {
    racers,
    isRacing,
    isCountingDown,
    currentCountdown,
    winner,
    loser,
    raceFinished,
    isSprintPhase,
    initializeRacers,
    startRace,
    resetRace,
  };
};
