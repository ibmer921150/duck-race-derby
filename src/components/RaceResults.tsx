import React from 'react';
import { Trophy, Frown } from 'lucide-react';

interface Racer {
  id: number;
  name: string;
  color: string;
  position: number;
  finished: boolean;
  finishTime?: number;
}

interface RaceResultsProps {
  winner: Racer | null;
  loser: Racer | null;
  isVisible: boolean;
}

const RaceResults: React.FC<RaceResultsProps> = ({ winner, loser, isVisible }) => {
  if (!isVisible || !winner || !loser) return null;
  
  return (
    <div className="animate-fade-in space-y-4">
      <h2 className="text-3xl font-bold text-center text-foreground">🏁 Race Results!</h2>
      
      <div className="grid md:grid-cols-2 gap-4">
        {/* Winner Card */}
        <div className="winner-card rounded-2xl p-6 text-center animate-celebrate">
          <div className="text-6xl mb-2">👑</div>
          <Trophy className="w-12 h-12 mx-auto mb-2 text-foreground" />
          <h3 className="text-xl font-bold mb-1">🥇 WINNER!</h3>
          <div 
            className="text-3xl font-bold mb-2 flex items-center justify-center gap-2"
          >
            <div 
              className="w-8 h-8 rounded-full border-2 border-foreground/20"
              style={{ backgroundColor: winner.color }}
            />
            {winner.name}
          </div>
          <p className="text-sm opacity-80">Fastest duck in the pond! 🦆💨</p>
        </div>
        
        {/* Loser Card */}
        <div className="bg-muted rounded-2xl p-6 text-center">
          <div className="text-6xl mb-2">🐢</div>
          <Frown className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
          <h3 className="text-xl font-bold mb-1 text-muted-foreground">Last Place</h3>
          <div 
            className="text-3xl font-bold mb-2 flex items-center justify-center gap-2 text-muted-foreground"
          >
            <div 
              className="w-8 h-8 rounded-full border-2 border-muted-foreground/20"
              style={{ backgroundColor: loser.color }}
            />
            {loser.name}
          </div>
          <p className="text-sm text-muted-foreground">Better luck next time! 🦆😅</p>
        </div>
      </div>
    </div>
  );
};

export default RaceResults;
