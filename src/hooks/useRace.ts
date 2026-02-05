import { useState, useCallback, useRef, useEffect } from 'react';

interface Racer {
  id: number;
  name: string;
  color: string;
  position: number;
  speed: number;
  finished: boolean;
  finishTime?: number;
  finishOrder?: number;
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

  const initializeRacers = useCallback((names: string[]) => {
    const validNames = names.filter(n => n.trim()).slice(0, 2000);
    const newRacers: Racer[] = validNames.map((name, index) => ({
      id: index,
      name: name.trim(),
      color: DUCK_COLORS[index % DUCK_COLORS.length],
      position: 0,
      speed: 0.5 + Math.random() * 1.5, // Random speed between 0.5 and 2
      finished: false,
    }));
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
    
    const interval = setInterval(() => {
      setCurrentCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsCountingDown(false);
          onComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const startRace = useCallback((countdownTime: number) => {
    // Reset positions and assign new random speeds
    setRacers(prev => prev.map(racer => ({
      ...racer,
      position: 0,
      speed: 0.5 + Math.random() * 1.5,
      finished: false,
      finishTime: undefined,
      finishOrder: undefined,
    })));
    setWinner(null);
    setLoser(null);
    setRaceFinished(false);
    finishOrderRef.current = 0;
    
    startCountdown(countdownTime, () => {
      setIsRacing(true);
    });
  }, [startCountdown]);

  useEffect(() => {
    if (!isRacing) return;
    
    const startTime = Date.now();
    
    const animate = () => {
      setRacers(prev => {
        const updated = prev.map(racer => {
          if (racer.finished) return racer;
          
          // Add some randomness to movement
          const wobble = (Math.random() - 0.5) * 0.3;
          const newPosition = racer.position + racer.speed + wobble;
          
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
        
        // Check if race is complete
        const allFinished = updated.every(r => r.finished);
        if (allFinished) {
          setIsRacing(false);
          
          // Find winner and loser
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
    initializeRacers,
    startRace,
    resetRace,
  };
};
