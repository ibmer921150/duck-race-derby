import React, { useState, useEffect } from 'react';
import NameInput from '@/components/NameInput';
import RaceTrack from '@/components/RaceTrack';
import RaceControls from '@/components/RaceControls';
import RaceResults from '@/components/RaceResults';
import { useRace } from '@/hooks/useRace';

const Index = () => {
  const [names, setNames] = useState('');
  const [countdownTime, setCountdownTime] = useState(3);
  
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
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <header className="text-center space-y-2">
          <h1 className="text-5xl md:text-7xl font-bold text-primary drop-shadow-lg">
            🦆 Duck Racing! 🏁
          </h1>
          <p className="text-xl text-muted-foreground">
            Add names, set countdown, and let the ducks race!
          </p>
        </header>

        {/* Main content */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left side - Controls */}
          <div className="space-y-6">
            <div className="bg-card rounded-2xl p-6 shadow-xl">
              <NameInput
                names={names}
                onNamesChange={setNames}
                disabled={isRacing || isCountingDown}
              />
            </div>
            
            <div className="bg-card rounded-2xl p-6 shadow-xl">
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

          {/* Right side - Race Track */}
          <div className="space-y-6">
            {racers.length > 0 ? (
              <RaceTrack
                racers={racers}
                isRacing={isRacing}
                isCountingDown={isCountingDown}
                winner={winner || undefined}
                loser={loser || undefined}
              />
            ) : (
              <div className="pond-track h-64 flex items-center justify-center">
                <p className="text-secondary-foreground text-xl font-medium">
                  🦆 Add some racers to see them here!
                </p>
              </div>
            )}
            
            {/* Show count of racers */}
            {racers.length > 0 && (
              <p className="text-center text-muted-foreground">
                {racers.length} racer{racers.length !== 1 ? 's' : ''} on track
              </p>
            )}
          </div>
        </div>

        {/* Results */}
        <RaceResults
          winner={winner}
          loser={loser}
          isVisible={raceFinished}
        />

        {/* Footer */}
        <footer className="text-center text-muted-foreground text-sm">
          <p>Made with 💛 for duck racing enthusiasts</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
