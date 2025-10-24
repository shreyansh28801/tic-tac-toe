import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { GameManager } from './managers/GameManager.js';
import { LeaderboardManager } from './managers/LeaderboardManager.js';
import { setupSocketHandlers } from './handlers/socketHandlers.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);

// CORS configuration
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://192.168.1.5:5173',
  'http://127.0.0.1:5173',
  'https://tic-tac-toe-fe-4woa.onrender.com',  // Frontend on Render
];

// CORS origin checker - allows listed origins and any Render subdomain
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    
    // Check if origin is in allowed list or ends with .onrender.com
    if (allowedOrigins.includes(origin) || origin.endsWith('.onrender.com')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
};

app.use(cors(corsOptions));

app.use(express.json());

// Socket.io setup
const io = new Server(httpServer, {
  cors: {
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin) || origin.endsWith('.onrender.com')) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Initialize Managers
const gameManager = new GameManager();
const leaderboardManager = new LeaderboardManager();

// Setup socket handlers
setupSocketHandlers(io, gameManager, leaderboardManager);

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: '🎮 Tic-Tac-Toe Server API',
    version: '1.0.0',
    status: 'online',
    endpoints: {
      health: '/health',
      stats: '/api/stats',
      leaderboard: '/api/leaderboard',
      topPlayers: '/api/leaderboard/top',
      player: '/api/player/:playerName',
      leaderboardStats: '/api/leaderboard/stats'
    },
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    stats: gameManager.getStats()
  });
});

// Get server stats
app.get('/api/stats', (req, res) => {
  res.json(gameManager.getStats());
});

// Leaderboard endpoints
app.get('/api/leaderboard', (req, res) => {
  const { limit = 100, sortBy = 'points' } = req.query;
  const leaderboard = leaderboardManager.getLeaderboard(parseInt(limit), sortBy);
  res.json(leaderboard);
});

app.get('/api/leaderboard/top', (req, res) => {
  const { limit = 10, sortBy = 'points' } = req.query;
  const topPlayers = leaderboardManager.getTopPlayers(parseInt(limit), sortBy);
  res.json(topPlayers);
});

app.get('/api/player/:playerName', (req, res) => {
  const { playerName } = req.params;
  const decodedName = decodeURIComponent(playerName);
  const stats = leaderboardManager.getPlayerStats(decodedName);
  
  if (stats) {
    const rank = leaderboardManager.getPlayerRank(decodedName);
    res.json({ ...stats, rank });
  } else {
    res.status(404).json({ error: 'Player not found' });
  }
});

app.get('/api/leaderboard/stats', (req, res) => {
  res.json(leaderboardManager.getStats());
});

// Start server
const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || '0.0.0.0';

console.log('🔍 Environment check:');
console.log('PORT from env:', process.env.PORT);
console.log('PORT to use:', PORT);
console.log('HOST to use:', HOST);

httpServer.listen(PORT, HOST, () => {
  console.log(`
╔════════════════════════════════════════════╗
║   🎮 Tic-Tac-Toe Server Running           ║
║   Port: ${PORT}                              ║
║   Host: ${HOST}                              ║
║   Environment: ${process.env.NODE_ENV || 'development'}              ║
║   Time: ${new Date().toLocaleString()}     ║
╚════════════════════════════════════════════╝
  `);
  console.log(`✅ Server is listening on ${HOST}:${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  httpServer.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

