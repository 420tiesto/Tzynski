import React from 'react';

interface ScoreboardProps {
  score: number;
}

const Scoreboard: React.FC<ScoreboardProps> = ({ score }) => {
  return (
    <div className="fixed bottom-24 left-8 z-50">
      <div className="p-4 bg-gradient-to-r from-black/80 to-black/40 rounded-xl backdrop-blur-xl border border-cyan-500/30">
        <div className="flex flex-col items-start gap-1">
          <div className="text-xs text-cyan-400/70 font-mono">SCORE</div>
          <div className="text-2xl font-bold text-cyan-300 font-mono tracking-wider">
            {score.toString().padStart(6, '0')}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Scoreboard;