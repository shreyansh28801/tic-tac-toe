import { useState, useEffect } from 'react';

function Leaderboard({ onBack, currentPlayerName }) {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('points');
  const [error, setError] = useState(null);

  const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';

  useEffect(() => {
    fetchLeaderboard();
  }, [sortBy]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${SERVER_URL}/api/leaderboard?limit=50&sortBy=${sortBy}`);
      if (!response.ok) throw new Error('Failed to fetch leaderboard');
      
      const data = await response.json();
      setLeaderboard(data);
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
      setError('Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  const getMedalEmoji = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const getWinRateColor = (winRate) => {
    if (winRate >= 70) return 'text-green-400';
    if (winRate >= 50) return 'text-yellow-400';
    if (winRate >= 30) return 'text-orange-400';
    return 'text-red-400';
  };

  const sortOptions = [
    { value: 'points', label: 'Points', emoji: '🏆' },
    { value: 'wins', label: 'Wins', emoji: '✅' },
    { value: 'winRate', label: 'Win Rate', emoji: '📊' },
    { value: 'gamesPlayed', label: 'Games', emoji: '🎮' }
  ];

  return (
    <div className="card max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-4xl font-bold text-white mb-2 flex items-center justify-center gap-2">
          <span>🏆</span>
          <span>Leaderboard</span>
        </h1>
        <p className="text-white/70">Top Players & Rankings</p>
      </div>

      {/* Sort Options */}
      <div className="flex flex-wrap gap-2 mb-6 justify-center">
        {sortOptions.map(option => (
          <button
            key={option.value}
            onClick={() => setSortBy(option.value)}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              sortBy === option.value
                ? 'bg-purple-600 text-white shadow-lg scale-105'
                : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >
            {option.emoji} {option.label}
          </button>
        ))}
      </div>

      {/* Stats Summary */}
      {!loading && !error && leaderboard.length > 0 && (
        <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">👥</span>
              <div>
                <div className="text-white font-bold text-xl">{leaderboard.length}</div>
                <div className="text-white/70 text-sm">Total Players</div>
              </div>
            </div>
            <div className="text-white/70 text-sm">
              Each player shown once with total accumulated stats
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard Content */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent mx-auto"></div>
          <p className="text-white/70 mt-4">Loading leaderboard...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-400 text-lg">{error}</p>
          <button onClick={fetchLeaderboard} className="btn-primary mt-4">
            Retry
          </button>
        </div>
      ) : leaderboard.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-white/70 text-lg">No players yet. Be the first to play!</p>
        </div>
      ) : (
        <>
          {/* Mobile Card View */}
          <div className="block md:hidden space-y-3">
            {leaderboard.map((player, index) => {
              const isCurrentPlayer = player.playerName === currentPlayerName;
              return (
                <div
                  key={player.playerName + '-' + index}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    isCurrentPlayer 
                      ? 'bg-purple-500/20 border-purple-500' 
                      : 'bg-white/5 border-white/10'
                  }`}
                >
                  {/* Rank and Player Name */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className={`font-bold ${
                        player.rank <= 3 ? 'text-3xl' : 'text-2xl text-white'
                      }`}>
                        {getMedalEmoji(player.rank)}
                      </span>
                      <div>
                        <div className="text-white font-bold text-lg">
                          {player.playerName}
                        </div>
                        {isCurrentPlayer && (
                          <span className="text-xs bg-purple-600 text-white px-2 py-1 rounded inline-block mt-1">
                            You
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-white">
                        {player.points}
                      </div>
                      <div className="text-xs text-white/60">Points</div>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    {/* Games Played */}
                    <div className="bg-white/5 rounded-lg p-2 text-center">
                      <div className="text-white font-bold text-xl">
                        {player.gamesPlayed}
                      </div>
                      <div className="text-xs text-white/60">Games</div>
                    </div>

                    {/* Win Rate */}
                    <div className="bg-white/5 rounded-lg p-2 text-center">
                      <div className={`font-bold text-xl ${getWinRateColor(player.winRate)}`}>
                        {player.winRate}%
                      </div>
                      <div className="text-xs text-white/60">Win Rate</div>
                    </div>
                  </div>

                  {/* W/L/D Stats */}
                  <div className="flex justify-around mt-3 pt-3 border-t border-white/10">
                    <div className="text-center">
                      <div className="text-green-400 font-bold text-xl">
                        {player.wins}
                      </div>
                      <div className="text-xs text-green-400/70">Wins</div>
                    </div>
                    <div className="text-center">
                      <div className="text-red-400 font-bold text-xl">
                        {player.losses}
                      </div>
                      <div className="text-xs text-red-400/70">Defeats</div>
                    </div>
                    <div className="text-center">
                      <div className="text-yellow-400 font-bold text-xl">
                        {player.draws}
                      </div>
                      <div className="text-xs text-yellow-400/70">Draws</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-white/30 bg-white/5">
                  <th className="text-left text-white font-bold py-4 px-2">Rank</th>
                  <th className="text-left text-white font-bold py-4 px-4">Player</th>
                  <th className="text-center text-white font-bold py-4 px-2">
                    <div>Total</div>
                    <div className="text-xs font-normal text-white/60">Games</div>
                  </th>
                  <th className="text-center text-white font-bold py-4 px-2">
                    <div>Win/Defeat/Draw</div>
                    <div className="text-xs font-normal text-white/60">(Total)</div>
                  </th>
                  <th className="text-center text-white font-bold py-4 px-2">
                    <div>Win %</div>
                  </th>
                  <th className="text-center text-white font-bold py-4 px-2">
                    <div>Total</div>
                    <div className="text-xs font-normal text-white/60">Points</div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((player, index) => {
                  const isCurrentPlayer = player.playerName === currentPlayerName;
                  return (
                    <tr
                      key={player.playerName + '-' + index}
                      className={`border-b border-white/10 hover:bg-white/5 transition-colors ${
                        isCurrentPlayer ? 'bg-purple-500/20 border-purple-500/50' : ''
                      }`}
                    >
                      <td className="py-4 px-2">
                        <span className={`font-bold ${
                          player.rank <= 3 ? 'text-2xl' : 'text-white'
                        }`}>
                          {getMedalEmoji(player.rank)}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <span className="text-white font-semibold truncate max-w-[150px]">
                            {player.playerName}
                          </span>
                          {isCurrentPlayer && (
                            <span className="text-xs bg-purple-600 text-white px-2 py-1 rounded">
                              You
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="text-center text-white/80 py-4 px-2">
                        <span className="text-xl font-bold text-white">{player.gamesPlayed}</span>
                      </td>
                      <td className="text-center py-4 px-2">
                        <div className="flex gap-2 text-sm justify-center items-center">
                          <div className="flex items-center gap-1">
                            <span className="text-green-400 font-bold text-lg">{player.wins}</span>
                            <span className="text-xs text-green-400/60">W</span>
                          </div>
                          <span className="text-white/40">/</span>
                          <div className="flex items-center gap-1">
                            <span className="text-red-400 font-bold text-lg">{player.losses}</span>
                            <span className="text-xs text-red-400/60">L</span>
                          </div>
                          <span className="text-white/40">/</span>
                          <div className="flex items-center gap-1">
                            <span className="text-yellow-400 font-bold text-lg">{player.draws}</span>
                            <span className="text-xs text-yellow-400/60">D</span>
                          </div>
                        </div>
                      </td>
                      <td className={`text-center py-4 px-2 font-bold text-xl ${getWinRateColor(player.winRate)}`}>
                        {player.winRate}%
                      </td>
                      <td className="text-center text-white font-bold py-4 px-2 text-2xl">
                        {player.points}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Legend */}
      {!loading && !error && leaderboard.length > 0 && (
        <div className="mt-6 p-4 bg-white/5 rounded-lg">
          <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
            <span>ℹ️</span>
            <span>How It Works</span>
          </h3>
          <div className="space-y-2 text-sm text-white/70">
            <div className="flex items-center gap-2">
              <span className="text-purple-400">•</span>
              <span>Each player appears <span className="text-white font-semibold">once</span> with their <span className="text-white font-semibold">total accumulated stats</span></span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-purple-400">•</span>
              <span><span className="text-green-400 font-semibold">Win</span> = +3 points, 
              <span className="text-yellow-400 font-semibold"> Draw</span> = +1 point, 
              <span className="text-red-400 font-semibold"> Defeat</span> = 0 points</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-purple-400">•</span>
              <span>Rankings update in <span className="text-white font-semibold">real-time</span> after each game</span>
            </div>
          </div>
        </div>
      )}

      {/* Back Button */}
      <div className="mt-6">
        <button onClick={onBack} className="btn-secondary w-full">
          🏠 Back to Home
        </button>
      </div>
    </div>
  );
}

export default Leaderboard;

