function GameOverModal({ gameData, playerSymbol, onPlayAgain, onBackToHome }) {
  if (!gameData) return null;

  const { winner, isDraw, game, pointsEarned, playerStats } = gameData;
  
  const isWinner = winner === playerSymbol;
  const myPoints = pointsEarned ? pointsEarned[playerSymbol] : 0;
  
  // Format duration
  const formatDuration = (ms) => {
    if (!ms) return '0s';
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${seconds}s`;
  };

  // Format W/L/D
  const formatRecord = (stats) => {
    if (!stats) return '0/0/0';
    return `${stats.wins}/${stats.losses}/${stats.draws}`;
  };

  // Get player stats
  const player1 = game.players.X;
  const player2 = game.players.O;
  const player1Stats = playerStats?.player1;
  const player2Stats = playerStats?.player2;

  const isPlayer1Current = player1?.id === (playerSymbol === 'X' ? player1?.id : player2?.id);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-8 max-w-md w-full shadow-2xl border border-white/20">
        
        {/* Winner Symbol */}
        <div className="text-center mb-6">
          {!isDraw ? (
            <>
              <div className="text-8xl font-bold text-white mb-4 animate-bounce-slow">
                {winner === 'X' ? '✕' : '◯'}
              </div>
              <h2 className={`text-3xl font-bold mb-2 ${isWinner ? 'text-green-400' : 'text-red-400'}`}>
                {isWinner ? 'WINNER!' : 'DEFEAT'}
              </h2>
              <p className="text-2xl text-white font-semibold">
                {isWinner ? `+${myPoints} pts` : '+0 pts'}
              </p>
            </>
          ) : (
            <>
              <div className="text-6xl font-bold text-white mb-4">
                ✕ ◯
              </div>
              <h2 className="text-3xl font-bold text-yellow-400 mb-2">
                DRAW!
              </h2>
              <p className="text-2xl text-white font-semibold">
                +{myPoints} pts
              </p>
            </>
          )}
        </div>

        {/* Mini Leaderboard */}
        {playerStats && (
          <div className="bg-white/5 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">🏆</span>
              <h3 className="text-white font-semibold text-lg">Leaderboard</h3>
            </div>

            {/* Table Header */}
            <div className="grid grid-cols-[2fr_1fr_0.7fr_1fr] gap-2 text-white/60 text-xs font-semibold mb-2 px-2">
              <div></div>
              <div className="text-center">W/L/D</div>
              <div className="text-center">⏱</div>
              <div className="text-right">Score</div>
            </div>

            {/* Player 1 Row */}
            <div className={`grid grid-cols-[2fr_1fr_0.7fr_1fr] gap-2 items-center py-2 px-2 rounded ${
              playerSymbol === 'X' ? 'bg-purple-500/20' : ''
            }`}>
              <div className="text-white font-semibold truncate">
                1. {player1?.name || 'Player 1'}
                {playerSymbol === 'X' && <span className="text-xs text-purple-400 ml-1">(you)</span>}
              </div>
              <div className="text-center text-sm">
                <span className="text-green-400 font-semibold">{player1Stats?.wins || 0}</span>
                <span className="text-white/40">/</span>
                <span className="text-red-400 font-semibold">{player1Stats?.losses || 0}</span>
                <span className="text-white/40">/</span>
                <span className="text-yellow-400 font-semibold">{player1Stats?.draws || 0}</span>
              </div>
              <div className="text-center text-white/70 text-xs">
                {formatDuration(game.duration)}
              </div>
              <div className="text-right text-white font-bold">
                {player1Stats?.points || 0}
              </div>
            </div>

            {/* Player 2 Row */}
            <div className={`grid grid-cols-[2fr_1fr_0.7fr_1fr] gap-2 items-center py-2 px-2 rounded ${
              playerSymbol === 'O' ? 'bg-purple-500/20' : ''
            }`}>
              <div className="text-white font-semibold truncate">
                2. {player2?.name || 'Player 2'}
                {playerSymbol === 'O' && <span className="text-xs text-purple-400 ml-1">(you)</span>}
              </div>
              <div className="text-center text-sm">
                <span className="text-green-400 font-semibold">{player2Stats?.wins || 0}</span>
                <span className="text-white/40">/</span>
                <span className="text-red-400 font-semibold">{player2Stats?.losses || 0}</span>
                <span className="text-white/40">/</span>
                <span className="text-yellow-400 font-semibold">{player2Stats?.draws || 0}</span>
              </div>
              <div className="text-center text-white/70 text-xs">
                {formatDuration(game.duration)}
              </div>
              <div className="text-right text-white font-bold">
                {player2Stats?.points || 0}
              </div>
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="space-y-3">
          <button
            onClick={onPlayAgain}
            className="w-full btn-primary text-lg py-3"
          >
            🎮 Play Again
          </button>
          <button
            onClick={onBackToHome}
            className="w-full btn-secondary"
          >
            🏠 Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}

export default GameOverModal;

