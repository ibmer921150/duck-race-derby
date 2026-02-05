import React from 'react';
import Duck from './Duck';

interface Racer {
  id: number;
  name: string;
  color: string;
  position: number;
  finished: boolean;
  finishTime?: number;
}

interface RaceTrackProps {
  racers: Racer[];
  isRacing: boolean;
  winner?: Racer;
  loser?: Racer;
}

const RaceTrack: React.FC<RaceTrackProps> = ({ racers, isRacing, winner, loser }) => {
  const displayRacers = racers.slice(0, 10); // Show max 10 lanes at once
  
  return (
    <div className="pond-track water-waves p-4">
      {/* Start line */}
      <div className="absolute left-8 top-0 bottom-0 w-1 bg-white/50" />
      
      {/* Finish line */}
      <div className="finish-line" />
      
      {/* Lanes */}
      <div className="relative">
        {displayRacers.map((racer, index) => (
          <div key={racer.id} className="duck-lane">
            {/* Lane number */}
            <div className="absolute left-2 text-white/60 font-bold text-sm">
              {index + 1}
            </div>
            
            {/* Duck */}
            <Duck
              color={racer.color}
              name={racer.name}
              position={Math.min(racer.position, 85)}
              isRacing={isRacing && !racer.finished}
              isWinner={winner?.id === racer.id}
              isLoser={loser?.id === racer.id}
            />
          </div>
        ))}
      </div>
      
      {/* Water decorations */}
      <div className="absolute bottom-2 left-4 text-2xl opacity-50">🌊</div>
      <div className="absolute top-2 right-16 text-xl opacity-40">💨</div>
    </div>
  );
};

export default RaceTrack;
