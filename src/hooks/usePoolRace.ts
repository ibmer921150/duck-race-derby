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
  
  const animationRef = useRef<number>();
  const finishOrderRef = useRef(0);
  const countdownIntervalRef = useRef<NodeJS.Timeout>();
  const raceStartTimeRef = useRef<number>(0);
  const raceDurationRef = useRef<number>(10000); // Will be calculated based on countdown

  const initializeRacers = useCallback((names: string[]) => {
    const validNames = names.filter(n => n.trim()).slice(0, 2000);
    const newRacers: Racer[] = validNames.map((name, index) => ({
      id: index,
      name: name.trim(),
      color: DUCK_COLORS[index % DUCK_COLORS.length],
      position: 0,
      speed: 0,
      baseSpeed: 0.3 + Math.random() * 0.7, // Base speed varies by racer
      finished: false,
      warmupOffset: 0,
      yOffset: (Math.random() - 0.5) * 8, // Slight Y variation
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
        warmupOffset: (Math.random() - 0.5) * 15,
        position: Math.random() * 3, // Slight movement at start
      })));
    }, 150);
    
    return () => clearInterval(warmupInterval);
  }, [isCountingDown]);

  // Race animation with sprint phase
  useEffect(() => {
    if (!isRacing) return;
    
    const startTime = raceStartTimeRef.current;
    const totalDuration = raceDurationRef.current;
    const sprintStartTime = totalDuration - SPRINT_DURATION;
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const isInSprintPhase = elapsed >= sprintStartTime;
      
      setIsSprintPhase(isInSprintPhase);
      
      setRacers(prev => {
        const updated = prev.map(racer => {
          if (racer.finished) return racer;
          
          let currentSpeed: number;
          
          if (isInSprintPhase) {
            // Sprint phase: everyone speeds up dramatically
            // Faster racers get a bigger boost
            const sprintProgress = (elapsed - sprintStartTime) / SPRINT_DURATION;
            const sprintBoost = 1 + sprintProgress * 2; // Increases over time
            currentSpeed = (racer.baseSpeed * 2 + Math.random() * 1.5) * sprintBoost;
          } else {
            // Normal phase: random speed variations
            // Some go fast, some go slow
            const speedVariation = Math.random();
            if (speedVariation > 0.8) {
              // 20% chance to go fast
              currentSpeed = racer.baseSpeed * 2 + Math.random() * 0.5;
            } else if (speedVariation < 0.2) {
              // 20% chance to go slow
              currentSpeed = racer.baseSpeed * 0.3 + Math.random() * 0.2;
            } else {
              // 60% normal speed with variation
              currentSpeed = racer.baseSpeed * (0.5 + Math.random() * 0.8);
            }
          }
          
          // Add wobble to Y position
          const newYOffset = racer.yOffset! + (Math.random() - 0.5) * 2;
          const clampedYOffset = Math.max(-15, Math.min(15, newYOffset));
          
          const newPosition = racer.position + currentSpeed;
          
          if (newPosition >= 100) {
            finishOrderRef.current += 1;
            return {
              ...racer,
              position: 100,
              finished: true,
              finishTime: Date.now() - startTime,
              finishOrder: finishOrderRef.current,
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
        
        const allFinished = updated.every(r => r.finished);
        if (allFinished) {
          setIsRacing(false);
          setIsSprintPhase(false);
          
          const sorted = [...updated].sort((a, b) => (a.finishOrder || 0) - (b.finishOrder || 0));
          setWinner(sorted[0]);
          setLoser(sorted[sorted.length - 1]);
          setRaceFinished(true);
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
    // Calculate race duration based on countdown (longer countdown = longer race)
    // Minimum 8 seconds, maximum 20 seconds
    const baseDuration = 8000;
    const countdownBonus = countdownTime * 1500; // Each countdown second adds 1.5s to race
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
    
    startCountdown(countdownTime, () => {
      raceStartTimeRef.current = Date.now();
      setIsRacing(true);
    });
  }, [startCountdown]);

  const resetRace = useCallback(() => {
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
