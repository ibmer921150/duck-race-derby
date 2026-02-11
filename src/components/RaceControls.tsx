import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Play, RotateCcw, Timer } from 'lucide-react';

interface RaceControlsProps {
  countdownTime: number;
  onCountdownChange: (time: number) => void;
  onStart: () => void;
  onReset: () => void;
  isRacing: boolean;
  isCountingDown: boolean;
  currentCountdown: number;
  canStart: boolean;
}

const RaceControls: React.FC<RaceControlsProps> = ({
  countdownTime,
  onCountdownChange,
  onStart,
  onReset,
  isRacing,
  isCountingDown,
  currentCountdown,
  canStart,
}) => {
  const [inputValue, setInputValue] = React.useState(countdownTime.toString());

  React.useEffect(() => {
    setInputValue(countdownTime.toString());
  }, [countdownTime]);

  return (
    <div className="flex flex-wrap items-end gap-4">
      {/* Countdown setting */}
      <div className="space-y-2">
        <Label htmlFor="countdown" className="flex items-center gap-2 text-foreground font-bold">
          <Timer className="w-4 h-4" />
          Countdown (seconds)
        </Label>
        <Input
          id="countdown"
          type="number"
          min={0}
          max={3600}
          value={inputValue}
          onChange={(e) => {
            const value = e.target.value;
            setInputValue(value);
            if (value !== '') {
              const numValue = parseInt(value);
              if (!isNaN(numValue)) {
                onCountdownChange(Math.max(0, Math.min(3600, numValue)));
              }
            }
          }}
          onBlur={() => {
            if (inputValue === '' || parseInt(inputValue) < 1) {
              onCountdownChange(3);
              setInputValue('3');
            }
          }}
          disabled={isRacing || isCountingDown}
          className="w-24 bg-card text-card-foreground border-2 border-secondary/30"
        />
      </div>
      
      {/* Countdown display */}
      {isCountingDown && (
        <div className="flex items-center justify-center">
          <div className="animate-countdown text-6xl font-bold text-primary drop-shadow-lg">
            {currentCountdown}
          </div>
        </div>
      )}
      
      {/* Start button */}
      <Button
        onClick={onStart}
        disabled={!canStart || isRacing || isCountingDown}
        className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-lg px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all"
      >
        <Play className="w-5 h-5 mr-2" />
        Start Race!
      </Button>
      
      {/* Reset button */}
      <Button
        onClick={onReset}
        variant="outline"
        disabled={isCountingDown}
        className="border-2 border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground font-bold px-6 py-6 rounded-xl"
      >
        <RotateCcw className="w-5 h-5 mr-2" />
        Reset
      </Button>
    </div>
  );
};

export default RaceControls;
