import { useState, useEffect } from 'react';
import socket from './config/socket';
import Home from './components/Home';
import Game from './components/Game';
import Leaderboard from './components/Leaderboard';
import PlayerStats from './components/PlayerStats';
import GameOverModal from './components/GameOverModal';
import Toast from './components/Toast';

function App() {
  const [view, setView] = useState('home'); // 'home', 'game', 'leaderboard'
  const [gameState, setGameState] = useState(null);
  const [playerId, setPlayerId] = useState(null);
  const [playerSymbol, setPlayerSymbol] = useState(null);
  const [playerName, setPlayerName] = useState(''); // Store player name for play again
  const [connected, setConnected] = useState(false);
  const [toast, setToast] = useState(null);
  const [stats, setStats] = useState(null);
  const [playerStats, setPlayerStats] = useState(null);
  const [showPlayerStats, setShowPlayerStats] = useState(false);
  const [gameOverData, setGameOverData] = useState(null);
  const [showGameOver, setShowGameOver] = useState(false);

  useEffect(() => {
    // Connect to socket
    socket.connect();

    // Socket event handlers
    socket.on('connect', () => {
      console.log('Connected to server');
      setConnected(true);
      setPlayerId(socket.id);
      showToast('Connected to server', 'success');
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from server');
      setConnected(false);
      showToast('Disconnected from server', 'error');
    });

    socket.on('gameCreated', (data) => {
      console.log('Game created:', data);
      setGameState(data.game);
      setPlayerId(data.playerId);
      setPlayerSymbol(data.symbol);
      setView('game');
      showToast('Game created! Waiting for opponent...', 'success');
    });

    socket.on('gameJoined', (data) => {
      console.log('Game joined:', data);
      setGameState(data.game);
      setPlayerId(data.playerId);
      setPlayerSymbol(data.symbol);
      setView('game');
      showToast('Joined game successfully!', 'success');
    });

    socket.on('gameStarted', (data) => {
      console.log('Game started:', data);
      setGameState(data.game);
      showToast('Game started! Good luck!', 'success');
    });

    socket.on('waitingForOpponent', () => {
      showToast('Waiting for an opponent to join...', 'info');
    });

    socket.on('moveMade', (data) => {
      console.log('Move made:', data);
      setGameState(data.game);
    });

    socket.on('gameOver', (data) => {
      console.log('Game over:', data);
      setGameState(data.game);
      setGameOverData(data);
      
      // Show game over modal after a short delay
      setTimeout(() => {
        setShowGameOver(true);
      }, 500);
      
      if (data.isDraw) {
        showToast("It's a draw!", 'info');
      } else {
        const isWinner = data.winner === playerSymbol;
        showToast(
          isWinner ? '🎉 You won!' : '😢 You lost!',
          isWinner ? 'success' : 'error'
        );
      }
    });

    socket.on('playerStats', (data) => {
      console.log('Player stats updated:', data);
      setPlayerStats(data);
    });

    socket.on('playerLeft', (data) => {
      console.log('Player left:', data);
      setGameState(data.game);
      showToast('Opponent left the game', 'warning');
    });

    socket.on('playerDisconnected', (data) => {
      console.log('Player disconnected:', data);
      setGameState(data.game);
      showToast('Opponent disconnected', 'warning');
    });

    socket.on('stats', (data) => {
      setStats(data);
    });

    socket.on('error', (data) => {
      console.error('Server error:', data);
      showToast(data.message || 'An error occurred', 'error');
    });

    // Cleanup
    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('gameCreated');
      socket.off('gameJoined');
      socket.off('gameStarted');
      socket.off('waitingForOpponent');
      socket.off('moveMade');
      socket.off('gameOver');
      socket.off('playerLeft');
      socket.off('playerDisconnected');
      socket.off('playerStats');
      socket.off('stats');
      socket.off('error');
    };
  }, [playerSymbol]);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleCreateGame = (name) => {
    setPlayerName(name); // Store for play again
    socket.emit('createGame', { name });
  };

  const handleJoinGame = (gameId, name) => {
    setPlayerName(name); // Store for play again
    socket.emit('joinGame', { gameId, playerData: { name } });
  };

  const handleFindGame = (name) => {
    setPlayerName(name); // Store for play again
    socket.emit('findGame', { name });
  };

  const handleMakeMove = (position) => {
    if (!gameState || !gameState.id) {
      showToast('No active game', 'error');
      return;
    }

    socket.emit('makeMove', {
      gameId: gameState.id,
      position
    });
  };

  const handleLeaveGame = () => {
    socket.emit('leaveGame');
    setGameState(null);
    setPlayerSymbol(null);
    setGameOverData(null);
    setShowGameOver(false);
    setView('home');
  };

  const handleViewLeaderboard = () => {
    setView('leaderboard');
  };

  const handleBackToHome = () => {
    setGameState(null);
    setPlayerSymbol(null);
    setGameOverData(null);
    setShowGameOver(false);
    setView('home');
  };

  const handlePlayAgain = () => {
    // Close modals
    setShowGameOver(false);
    setGameOverData(null);
    
    // Leave current game
    if (gameState) {
      socket.emit('leaveGame');
    }
    
    // Reset game state
    setGameState(null);
    setPlayerSymbol(null);
    
    // Auto find new game
    if (playerName) {
      handleFindGame(playerName);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {view === 'home' && (
          <Home
            onCreateGame={handleCreateGame}
            onJoinGame={handleJoinGame}
            onFindGame={handleFindGame}
            onViewLeaderboard={handleViewLeaderboard}
            connected={connected}
            stats={stats}
          />
        )}
        
        {view === 'game' && gameState && (
          <Game
            game={gameState}
            playerId={playerId}
            playerSymbol={playerSymbol}
            onMakeMove={handleMakeMove}
            onLeaveGame={handleLeaveGame}
          />
        )}
        
        {view === 'leaderboard' && (
          <Leaderboard
            onBack={handleBackToHome}
            currentPlayerName={playerName}
          />
        )}
      </div>
      
      {toast && <Toast message={toast.message} type={toast.type} />}
      
      {showGameOver && gameOverData && (
        <GameOverModal
          gameData={gameOverData}
          playerSymbol={playerSymbol}
          onPlayAgain={handlePlayAgain}
          onBackToHome={handleBackToHome}
        />
      )}
      
      {showPlayerStats && playerStats && !showGameOver && (
        <PlayerStats
          stats={playerStats}
          onClose={() => setShowPlayerStats(false)}
        />
      )}
    </div>
  );
}

export default App;

