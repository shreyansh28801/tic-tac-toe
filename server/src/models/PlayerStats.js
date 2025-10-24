export class PlayerStats {
  constructor(playerName) {
    this.playerName = playerName; // This is now the unique identifier
    this.gamesPlayed = 0;
    this.wins = 0;
    this.losses = 0;
    this.draws = 0;
    this.winRate = 0;
    this.points = 0; // Win = 3 points, Draw = 1 point, Loss = 0 points
    this.lastPlayed = Date.now();
    this.createdAt = Date.now();
  }

  recordWin() {
    this.gamesPlayed++;
    this.wins++;
    this.points += 3;
    this.lastPlayed = Date.now();
    this.updateWinRate();
  }

  recordLoss() {
    this.gamesPlayed++;
    this.losses++;
    this.lastPlayed = Date.now();
    this.updateWinRate();
  }

  recordDraw() {
    this.gamesPlayed++;
    this.draws++;
    this.points += 1;
    this.lastPlayed = Date.now();
    this.updateWinRate();
  }

  updateWinRate() {
    if (this.gamesPlayed === 0) {
      this.winRate = 0;
    } else {
      this.winRate = Math.round((this.wins / this.gamesPlayed) * 100);
    }
  }

  toJSON() {
    return {
      playerName: this.playerName,
      gamesPlayed: this.gamesPlayed,
      wins: this.wins,
      losses: this.losses,
      draws: this.draws,
      winRate: this.winRate,
      points: this.points,
      lastPlayed: this.lastPlayed,
      createdAt: this.createdAt
    };
  }

  static fromJSON(data) {
    const stats = new PlayerStats(data.playerName);
    stats.gamesPlayed = data.gamesPlayed || 0;
    stats.wins = data.wins || 0;
    stats.losses = data.losses || 0;
    stats.draws = data.draws || 0;
    stats.winRate = data.winRate || 0;
    stats.points = data.points || 0;
    stats.lastPlayed = data.lastPlayed || Date.now();
    stats.createdAt = data.createdAt || Date.now();
    return stats;
  }
}

