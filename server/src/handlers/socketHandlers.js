export const setupSocketHandlers = (io, gameManager, leaderboardManager) => {
  io.on('connection', (socket) => {
    console.log(`🔌 Player connected: ${socket.id}`);

    // Send current stats
    socket.emit('stats', gameManager.getStats());

    // Create a new game
    socket.on('createGame', (playerData) => {
      try {
        const player = {
          id: socket.id,
          name: playerData.name || `Player-${socket.id.substring(0, 5)}`,
          socketId: socket.id
        };

        const game = gameManager.createGame(player);
        socket.join(game.id);
        
        socket.emit('gameCreated', {
          game: game.toJSON(),
          playerId: socket.id,
          symbol: 'X'
        });

        // Broadcast updated stats
        io.emit('stats', gameManager.getStats());

        console.log(`🎮 Game created: ${game.id} by ${player.name}`);
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });

    // Join an existing game
    socket.on('joinGame', (data) => {
      try {
        const { gameId, playerData } = data;
        const player = {
          id: socket.id,
          name: playerData.name || `Player-${socket.id.substring(0, 5)}`,
          socketId: socket.id
        };

        const result = gameManager.joinGame(gameId, player);
        
        if (result.success) {
          socket.join(gameId);
          
          // Notify both players
          io.to(gameId).emit('gameStarted', {
            game: result.game.toJSON()
          });

          socket.emit('gameJoined', {
            game: result.game.toJSON(),
            playerId: socket.id,
            symbol: 'O'
          });

          // Broadcast updated stats
          io.emit('stats', gameManager.getStats());

          console.log(`👥 Player ${player.name} joined game: ${gameId}`);
        } else {
          socket.emit('error', { message: result.error });
        }
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });

    // Find and join any available game
    socket.on('findGame', (playerData) => {
      try {
        const player = {
          id: socket.id,
          name: playerData.name || `Player-${socket.id.substring(0, 5)}`,
          socketId: socket.id
        };

        // Look for an available game
        const availableGame = gameManager.findAvailableGame();

        if (availableGame) {
          // Join the available game
          const result = gameManager.joinGame(availableGame.id, player);
          
          if (result.success) {
            socket.join(availableGame.id);
            
            // Notify both players
            io.to(availableGame.id).emit('gameStarted', {
              game: result.game.toJSON()
            });

            socket.emit('gameJoined', {
              game: result.game.toJSON(),
              playerId: socket.id,
              symbol: 'O'
            });

            // Broadcast updated stats
            io.emit('stats', gameManager.getStats());

            console.log(`🔍 Player ${player.name} found and joined game: ${availableGame.id}`);
          } else {
            socket.emit('error', { message: result.error });
          }
        } else {
          // No game available, create a new one
          const game = gameManager.createGame(player);
          socket.join(game.id);
          
          socket.emit('gameCreated', {
            game: game.toJSON(),
            playerId: socket.id,
            symbol: 'X'
          });

          socket.emit('waitingForOpponent');

          // Broadcast updated stats
          io.emit('stats', gameManager.getStats());

          console.log(`🎮 No game found, created new game: ${game.id} by ${player.name}`);
        }
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });

    // Make a move
    socket.on('makeMove', (data) => {
      try {
        const { gameId, position } = data;
        const result = gameManager.makeMove(gameId, socket.id, position);

        if (result.success) {
          const game = gameManager.getGame(gameId);
          
          // Notify all players in the game
          io.to(gameId).emit('moveMade', {
            game: game.toJSON(),
            position,
            player: socket.id
          });

          // If game ended, emit game over event
          if (result.gameResult.gameOver) {
            // Record game result in leaderboard
            let playerStats = null;
            let pointsEarned = { X: 0, O: 0 };
            
            if (leaderboardManager && game.players.X && game.players.O) {
              const player1Name = game.players.X.name;
              const player2Name = game.players.O.name;
              const player1SocketId = game.players.X.id;
              const player2SocketId = game.players.O.id;
              
              let winnerName = null;
              if (result.gameResult.winner === 'X') {
                winnerName = player1Name;
                pointsEarned.X = 3;
                pointsEarned.O = 0;
              } else if (result.gameResult.winner === 'O') {
                winnerName = player2Name;
                pointsEarned.X = 0;
                pointsEarned.O = 3;
              } else {
                // Draw
                pointsEarned.X = 1;
                pointsEarned.O = 1;
              }

              playerStats = leaderboardManager.recordGameResult(
                player1Name, 
                player2Name, 
                winnerName, 
                result.gameResult.isDraw
              );

              // Send updated stats to players
              io.to(player1SocketId).emit('playerStats', playerStats.player1);
              io.to(player2SocketId).emit('playerStats', playerStats.player2);
            }

            io.to(gameId).emit('gameOver', {
              winner: result.gameResult.winner,
              winningLine: result.gameResult.winningLine,
              isDraw: result.gameResult.isDraw,
              game: game.toJSON(),
              pointsEarned,
              playerStats: playerStats || null
            });

            console.log(`🏁 Game ${gameId} ended. Winner: ${result.gameResult.winner || 'Draw'}`);
          }

          // Broadcast updated stats
          io.emit('stats', gameManager.getStats());
        } else {
          socket.emit('error', { message: result.error });
        }
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });

    // Get game state
    socket.on('getGameState', (gameId) => {
      try {
        const game = gameManager.getGame(gameId);
        if (game) {
          socket.emit('gameState', game.toJSON());
        } else {
          socket.emit('error', { message: 'Game not found' });
        }
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });

    // Leave game
    socket.on('leaveGame', () => {
      try {
        const game = gameManager.removePlayerFromGame(socket.id);
        if (game) {
          // Notify other player
          io.to(game.id).emit('playerLeft', {
            playerId: socket.id,
            game: game.toJSON()
          });

          socket.leave(game.id);

          // Broadcast updated stats
          io.emit('stats', gameManager.getStats());

          console.log(`👋 Player ${socket.id} left game: ${game.id}`);
        }
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });

    // Disconnect
    socket.on('disconnect', () => {
      try {
        const game = gameManager.removePlayerFromGame(socket.id);
        if (game) {
          // Notify other player
          io.to(game.id).emit('playerDisconnected', {
            playerId: socket.id,
            game: game.toJSON()
          });

          // Broadcast updated stats
          io.emit('stats', gameManager.getStats());

          console.log(`🔌 Player disconnected from game: ${game.id}`);
        }
        console.log(`🔌 Player disconnected: ${socket.id}`);
      } catch (error) {
        console.error('Error handling disconnect:', error);
      }
    });
  });
};

