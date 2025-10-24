function PlayerStats({ stats, onClose }) {
  if (!stats) return null;

  const getWinRateColor = (winRate) => {
    if (winRate >= 70) return 'text-green-400';
    if (winRate >= 50) return 'text-yellow-400';
    if (winRate >= 30) return 'text-orange-400';
    return 'text-red-400';
  };

  const calculateLevel = (points) => {
    return Math.floor(points / 10) + 1;
  };

  const level = calculateLevel(stats.points);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="card max-w-md w-full">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-white mb-2">
            📊 Your Stats
          </h2>
          <p className="text-white/70">{stats.playerName}</p>
        </div>

        {/* Level Badge */}
        <div className="text-center mb-6">
          <div className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 rounded-full px-6 py-3">
            <div className="text-white text-lg font-bold">
              Level {level}
            </div>
            <div className="text-white/80 text-sm">
              {stats.points} points
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white/5 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-white">{stats.gamesPlayed}</div>
            <div className="text-white/60 text-sm mt-1">Games Played</div>
          </div>
          
          <div className="bg-white/5 rounded-lg p-4 text-center">
            <div className={`text-3xl font-bold ${getWinRateColor(stats.winRate)}`}>
              {stats.winRate}%
            </div>
            <div className="text-white/60 text-sm mt-1">Win Rate</div>
          </div>

          <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-green-400">{stats.wins}</div>
            <div className="text-white/60 text-sm mt-1">Wins</div>
          </div>

          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-red-400">{stats.losses}</div>
            <div className="text-white/60 text-sm mt-1">Losses</div>
          </div>

          <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-yellow-400">{stats.draws}</div>
            <div className="text-white/60 text-sm mt-1">Draws</div>
          </div>

          <div className="bg-purple-500/20 border border-purple-500/50 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-purple-400">{stats.rank || '?'}</div>
            <div className="text-white/60 text-sm mt-1">Rank</div>
          </div>
        </div>

        {/* Achievement Badges */}
        <div className="mb-6">
          <h3 className="text-white font-semibold mb-3">Achievements:</h3>
          <div className="flex flex-wrap gap-2">
            {stats.gamesPlayed >= 1 && (
              <span className="bg-white/10 px-3 py-1 rounded-full text-sm text-white">
                🎮 First Game
              </span>
            )}
            {stats.wins >= 1 && (
              <span className="bg-white/10 px-3 py-1 rounded-full text-sm text-white">
                🏆 First Win
              </span>
            )}
            {stats.wins >= 10 && (
              <span className="bg-white/10 px-3 py-1 rounded-full text-sm text-white">
                🌟 10 Wins
              </span>
            )}
            {stats.winRate >= 70 && stats.gamesPlayed >= 5 && (
              <span className="bg-white/10 px-3 py-1 rounded-full text-sm text-white">
                🔥 Hot Streak
              </span>
            )}
            {level >= 5 && (
              <span className="bg-white/10 px-3 py-1 rounded-full text-sm text-white">
                ⭐ Level 5+
              </span>
            )}
          </div>
        </div>

        {/* Close Button */}
        <button onClick={onClose} className="btn-primary w-full">
          Close
        </button>
      </div>
    </div>
  );
}

export default PlayerStats;

