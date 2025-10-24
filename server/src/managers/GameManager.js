import { Game } from '../models/Game.js';
import { db } from '../config/firebase.js';

export class GameManager {
  constructor() {
    this.games = new Map(); // gameId -> Game
    this.playerGames = new Map(); // playerId -> gameId
  }

  createGame(player) {
    const game = new Game(player);
    this.games.set(game.id, game);
    this.playerGames.set(player.id, game.id);
    
    // Save to Firebase (optional, for persistence)
    this.saveGameToFirebase(game);
    
    return game;
  }

  joinGame(gameId, player) {
    const game = this.games.get(gameId);
    
    if (!game) {
      return { success: false, error: 'Game not found' };
    }

    if (game.status !== 'waiting') {
      return { success: false, error: 'Game already started or finished' };
    }

    const added = game.addPlayer(player);
    if (added) {
      this.playerGames.set(player.id, gameId);
      this.saveGameToFirebase(game);
      return { success: true, game };
    }

    return { success: false, error: 'Game is full' };
  }

  findAvailableGame() {
    for (const game of this.games.values()) {
      if (game.status === 'waiting') {
        return game;
      }
    }
    return null;
  }

  makeMove(gameId, playerId, position) {
    const game = this.games.get(gameId);
    
    if (!game) {
      return { success: false, error: 'Game not found' };
    }

    const result = game.makeMove(position, playerId);
    
    if (result.success) {
      this.saveGameToFirebase(game);
    }

    return result;
  }

  getGame(gameId) {
    return this.games.get(gameId);
  }

  getPlayerGame(playerId) {
    const gameId = this.playerGames.get(playerId);
    return gameId ? this.games.get(gameId) : null;
  }

  removePlayerFromGame(playerId) {
    const gameId = this.playerGames.get(playerId);
    if (!gameId) return null;

    const game = this.games.get(gameId);
    if (game) {
      game.removePlayer(playerId);
      
      // If both players left, remove the game
      if (!game.players.X && !game.players.O) {
        this.games.delete(gameId);
      } else {
        this.saveGameToFirebase(game);
      }
    }

    this.playerGames.delete(playerId);
    return game;
  }

  async saveGameToFirebase(game) {
    if (!db) return; // Skip if Firebase not initialized
    
    try {
      await db.collection('games').doc(game.id).set(game.toJSON());
    } catch (error) {
      console.error('Error saving game to Firebase:', error);
    }
  }

  getStats() {
    return {
      totalGames: this.games.size,
      waitingGames: Array.from(this.games.values()).filter(g => g.status === 'waiting').length,
      playingGames: Array.from(this.games.values()).filter(g => g.status === 'playing').length,
      finishedGames: Array.from(this.games.values()).filter(g => g.status === 'finished').length,
      totalPlayers: this.playerGames.size
    };
  }
}

