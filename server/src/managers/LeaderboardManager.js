import { PlayerStats } from '../models/PlayerStats.js';
import { db } from '../config/firebase.js';

export class LeaderboardManager {
  constructor() {
    this.players = new Map(); // playerName -> PlayerStats
    this.loadFromFirebase();
  }

  async loadFromFirebase() {
    if (!db) return;

    try {
      const snapshot = await db.collection('players').get();
      snapshot.forEach(doc => {
        const stats = PlayerStats.fromJSON(doc.data());
        this.players.set(stats.playerName, stats);
      });
      console.log(`✅ Loaded ${this.players.size} player stats from Firebase`);
    } catch (error) {
      console.error('Error loading player stats:', error);
    }
  }

  getOrCreatePlayer(playerName) {
    // Normalize name (trim and handle case)
    const normalizedName = playerName.trim();
    
    if (this.players.has(normalizedName)) {
      return this.players.get(normalizedName);
    }

    const newPlayer = new PlayerStats(normalizedName);
    this.players.set(normalizedName, newPlayer);
    this.savePlayerToFirebase(newPlayer);
    return newPlayer;
  }

  recordGameResult(player1Name, player2Name, winnerName, isDraw) {
    const player1 = this.getOrCreatePlayer(player1Name);
    const player2 = this.getOrCreatePlayer(player2Name);

    if (isDraw) {
      player1.recordDraw();
      player2.recordDraw();
    } else if (winnerName === player1Name) {
      player1.recordWin();
      player2.recordLoss();
    } else if (winnerName === player2Name) {
      player2.recordWin();
      player1.recordLoss();
    }

    this.savePlayerToFirebase(player1);
    this.savePlayerToFirebase(player2);

    return {
      player1: player1.toJSON(),
      player2: player2.toJSON()
    };
  }

  getLeaderboard(limit = 100, sortBy = 'points') {
    const players = Array.from(this.players.values());

    // Sort based on criteria
    const sortFunctions = {
      points: (a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        return b.winRate - a.winRate; // Tiebreaker: win rate
      },
      wins: (a, b) => {
        if (b.wins !== a.wins) return b.wins - a.wins;
        return b.winRate - a.winRate;
      },
      winRate: (a, b) => {
        // Only compare players with at least 5 games
        const minGames = 5;
        const aQualified = a.gamesPlayed >= minGames;
        const bQualified = b.gamesPlayed >= minGames;
        
        if (aQualified && !bQualified) return -1;
        if (!aQualified && bQualified) return 1;
        
        if (b.winRate !== a.winRate) return b.winRate - a.winRate;
        return b.gamesPlayed - a.gamesPlayed;
      },
      gamesPlayed: (a, b) => b.gamesPlayed - a.gamesPlayed
    };

    const sortFunction = sortFunctions[sortBy] || sortFunctions.points;
    players.sort(sortFunction);

    // Add rank
    const leaderboard = players.slice(0, limit).map((player, index) => ({
      rank: index + 1,
      ...player.toJSON()
    }));

    return leaderboard;
  }

  getPlayerStats(playerName) {
    const normalizedName = playerName.trim();
    const player = this.players.get(normalizedName);
    return player ? player.toJSON() : null;
  }

  getPlayerRank(playerName, sortBy = 'points') {
    const normalizedName = playerName.trim();
    const leaderboard = this.getLeaderboard(1000, sortBy);
    const playerIndex = leaderboard.findIndex(p => p.playerName === normalizedName);
    return playerIndex >= 0 ? playerIndex + 1 : null;
  }

  getTopPlayers(limit = 10, sortBy = 'points') {
    return this.getLeaderboard(limit, sortBy);
  }

  async savePlayerToFirebase(player) {
    if (!db) return;

    try {
      // Use playerName as document ID
      await db.collection('players').doc(player.playerName).set(player.toJSON());
    } catch (error) {
      console.error('Error saving player stats:', error);
    }
  }

  getStats() {
    const players = Array.from(this.players.values());
    return {
      totalPlayers: players.length,
      totalGamesPlayed: players.reduce((sum, p) => sum + p.gamesPlayed, 0),
      totalWins: players.reduce((sum, p) => sum + p.wins, 0),
      totalDraws: players.reduce((sum, p) => sum + p.draws, 0),
      averageWinRate: players.length > 0 
        ? Math.round(players.reduce((sum, p) => sum + p.winRate, 0) / players.length) 
        : 0
    };
  }
}

