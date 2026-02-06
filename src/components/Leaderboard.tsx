import React, { useState } from 'react';
import { Trophy, Medal, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Racer {
  id: number;
  name: string;
  color: string;
  position: number;
  finished: boolean;
  finishTime?: number;
  finishOrder?: number;
}

interface LeaderboardProps {
  racers: Racer[];
  isVisible: boolean;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ racers, isVisible }) => {
  const [showAll, setShowAll] = useState(false);
  
  if (!isVisible || racers.length === 0) return null;
  
  const sortedRacers = [...racers]
    .filter(r => r.finishOrder !== undefined)
    .sort((a, b) => (a.finishOrder || 0) - (b.finishOrder || 0));
  
  const displayRacers = showAll ? sortedRacers : sortedRacers.slice(0, 10);
  
  const getMedal = (position: number) => {
    switch (position) {
      case 1:
        return <span className="text-2xl">🥇</span>;
      case 2:
        return <span className="text-2xl">🥈</span>;
      case 3:
        return <span className="text-2xl">🥉</span>;
      default:
        return <span className="text-sm text-muted-foreground font-bold w-8 text-center">#{position}</span>;
    }
  };
  
  return (
    <div className="animate-fade-in bg-card rounded-2xl p-6 shadow-xl">
      <h2 className="text-2xl font-bold text-center text-foreground mb-4 flex items-center justify-center gap-2">
        <Trophy className="w-6 h-6 text-primary" />
        Final Leaderboard
        <Trophy className="w-6 h-6 text-primary" />
      </h2>
      
      <div className="space-y-2 max-h-[400px] overflow-y-auto">
        {displayRacers.map((racer, index) => {
          const position = racer.finishOrder || index + 1;
          const isTop3 = position <= 3;
          const isLast = position === sortedRacers.length;
          
          return (
            <div
              key={racer.id}
              className={`
                flex items-center gap-3 p-3 rounded-xl transition-all
                ${isTop3 ? 'bg-primary/10 border-2 border-primary/30' : 
                  isLast ? 'bg-muted border-2 border-muted-foreground/20' : 
                  'bg-muted/50'}
              `}
            >
              {getMedal(position)}
              
              <div
                className="w-6 h-6 rounded-full border-2 border-white/50 shadow-md flex-shrink-0"
                style={{ backgroundColor: racer.color }}
              />
              
              <span className={`font-bold flex-grow truncate ${isTop3 ? 'text-foreground' : 'text-muted-foreground'}`}>
                {racer.name}
              </span>
              
              {racer.finishTime && (
                <span className="text-xs text-muted-foreground">
                  {(racer.finishTime / 1000).toFixed(2)}s
                </span>
              )}
            </div>
          );
        })}
      </div>
      
      {sortedRacers.length > 10 && (
        <Button
          variant="ghost"
          onClick={() => setShowAll(!showAll)}
          className="w-full mt-4"
        >
          {showAll ? (
            <>
              <ChevronUp className="w-4 h-4 mr-2" />
              Show Less
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4 mr-2" />
              Show All {sortedRacers.length} Racers
            </>
          )}
        </Button>
      )}
    </div>
  );
};

export default Leaderboard;
