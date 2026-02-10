import { useState, useCallback, useRef, useEffect, useLayoutEffect } from 'react';
import { flushSync } from 'react-dom';

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

export const usePoolRace = () => {
  const [racers, setRacers] = useState<Racer[]>([]);
  const [isRacing, setIsRacing] = useState(false);
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [currentCountdown, setCurrentCountdown] = useState(0);
  const [winner, setWinner] = useState<Racer | null>(null);
  const [loser, setLoser] = useState<Racer | null>(null);
  const [raceFinished, setRaceFinished] = useState(false);
  const [isSprintPhase, setIsSprintPhase] = useState(false);
  const [totalCountdown, setTotalCountdown] = useState(0);
  const [renderTrigger, setRenderTrigger] = useState(0); // Force re-render trigger
  
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

  const startCountdown = useCallback((countdownTime: number) => {
    if (countdownTime === 0) return;
    
    setIsCountingDown(true);
    setCurrentCountdown(countdownTime);
    setTotalCountdown(countdownTime);
    
    countdownIntervalRef.current = setInterval(() => {
      setCurrentCountdown(prev => {
        if (prev <= 1) {
          if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current);
          }
          setIsCountingDown(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  // Preserve hook order
  useEffect(() => {
    // intentionally empty — movement handled by race animation loop
  }, [isCountingDown]);

  // Race animation - Using useLayoutEffect to run synchronously before browser paint
  useLayoutEffect(() => {
    console.log('🎬 [useEffect] TRIGGERED - isRacing:', isRacing);
    
    if (!isRacing) {
      console.log('🎬 [useEffect] Not racing, cleaning up and exiting');
      isRacingRef.current = false;
      return;
    }
    
    console.log('🎬 [useEffect] Racing is TRUE - starting animation setup');
    isRacingRef.current = true;
    const startTime = raceStartTimeRef.current;
    const totalDuration = raceDurationRef.current;
    
    console.log('🎬 [useEffect] Animation params - startTime:', startTime, 'totalDuration:', totalDuration);
    
    let localFinishOrder = 0;
    let lastFrameTime: number | null = null;
    let frameCount = 0;
    
    const animate = () => {
      frameCount++;
      
      if (!isRacingRef.current) {
        console.log('⏸️ [animate] Frame', frameCount, '- isRacingRef is false, stopping');
        return;
      }
      
      if (frameCount <= 3) {
        console.log('🎞️ [animate] Frame', frameCount, 'starting...');
      }
      
      const now = Date.now();
      const elapsed = now - startTime;
      
      // Initialize lastFrameTime on first frame
      if (lastFrameTime === null) {
        lastFrameTime = now - 20; // Ensure first frame has good deltaTime
        console.log('🎞️ [animate] Frame', frameCount, '- First frame! Initializing lastFrameTime');
      }
      
      let deltaTime = now - lastFrameTime;
      // Ensure deltaTime is reasonable (between 10-60ms)
      deltaTime = Math.max(10, Math.min(60, deltaTime));
      lastFrameTime = now;
      
      if (frameCount <= 3) {
        console.log('🎞️ [animate] Frame', frameCount, '- elapsed:', elapsed, 'deltaTime:', deltaTime);
      }
      
      // Base speed: cover 100% of track in totalDuration
      const baseFrameSpeed = (100 / totalDuration) * deltaTime;
      
      if (frameCount <= 3) {
        console.log('🎞️ [animate] Frame', frameCount, '- baseFrameSpeed:', baseFrameSpeed);
      }
      
      // Sprint phase in last 20% of race
      const isInSprintPhase = elapsed > totalDuration * 0.8;
      
      // FIX: Force synchronous update on first frame to trigger immediate repaint in VS Code Simple Browser
      const updateFn = () => {
        setRacers(prev => {
          if (frameCount === 1) {
            console.log('🏃 [animate] Frame 1 - Updating racers. First racer before:', prev[0]?.name, 'position:', prev[0]?.position);
          }
        
        const updated = prev.map(racer => {
          if (racer.finished) return racer;
          
          // Randomness: bursts and slowdowns
          const rand = Math.random();
          let speedMultiplier: number;
          if (rand > 0.92) {
            speedMultiplier = 1.5 + Math.random() * 0.5; // burst
          } else if (rand < 0.08) {
            speedMultiplier = 0.3 + Math.random() * 0.2; // slow
          } else {
            speedMultiplier = 0.7 + Math.random() * 0.6; // normal
          }
          
          // Sprint boost
          if (isInSprintPhase) {
            speedMultiplier *= 1.3;
          }
          
          const currentSpeed = baseFrameSpeed * racer.baseSpeed * speedMultiplier * 3.2;
          
          const newPosition = racer.position + currentSpeed;
          
          if (frameCount === 1 && racer.id === 0) {
            console.log('🏃 [animate] Frame 1 - Racer 0 calc: pos', racer.position, '+ speed', currentSpeed, '=', newPosition);
          }
          
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
        
        // Update sprint phase state
        if (isInSprintPhase) {
          setIsSprintPhase(true);
        }
        
          if (frameCount === 1) {
            console.log('🏃 [animate] Frame 1 - First racer after update:', updated[0]?.name, 'position:', updated[0]?.position);
          }
          
          return updated;
        });
      };
      
      // FIX: Use flushSync on first frame to force synchronous DOM update and repaint
      if (frameCount === 1) {
        console.log('🎨 [animate] Frame 1 - Using flushSync to force immediate render');
        flushSync(updateFn);
        
        // ADDITIONAL FIX: Force a DOM reflow to trigger repaint in VS Code Simple Browser
        // This reads a layout property which forces the browser to recalculate and repaint
        console.log('🔄 [animate] Frame 1 - Forcing DOM reflow');
        if (typeof document !== 'undefined') {
          void document.body.offsetHeight; // Force reflow
        }
        
        // Force React to re-render by updating a dummy state
        setRenderTrigger(prev => prev + 1);
      } else {
        updateFn();
        // Update render trigger every frame to ensure re-renders
        if (frameCount % 2 === 0) { // Every other frame to avoid excessive updates
          setRenderTrigger(prev => prev + 1);
        }
      }
      
      if (isRacingRef.current) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        console.log('⏸️ [animate] Frame', frameCount, '- Not scheduling next frame, racing stopped');
      }
    };
    
    console.log('🎬 [useEffect] Scheduling first requestAnimationFrame');
    animationRef.current = requestAnimationFrame(animate);
    console.log('🎬 [useEffect] First RAF scheduled with ID:', animationRef.current);
    console.log('🎬 [useEffect] First RAF scheduled with ID:', animationRef.current);
    
    return () => {
      console.log('🧹 [useEffect cleanup] Cleaning up animation');
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isRacing]);

  const startRace = useCallback((countdownTime: number) => {
    console.log('🏁 [startRace] CALLED - countdownTime:', countdownTime);
    console.log('🏁 [startRace] Current isRacing state:', isRacing);
    
    // Reset racers
    setRacers(prev => {
      console.log('🏁 [startRace] Resetting', prev.length, 'racers to position 0');
      return prev.map(racer => ({
        ...racer,
        position: 0,
        speed: 0,
        baseSpeed: 0.3 + Math.random() * 0.7,
        finished: false,
        finishTime: undefined,
        finishOrder: undefined,
        warmupOffset: 0,
        yOffset: (Math.random() - 0.5) * 8,
      }));
    });
    setWinner(null);
    setLoser(null);
    setRaceFinished(false);
    setIsSprintPhase(false);
    finishOrderRef.current = 0;
    
    // Race duration = exactly the countdown time
    // Characters will move from start to finish in this timeframe
    const duration = countdownTime > 0 ? countdownTime * 1000 : 3000;
    raceStartTimeRef.current = Date.now();
    raceDurationRef.current = duration;
    
    console.log('🏁 [startRace] Race params set - startTime:', raceStartTimeRef.current, 'duration:', duration);
    console.log('🏁 [startRace] About to call setIsRacing(true) - this should trigger useEffect');
    
    // Start racing AND countdown simultaneously
    setIsRacing(true);
    
    console.log('🏁 [startRace] setIsRacing(true) called, isRacingRef.current:', isRacingRef.current);
    
    if (countdownTime > 0) {
      startCountdown(countdownTime);
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
    setTotalCountdown(0);
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
    renderTrigger, // Expose render trigger for debugging
    isCountingDown,
    currentCountdown,
    totalCountdown,
    winner,
    loser,
    raceFinished,
    isSprintPhase,
    initializeRacers,
    startRace,
    resetRace,
  };
};
