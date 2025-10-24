import { useState } from 'react';
import Board from './Board';

function Game({ game, playerId, playerSymbol, onMakeMove, onLeaveGame }) {
  const [showGameId, setShowGameId] = useState(false);

  if (!game) return null;

  const isMyTurn = game.currentTurn === playerSymbol;
  const isGameOver = game.status === 'finished';
  const isWaiting = game.status === 'waiting';

  const opponentSymbol = playerSymbol === 'X' ? 'O' : 'X';
  const opponent = game.players[opponentSymbol];

  const getStatusMessage = () => {
    if (isWaiting) {
      return 'Waiting for opponent to join...';
    }
    if (isGameOver) {
      if (game.winner === null) {
        return "It's a draw! 🤝";
      }
      return game.winner === playerSymbol 
        ? '🎉 You won!' 
        : '😢 You lost!';
    }
    return isMyTurn 
      ? '🎯 Your turn!' 
      : '⏳ Opponent\'s turn...';
  };

  const copyGameId = () => {
    // Try modern Clipboard API first
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(game.id)
        .then(() => {
          setShowGameId(true);
          setTimeout(() => setShowGameId(false), 2000);
        })
        .catch(err => {
          console.error('Failed to copy:', err);
          fallbackCopy();
        });
    } else {
      // Fallback for browsers that don't support Clipboard API
      fallbackCopy();
    }
  };

  const fallbackCopy = () => {
    const textArea = document.createElement('textarea');
    textArea.value = game.id;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      document.execCommand('copy');
      setShowGameId(true);
      setTimeout(() => setShowGameId(false), 2000);
    } catch (err) {
      console.error('Fallback copy failed:', err);
      alert('Game ID: ' + game.id + '\n\nPlease copy manually.');
    }
    
    document.body.removeChild(textArea);
  };

  return (
    <div className="card max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-white mb-4">
          {getStatusMessage()}
        </h2>

        {/* Game ID */}
        {isWaiting && (
          <div className="bg-white/10 rounded-lg p-3 mb-4">
            <p className="text-white/70 text-sm mb-2">Share this Game ID:</p>
            <div className="flex items-center justify-center gap-2">
              <code className="text-white font-mono bg-black/30 px-3 py-1 rounded">
                {game.id}
              </code>
              <button
                onClick={copyGameId}
                className="px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors text-sm"
              >
                {showGameId ? '✓ Copied' : '📋 Copy'}
              </button>
            </div>
          </div>
        )}

        {/* Player Info */}
        <div className="flex justify-between items-center bg-white/5 rounded-lg p-4">
          <div className="text-left">
            <div className="text-white/60 text-sm">You</div>
            <div className="text-white font-bold text-xl">
              {game.players[playerSymbol]?.name || 'Player'}
              <span className="ml-2 text-purple-400">({playerSymbol})</span>
            </div>
          </div>
          
          <div className="text-2xl">VS</div>
          
          <div className="text-right">
            <div className="text-white/60 text-sm">Opponent</div>
            <div className="text-white font-bold text-xl">
              {opponent?.name || 'Waiting...'}
              {opponent && (
                <span className="ml-2 text-pink-400">({opponentSymbol})</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Game Board */}
      <Board
        board={game.board}
        onCellClick={onMakeMove}
        disabled={!isMyTurn || isGameOver || isWaiting}
        winningLine={game.winningLine}
      />

      {/* Actions */}
      <div className="mt-6 flex gap-3">
        <button
          onClick={onLeaveGame}
          className="btn-secondary flex-1"
        >
          {isGameOver ? '🏠 Back to Home' : '🚪 Leave Game'}
        </button>
        
        {isGameOver && (
          <button
            onClick={onLeaveGame}
            className="btn-primary flex-1"
          >
            🎮 New Game
          </button>
        )}
      </div>

      {/* Turn Indicator */}
      {!isGameOver && !isWaiting && (
        <div className="mt-4 text-center">
          <div className={`inline-block px-4 py-2 rounded-full ${
            isMyTurn 
              ? 'bg-green-500/20 text-green-400 border border-green-500' 
              : 'bg-white/5 text-white/60'
          }`}>
            {isMyTurn ? '🟢 Your turn' : '🔴 Opponent\'s turn'}
          </div>
        </div>
      )}
    </div>
  );
}

export default Game;

