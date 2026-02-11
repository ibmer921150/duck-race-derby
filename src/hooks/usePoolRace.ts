import { useState, useCallback, useRef, useEffect, useLayoutEffect } from 'react';
import { flushSync } from 'react-dom';

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
  baseSpeed: number;
  finished: boolean;
  finishTime?: number;
  finishOrder?: number;
  warmupOffset?: number;
  yOffset?: number;
  behavior: RacingBehavior;
  behaviorCycle?: number; // For cyclic behaviors
  earlyLeader?: boolean; // True if was in top 3 early in the race
  dramaticLeader?: boolean; // True if this racer was selected as a dramatic leader
  dramaticBurstUntil?: number; // Timestamp when dramatic boost ends
}

const DUCK_COLORS = [
  '#FFD700', '#FF6B6B', '#4ECDC4', '#9B59B6', '#3498DB',
  '#E67E22', '#1ABC9C', '#E91E63', '#00BCD4', '#8BC34A',
  '#FF5722', '#673AB7', '#009688', '#FFC107', '#795548',
  '#607D8B', '#F44336', '#2196F3', '#4CAF50', '#FFEB3B',
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
      if (progress < 0.3) return 0.6 + progress * 0.5; // 0.6 -> 0.75
      if (progress < 0.6) return 0.75 + (progress - 0.3) * 2.17; // 0.75 -> 1.4
      return 1.4 - (progress - 0.6) * 1.75; // 1.4 -> 0.7
      
    case 'fast-burnout':
      // Fast start (1.5x), exponential burnout
      return 1.5 * Math.exp(-progress * 2.5); // 1.5 -> 0.4
      
    case 'consistent':
      // Minimal variation around 1.0
      return 0.95 + Math.sin(progress * 20) * 0.05;
      
    case 'slow-ramp-strong':
      // Slow start (0.5x), constant ramp, strongest at end (1.6x)
      return 0.5 + progress * 1.1;
      
    case 'mid-attack':
      // Average start (0.9x), mid-race attack (1.5x at 40-60%), stable finish (1.0x)
      if (progress < 0.3) return 0.9;
      if (progress < 0.4) return 0.9 + (progress - 0.3) * 6; // Ramp up
      if (progress < 0.6) return 1.5; // Peak
      if (progress < 0.7) return 1.5 - (progress - 0.6) * 5; // Ramp down
      return 1.0;
      
    case 'erratic':
      // Random highs (1.6x) and lows (0.4x) with more variation
      return 1.0 + Math.sin(progress * 15 + behaviorCycle) * 0.6;
      
    case 'aggro-plateau-recovery':
      // Early aggression (1.4x), mid plateau (0.8x), late recovery (1.2x)
      if (progress < 0.25) return 1.4;
      if (progress < 0.65) return 0.8;
      return 0.8 + (progress - 0.65) * 1.14; // 0.8 -> 1.2
      
    case 'conserve-finisher':
      // Early conserve (0.7x), explosive late-race (1.7x)
      if (progress < 0.6) return 0.7;
      return 0.7 + (progress - 0.6) * 2.5; // 0.7 -> 1.7
      
    case 'weather-dependent':
      // Random swings to simulate track/weather changes
      const weatherFactor = Math.sin(progress * 8 + behaviorCycle * 2) * 0.4;
      return 1.0 + weatherFactor;
      
    case 'high-speed-poor-endurance':
      // High initial speed (1.6x), declining rapidly
      return 1.6 - progress * 0.9; // 1.6 -> 0.7
      
    case 'low-speed-excellent-endurance':
      // Low initial speed (0.65x), slight improvement over time
      return 0.65 + progress * 0.4; // 0.65 -> 1.05
      
    case 'clutch-comeback':
      // Terrible until late (0.6x), then explosive comeback (1.8x)
      if (progress < 0.7) return 0.6;
      return 0.6 + (progress - 0.7) * 4; // 0.6 -> 1.8
      
    case 'risk-taker':
      // Unpredictable with extreme variations
      const riskFactor = Math.sin(progress * 25 + behaviorCycle * 3) * 0.7;
      return Math.max(0.4, 1.0 + riskFactor); // 0.4 to 1.7
      
    case 'defender':
      // Steady, slight increase when behind (simulated by consistent 1.05x)
      return 1.05 + Math.sin(progress * 10) * 0.08;
      
    case 'sprinter-cooldown':
      // Cycles of sprint (1.6x for 15% race) then cooldown (0.6x for 15% race)
      const cycle = (progress * 3.33) % 1; // Create ~3 cycles
      return cycle < 0.5 ? 1.6 : 0.6;
      
    default:
      return 1.0;
  }
};

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
  const earlyLeadersIdentifiedRef = useRef(false);
  const finishOrderRef = useRef(0);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const raceStartTimeRef = useRef<number>(0);
  const raceDurationRef = useRef<number>(10000);
  const isRacingRef = useRef(false);
  const lastFrameTimeRef = useRef<number>(0);
  const dramaticLeaderIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const dramaticLeadersUsedRef = useRef<Set<number>>(new Set());
  const dramaticLeaderBoost = 4.0; // 4x speed boost during dramatic burst

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
        speed: 0,
        baseSpeed: 0.3 + Math.random() * 0.7,
        finished: false,
        warmupOffset: 0,
        yOffset: (Math.random() - 0.5) * 8,
        behavior,
        behaviorCycle: Math.random() * Math.PI * 2, // Random phase for cyclic behaviors
        dramaticLeader: false,
        dramaticBurstUntil: undefined,
      };
    });
    console.log(`🎭 [Behaviors Summary] Total racers: ${newRacers.length}, Unique behaviors assigned`);
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
        
        // Identify early leaders at ~15% race progress
        if (!earlyLeadersIdentifiedRef.current && elapsed > totalDuration * 0.15) {
          const sorted = [...prev].sort((a, b) => b.position - a.position);
          const top3Ids = new Set(sorted.slice(0, 3).map(r => r.id));
          earlyLeadersIdentifiedRef.current = true;
          
          console.log('🥇 [Early Leaders Identified at 15% progress]');
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
          
          // Log behavior multiplier for first racer periodically for demonstration
          if (racer.id === 0 && frameCount % 120 === 0) {
            console.log(`📊 [${racer.name}] Progress: ${(progress * 100).toFixed(1)}%, Behavior: ${racer.behavior}, Multiplier: ${behaviorMultiplier.toFixed(2)}x`);
          }
          
          // Randomness: small bursts and slowdowns for variety
          const rand = Math.random();
          let randomMultiplier: number;
          if (rand > 0.95) {
            randomMultiplier = 1.2 + Math.random() * 0.2; // small burst
          } else if (rand < 0.05) {
            randomMultiplier = 0.8 + Math.random() * 0.1; // small slow
          } else {
            randomMultiplier = 0.95 + Math.random() * 0.1; // normal
          }
          
          // Sprint boost (slight boost in final phase)
          let sprintMultiplier = 1.0;
          if (isInSprintPhase) {
            sprintMultiplier = 1.15;
          }
          
          // Early leader penalty: reduce speed after 25% to prevent early leaders from winning
          let earlyLeaderPenalty = 1.0;
          if (racer.earlyLeader && progress > 0.25) {
            // Progressive penalty that increases as race progresses
            // At 25% progress: 0.85x speed, at 100%: 0.55x speed
            earlyLeaderPenalty = 0.85 - (progress - 0.25) * 0.4;
            
            // Log early leader penalty application
            if (frameCount % 120 === 0 && progress > 0.3) {
              console.log(`⚠️ [Early Leader Penalty] ${racer.name} - Progress: ${(progress * 100).toFixed(1)}%, Penalty: ${earlyLeaderPenalty.toFixed(2)}x`);
            }
          }
          
          // Soft timing enforcement: Adjust speeds to finish within countdown window
          let timingAdjustment = 1.0;
          
          // Calculate time remaining and distance remaining
          const timeRemaining = Math.max(0, totalDuration - elapsed);
          const distanceRemaining = 100 - racer.position;
          
          // Check if this racer is in leading pack (not early leader)
          const leadingNonEarlyLeaders = prev.filter(r => !r.earlyLeader && !r.finished);
          const topPosition = leadingNonEarlyLeaders.length > 0 ? Math.max(...leadingNonEarlyLeaders.map(r => r.position)) : 0;
          const isInLeadingPack = !racer.earlyLeader && racer.position >= topPosition - 10;
          
          // Set target finish time based on racer category
          let targetTime: number;
          if (racer.earlyLeader) {
            // Early leaders have penalties, so give them the same target as leaders
            targetTime = timeRemaining + 200;
          } else if (isInLeadingPack) {
            // Leading pack aims for countdown 0
            targetTime = timeRemaining + 200;
          } else {
            // Everyone else aims for countdown +3s
            targetTime = timeRemaining + 3000;
          }
          
          if (progress > 0.15 && distanceRemaining > 0 && targetTime > 100) {
            // Calculate the speed multiplier needed to finish at the target time
            // This makes timing the DOMINANT factor, not a subtle adjustment
            const targetFrames = targetTime / deltaTime;
            const idealSpeedPerFrame = distanceRemaining / targetFrames;
            
            // Current speed from behavior (before timing adjustment)
            const behaviorSpeed = baseFrameSpeed * racer.baseSpeed * behaviorMultiplier * randomMultiplier * sprintMultiplier * earlyLeaderPenalty * 2.4;
            
            if (behaviorSpeed > 0) {
              // Calculate how much we need to adjust speed to hit our target time
              timingAdjustment = idealSpeedPerFrame / behaviorSpeed;
              
              // Allow very large adjustments - timing must dominate
              timingAdjustment = Math.max(0.1, Math.min(10.0, timingAdjustment));
              
              if (frameCount % 120 === 0 && racer.position > 40) {
                const label = isInLeadingPack ? 'Leader' : 'Other';
                console.log(`⏱️ [Timing ${label}] ${racer.name} - Dist: ${distanceRemaining.toFixed(0)}%, Time: ${(timeRemaining/1000).toFixed(1)}s, Adj: ${timingAdjustment.toFixed(2)}x`);
              }
            }
          }
          
          // Dramatic leader boost: 4x speed when burst is active
          let dramaticBoost = 1.0;
          if (racer.dramaticBurstUntil && now < racer.dramaticBurstUntil) {
            dramaticBoost = dramaticLeaderBoost;
            const timeLeft = (racer.dramaticBurstUntil - now) / 1000;
            if (frameCount % 60 === 0) {
              console.log(`🎭💨 [Dramatic Boost Active] ${racer.name} - Position: ${racer.position.toFixed(1)}%, Boost: ${dramaticBoost}x, Time left: ${timeLeft.toFixed(1)}s`);
            }
          }
          
          // Combine all multipliers: timing adjustment is now the DOMINANT factor
          const currentSpeed = baseFrameSpeed * racer.baseSpeed * behaviorMultiplier * randomMultiplier * sprintMultiplier * earlyLeaderPenalty * timingAdjustment * dramaticBoost * 2.4;
          
          const newPosition = racer.position + currentSpeed;
          
          if (frameCount === 1 && racer.id === 0) {
            console.log('🏃 [animate] Frame 1 - Racer 0 calc: pos', racer.position, '+ speed', currentSpeed, '=', newPosition);
          }
          
          if (newPosition >= 100) {
            localFinishOrder += 1;
            const finishTimeMs = elapsed;
            const countdownRemaining = (totalDuration - elapsed) / 1000;
            console.log(`🏁 [Finish #${localFinishOrder}] ${racer.name} - Time: ${(finishTimeMs/1000).toFixed(2)}s, Countdown: ${countdownRemaining.toFixed(2)}s remaining`);
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
          
          console.log('\n🏁 [Race Finished] Final Results:');
          sorted.slice(0, Math.min(5, sorted.length)).forEach((racer, idx) => {
            const earlyLeaderTag = racer.earlyLeader ? ' ⚠️ (was early leader)' : '';
            const finishTime = (racer.finishTime || 0) / 1000;
            console.log(`  ${idx + 1}. ${racer.name} (${racer.behavior}) - ${finishTime.toFixed(2)}s${earlyLeaderTag}`);
          });
          
          const winnerWasEarlyLeader = sorted[0].earlyLeader;
          if (winnerWasEarlyLeader) {
            console.log('❌ [FAILED] Winner WAS an early leader!');
          } else {
            console.log('✅ [SUCCESS] Winner was NOT an early leader!');
          }
          
          // Timing verification
          const countdownTime = totalDuration / 1000;
          const winnerTime = (sorted[0].finishTime || 0) / 1000;
          const loserTime = (sorted[sorted.length - 1].finishTime || 0) / 1000;
          const timeDiff = loserTime - winnerTime;
          const winnerVsCountdown = winnerTime - countdownTime;
          
          console.log('\n⏱️ [Timing Verification]');
          console.log(`  Countdown: ${countdownTime.toFixed(1)}s`);
          console.log(`  Winner finished at: ${winnerTime.toFixed(2)}s (${winnerVsCountdown >= 0 ? '+' : ''}${winnerVsCountdown.toFixed(2)}s vs countdown)`);
          console.log(`  Last place at: ${loserTime.toFixed(2)}s`);
          console.log(`  Spread: ${timeDiff.toFixed(2)}s`);
          
          if (Math.abs(winnerVsCountdown) <= 0.5) {
            console.log('  ✅ Winner finished near countdown 0 (±0.5s)');
          } else {
            console.log(`  ⚠️ Winner finished ${Math.abs(winnerVsCountdown).toFixed(2)}s ${winnerVsCountdown > 0 ? 'after' : 'before'} countdown`);
          }
          
          if (timeDiff <= 3.0) {
            console.log(`  ✅ All racers finished within 3-second rule (${timeDiff.toFixed(2)}s)`);
          } else {
            console.log(`  ❌ Spread exceeded 3 seconds (${timeDiff.toFixed(2)}s)`);
          }
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
    
    // Reset racers (keep their behaviors but reset positions)
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
        // Keep behavior but randomize cycle for variety
        behaviorCycle: Math.random() * Math.PI * 2,
        earlyLeader: false, // Reset early leader status
      }));
    });
    setWinner(null);
    setLoser(null);
    setRaceFinished(false);
    setIsSprintPhase(false);
    finishOrderRef.current = 0;
    earlyLeadersIdentifiedRef.current = false; // Reset early leader tracking
    
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
    
    // Set up dramatic leader system - more aggressive for longer races (>60s)
    const isLongRace = countdownTime > 60;
    const selectionInterval = isLongRace ? 3000 : 5000; // 3s for long races, 5s for short
    const burstDuration = isLongRace ? 5000 : 4000; // 5s for long races, 4s for short
    const maxPickCount = isLongRace ? 3 : 2; // Pick 2-3 for long races, 1-2 for short
    
    dramaticLeadersUsedRef.current = new Set();
    if (dramaticLeaderIntervalRef.current) {
      clearInterval(dramaticLeaderIntervalRef.current);
    }
    
    dramaticLeaderIntervalRef.current = setInterval(() => {
      const now = Date.now();
      setRacers(prev => {
        // Filter candidates: not finished, not already used, not current dramatic leaders
        const candidates = prev.filter(r => 
          !r.finished && 
          !dramaticLeadersUsedRef.current.has(r.id) &&
          (!r.dramaticBurstUntil || now >= r.dramaticBurstUntil)
        );
        
        if (candidates.length === 0) return prev;
        
        // Pick racers based on race length
        const pickCount = Math.min(
          Math.floor(Math.random() * maxPickCount) + 1,
          candidates.length
        );
        const shuffled = [...candidates].sort(() => Math.random() - 0.5);
        const chosen = shuffled.slice(0, pickCount);
        
        // Mark them and add to used set
        chosen.forEach(r => {
          dramaticLeadersUsedRef.current.add(r.id);
          console.log(`🎭 [Dramatic Leader] ${r.name} selected for burst!`);
        });
        
        // Apply burst with duration based on race length
        return prev.map(racer => {
          const isChosen = chosen.find(c => c.id === racer.id);
          if (isChosen) {
            return {
              ...racer,
              dramaticLeader: true,
              dramaticBurstUntil: now + burstDuration,
            };
          }
          return racer;
        });
      });
    }, selectionInterval);
  }, [startCountdown]);

  const resetRace = useCallback(() => {
    isRacingRef.current = false;
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }
    if (dramaticLeaderIntervalRef.current) {
      clearInterval(dramaticLeaderIntervalRef.current);
    }
    dramaticLeadersUsedRef.current.clear();
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
      earlyLeader: false,
      dramaticLeader: false,
      dramaticBurstUntil: undefined,
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
