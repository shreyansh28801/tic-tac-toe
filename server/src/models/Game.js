import { v4 as uuidv4 } from 'uuid';

export class Game {
  constructor(creator) {
    this.id = uuidv4();
    this.players = {
      X: creator,
      O: null
    };
    this.board = Array(9).fill(null);
    this.currentTurn = 'X';
    this.status = 'waiting'; // waiting, playing, finished
    this.winner = null;
    this.winningLine = null;
    this.createdAt = Date.now();
    this.startedAt = null; // When game actually started (both players joined)
    this.finishedAt = null; // When game finished
    this.duration = null; // Game duration in ms
    this.updatedAt = Date.now();
  }

  addPlayer(player) {
    if (this.players.O === null) {
      this.players.O = player;
      this.status = 'playing';
      this.startedAt = Date.now(); // Game starts when second player joins
      this.updatedAt = Date.now();
      return true;
    }
    return false;
  }

  makeMove(position, playerId) {
    // Validate move
    if (this.status !== 'playing') {
      return { success: false, error: 'Game is not in playing state' };
    }

    if (this.board[position] !== null) {
      return { success: false, error: 'Position already taken' };
    }

    // Check if it's the player's turn
    const playerSymbol = this.getPlayerSymbol(playerId);
    if (!playerSymbol) {
      return { success: false, error: 'Player not in this game' };
    }

    if (playerSymbol !== this.currentTurn) {
      return { success: false, error: 'Not your turn' };
    }

    // Make the move
    this.board[position] = playerSymbol;
    this.updatedAt = Date.now();

    // Check for winner
    const gameResult = this.checkGameEnd();
    
    if (gameResult.gameOver) {
      this.status = 'finished';
      this.winner = gameResult.winner;
      this.winningLine = gameResult.winningLine;
      this.finishedAt = Date.now();
      if (this.startedAt) {
        this.duration = this.finishedAt - this.startedAt;
      }
    } else {
      // Switch turn
      this.currentTurn = this.currentTurn === 'X' ? 'O' : 'X';
    }

    return { success: true, gameResult };
  }

  checkGameEnd() {
    const winPatterns = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
      [0, 4, 8], [2, 4, 6]             // Diagonals
    ];

    // Check for winner
    for (const pattern of winPatterns) {
      const [a, b, c] = pattern;
      if (
        this.board[a] &&
        this.board[a] === this.board[b] &&
        this.board[a] === this.board[c]
      ) {
        return {
          gameOver: true,
          winner: this.board[a],
          winningLine: pattern,
          isDraw: false
        };
      }
    }

    // Check for draw
    if (this.board.every(cell => cell !== null)) {
      return {
        gameOver: true,
        winner: null,
        winningLine: null,
        isDraw: true
      };
    }

    // Game continues
    return {
      gameOver: false,
      winner: null,
      winningLine: null,
      isDraw: false
    };
  }

  getPlayerSymbol(playerId) {
    if (this.players.X?.id === playerId) return 'X';
    if (this.players.O?.id === playerId) return 'O';
    return null;
  }

  getOpponentSymbol(playerId) {
    const playerSymbol = this.getPlayerSymbol(playerId);
    if (playerSymbol === 'X') return 'O';
    if (playerSymbol === 'O') return 'X';
    return null;
  }

  removePlayer(playerId) {
    if (this.players.X?.id === playerId) {
      this.players.X = null;
    }
    if (this.players.O?.id === playerId) {
      this.players.O = null;
    }
    this.updatedAt = Date.now();
  }

  toJSON() {
    return {
      id: this.id,
      players: this.players,
      board: this.board,
      currentTurn: this.currentTurn,
      status: this.status,
      winner: this.winner,
      winningLine: this.winningLine,
      createdAt: this.createdAt,
      startedAt: this.startedAt,
      finishedAt: this.finishedAt,
      duration: this.duration,
      updatedAt: this.updatedAt
    };
  }
}

