import React, { useState, useEffect } from 'react';
import NameInput from '@/components/NameInput';
import RaceTrack from '@/components/RaceTrack';
import RaceControls from '@/components/RaceControls';
import RaceResults from '@/components/RaceResults';
import Leaderboard from '@/components/Leaderboard';
import ThemeSelector from '@/components/ThemeSelector';
import { RaceTheme } from '@/components/RaceCharacter';
import { useRace } from '@/hooks/useRace';

const THEME_TITLES: Record<RaceTheme, string> = {
  duck: '🦆 Duck Racing! 🏁',
  horse: '🐴 Horse Racing! 🏁',
  car: '🏎️ Car Racing! 🏁',
  marble: '🔮 Marble Racing! 🏁',
};

const Index = () => {
  const [names, setNames] = useState('');
  const [countdownTime, setCountdownTime] = useState(3);
  const [theme, setTheme] = useState<RaceTheme>('duck');
  
  const {
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
  } = useRace();

  // Initialize racers when names change
  useEffect(() => {
    const nameList = names.split('\n');
    initializeRacers(nameList);
  }, [names, initializeRacers]);

  const handleStart = () => {
    startRace(countdownTime);
  };

  const handleReset = () => {
    resetRace();
  };

  const canStart = racers.length >= 2;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <header className="text-center space-y-2">
          <h1 className="text-4xl md:text-6xl font-bold text-primary drop-shadow-lg">
            {THEME_TITLES[theme]}
          </h1>
          <p className="text-lg text-muted-foreground">
            Add names, pick a theme, and let the race begin!
          </p>
        </header>

        {/* Main content */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left side - Controls */}
          <div className="space-y-4">
            <div className="bg-card rounded-2xl p-4 shadow-xl">
              <NameInput
                names={names}
                onNamesChange={setNames}
                disabled={isRacing || isCountingDown}
              />
            </div>
            
            <div className="bg-card rounded-2xl p-4 shadow-xl">
              <ThemeSelector
                selectedTheme={theme}
                onThemeChange={setTheme}
                disabled={isRacing || isCountingDown}
              />
            </div>
            
            <div className="bg-card rounded-2xl p-4 shadow-xl">
              <RaceControls
                countdownTime={countdownTime}
                onCountdownChange={setCountdownTime}
                onStart={handleStart}
                onReset={handleReset}
                isRacing={isRacing}
                isCountingDown={isCountingDown}
                currentCountdown={currentCountdown}
                canStart={canStart}
              />
              
              {!canStart && racers.length > 0 && (
                <p className="text-destructive text-sm mt-2">
                  ⚠️ Need at least 2 racers to start!
                </p>
              )}
              
              {racers.length === 0 && (
                <p className="text-muted-foreground text-sm mt-2">
                  Enter some names above to get started!
                </p>
              )}
            </div>
          </div>

          {/* Center - Race Track */}
          <div className="lg:col-span-2 space-y-4">
            {racers.length > 0 ? (
              <RaceTrack
                racers={racers}
                isRacing={isRacing}
                isCountingDown={isCountingDown}
                winner={winner || undefined}
                loser={loser || undefined}
                theme={theme}
                raceFinished={raceFinished}
              />
            ) : (
              <div className="bg-gradient-to-b from-secondary to-pond-dark rounded-2xl h-64 flex items-center justify-center">
                <p className="text-white text-xl font-medium">
                  🏁 Add some racers to see them here!
                </p>
              </div>
            )}
            
            {/* Racer count */}
            {racers.length > 0 && (
              <p className="text-center text-muted-foreground text-sm">
                {racers.length} racer{racers.length !== 1 ? 's' : ''} competing
                {racers.length > 20 && ' • Showing top 20 lanes'}
              </p>
            )}
            
            {/* Winner/Loser announcement */}
            <RaceResults
              winner={winner}
              loser={loser}
              isVisible={raceFinished}
            />
            
            {/* Full Leaderboard */}
            <Leaderboard
              racers={racers}
              isVisible={raceFinished}
            />
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center text-muted-foreground text-sm">
          <p>Made with 💛 for racing enthusiasts</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
