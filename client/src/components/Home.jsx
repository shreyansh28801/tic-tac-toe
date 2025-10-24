import { useState } from 'react';

function Home({ onCreateGame, onJoinGame, onFindGame, onViewLeaderboard, connected, stats }) {
  const [playerName, setPlayerName] = useState('');
  const [gameId, setGameId] = useState('');
  const [mode, setMode] = useState(null); // 'create', 'join', 'find'

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!playerName.trim()) {
      alert('Please enter your name');
      return;
    }

    switch (mode) {
      case 'create':
        onCreateGame(playerName);
        break;
      case 'join':
        if (!gameId.trim()) {
          alert('Please enter a game ID');
          return;
        }
        onJoinGame(gameId, playerName);
        break;
      case 'find':
        onFindGame(playerName);
        break;
      default:
        break;
    }
  };

  const renderForm = () => {
    if (!mode) return null;

    return (
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="block text-white text-sm font-semibold mb-2">
            Your Name
          </label>
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Enter your name"
            className="input-field"
            maxLength={20}
          />
        </div>

        {mode === 'join' && (
          <div>
            <label className="block text-white text-sm font-semibold mb-2">
              Game ID
            </label>
            <input
              type="text"
              value={gameId}
              onChange={(e) => setGameId(e.target.value)}
              placeholder="Enter game ID"
              className="input-field"
            />
          </div>
        )}

        <div className="flex gap-3">
          <button type="submit" className="btn-primary flex-1">
            {mode === 'create' && 'Create Game'}
            {mode === 'join' && 'Join Game'}
            {mode === 'find' && 'Find Game'}
          </button>
          <button
            type="button"
            onClick={() => {
              setMode(null);
              setGameId('');
              setPlayerName('');
            }}
            className="btn-secondary"
          >
            Cancel
          </button>
        </div>
      </form>
    );
  };

  return (
    <div className="card">
      <div className="text-center mb-8">
        <h1 className="text-5xl font-bold text-white mb-2 animate-pulse-slow">
          🎮 Tic-Tac-Toe
        </h1>
        <p className="text-white/70 text-lg">Multiplayer Edition</p>
        
        <div className="mt-4 flex items-center justify-center gap-2">
          <div className={`w-3 h-3 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
          <span className="text-white/80 text-sm">
            {connected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>

      {stats && (
        <div className="bg-white/5 rounded-lg p-4 mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{stats.totalGames}</div>
            <div className="text-white/60 text-sm">Total Games</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">{stats.waitingGames}</div>
            <div className="text-white/60 text-sm">Waiting</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">{stats.playingGames}</div>
            <div className="text-white/60 text-sm">Playing</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">{stats.totalPlayers}</div>
            <div className="text-white/60 text-sm">Players</div>
          </div>
        </div>
      )}

      {!mode ? (
        <div className="space-y-3">
          <button
            onClick={() => setMode('find')}
            disabled={!connected}
            className="w-full btn-primary text-lg py-4"
          >
            🔍 Quick Match
          </button>
          
          <button
            onClick={() => setMode('create')}
            disabled={!connected}
            className="w-full btn-secondary"
          >
            ➕ Create Game
          </button>
          
          <button
            onClick={() => setMode('join')}
            disabled={!connected}
            className="w-full btn-secondary"
          >
            🎯 Join Game
          </button>

          <div className="pt-2 border-t border-white/10 mt-4">
            <button
              onClick={onViewLeaderboard}
              className="w-full btn-secondary bg-gradient-to-r from-yellow-600/20 to-orange-600/20 border-2 border-yellow-500/30 hover:border-yellow-500/50"
            >
              🏆 Leaderboard
            </button>
          </div>
        </div>
      ) : (
        renderForm()
      )}

      <div className="mt-8 pt-6 border-t border-white/10">
        <h3 className="text-white font-semibold mb-2">How to Play:</h3>
        <ul className="text-white/70 text-sm space-y-1">
          <li>• <strong>Quick Match:</strong> Automatically find or create a game</li>
          <li>• <strong>Create Game:</strong> Share the Game ID with a friend</li>
          <li>• <strong>Join Game:</strong> Enter a friend's Game ID</li>
        </ul>
      </div>
    </div>
  );
}

export default Home;

