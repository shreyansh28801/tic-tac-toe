# 🏆 Leaderboard System Documentation

## Overview

The leaderboard system tracks player performance, rankings, and statistics across all games. Players earn points based on game results and climb the ranks!

## Features

### ✅ Player Statistics Tracked
- **Games Played**: Total number of games
- **Wins**: Total victories
- **Losses**: Total defeats  
- **Draws**: Total tied games
- **Win Rate**: Percentage of games won
- **Points**: Total ranking points earned
- **Rank**: Position on the leaderboard

### 🏆 Scoring System

| Result | Points | Impact |
|--------|--------|---------|
| Win    | **+3 points** | Increases win rate |
| Draw   | **+1 point**  | Maintains rank |
| Loss   | **0 points**  | Decreases win rate |

### 📊 Sorting Options

The leaderboard can be sorted by:
1. **Points** (Default): Total points accumulated
2. **Wins**: Total number of victories
3. **Win Rate**: Percentage of games won (minimum 5 games)
4. **Games Played**: Total game participation

### 🎖️ Ranking Badges

- 🥇 **#1**: Gold Medal
- 🥈 **#2**: Silver Medal
- 🥉 **#3**: Bronze Medal
- **#4+**: Numerical rank

### ⭐ Level System

Players level up based on total points:
- **Level = (Points ÷ 10) + 1**
- Example: 30 points = Level 4

### 🏅 Achievements

Automatic achievement badges:
- 🎮 **First Game**: Played first game
- 🏆 **First Win**: Won first game
- 🌟 **10 Wins**: Won 10+ games
- 🔥 **Hot Streak**: 70%+ win rate with 5+ games
- ⭐ **Level 5+**: Reached level 5 or higher

## Server Architecture

### Data Model

```javascript
PlayerStats {
  playerId: string        // Unique player ID (socket ID)
  playerName: string      // Player display name
  gamesPlayed: number     // Total games
  wins: number            // Total wins
  losses: number          // Total losses
  draws: number           // Total draws
  winRate: number         // Win percentage (0-100)
  points: number          // Total points
  lastPlayed: timestamp   // Last game timestamp
  createdAt: timestamp    // Account creation
}
```

### API Endpoints

#### Get Full Leaderboard
```
GET /api/leaderboard?limit=100&sortBy=points
```

**Query Parameters:**
- `limit` (optional): Number of players to return (default: 100)
- `sortBy` (optional): Sort criteria - 'points', 'wins', 'winRate', 'gamesPlayed' (default: 'points')

**Response:**
```json
[
  {
    "rank": 1,
    "playerId": "abc123",
    "playerName": "Player1",
    "gamesPlayed": 20,
    "wins": 15,
    "losses": 3,
    "draws": 2,
    "winRate": 75,
    "points": 47,
    "lastPlayed": 1698765432000,
    "createdAt": 1698700000000
  },
  ...
]
```

#### Get Top Players
```
GET /api/leaderboard/top?limit=10&sortBy=points
```

Returns top N players (default: 10)

#### Get Individual Player Stats
```
GET /api/player/:playerId
```

**Response:**
```json
{
  "playerId": "abc123",
  "playerName": "Player1",
  "gamesPlayed": 20,
  "wins": 15,
  "losses": 3,
  "draws": 2,
  "winRate": 75,
  "points": 47,
  "rank": 1,
  "lastPlayed": 1698765432000,
  "createdAt": 1698700000000
}
```

#### Get Leaderboard Statistics
```
GET /api/leaderboard/stats
```

**Response:**
```json
{
  "totalPlayers": 150,
  "totalGamesPlayed": 500,
  "totalWins": 350,
  "totalDraws": 50,
  "averageWinRate": 58
}
```

### Socket Events

#### Server → Client

**playerStats**: Sent after each game to update player stats
```javascript
socket.on('playerStats', (data) => {
  // data = PlayerStats object
});
```

## Client Architecture

### Components

#### 1. Leaderboard Component
- **Path**: `client/src/components/Leaderboard.jsx`
- **Features**:
  - Displays ranked list of players
  - Sort by multiple criteria
  - Highlights current player
  - Medal badges for top 3
  - Color-coded win rates
  - Responsive design

**Props:**
- `onBack`: Function to return to home
- `currentPlayerId`: ID of current player (for highlighting)

#### 2. PlayerStats Component
- **Path**: `client/src/components/PlayerStats.jsx`
- **Features**:
  - Shows personal statistics
  - Displays level and rank
  - Shows achievement badges
  - Color-coded stats
  - Modal popup

**Props:**
- `stats`: Player statistics object
- `onClose`: Function to close modal

### Integration

The leaderboard is integrated into the main app with view routing:
- `view = 'home'`: Home screen
- `view = 'game'`: Active game
- `view = 'leaderboard'`: Leaderboard view

## Firebase Integration

Player stats are automatically saved to Firebase Firestore:

### Collection Structure
```
players/
  {playerId}/
    - All PlayerStats fields
```

### Firestore Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /players/{playerId} {
      allow read: if true;
      allow write: if true; // Server-side only via Admin SDK
    }
  }
}
```

### Persistence Benefits
- Stats survive server restarts
- Historical data preserved
- Cross-session tracking
- Analytics capabilities

## Usage Examples

### Fetch Leaderboard (Client)
```javascript
const response = await fetch('http://localhost:3001/api/leaderboard?limit=50&sortBy=points');
const leaderboard = await response.json();
```

### Get Player Stats (Client)
```javascript
const response = await fetch(`http://localhost:3001/api/player/${playerId}`);
const stats = await response.json();
```

### Listen for Stats Updates (Client)
```javascript
socket.on('playerStats', (stats) => {
  console.log('Stats updated:', stats);
  setPlayerStats(stats);
});
```

## Testing the Leaderboard

### 1. Play Multiple Games
```bash
# Open multiple browser windows
# Play several games
# Check leaderboard updates
```

### 2. Test API Endpoints
```bash
# Get full leaderboard
curl http://localhost:3001/api/leaderboard

# Get top 5 players
curl http://localhost:3001/api/leaderboard/top?limit=5

# Get player stats
curl http://localhost:3001/api/player/SOCKET_ID

# Get overall stats
curl http://localhost:3001/api/leaderboard/stats
```

### 3. Test Sorting
- Click different sort buttons on leaderboard
- Verify ordering is correct
- Check tie-breaking logic

### 4. Test Persistence
```bash
# Play games, then restart server
npm restart

# Check if stats are preserved (if Firebase configured)
```

## UI Features

### Color-Coded Win Rates
- 🟢 **70%+**: Green (Excellent)
- 🟡 **50-69%**: Yellow (Good)
- 🟠 **30-49%**: Orange (Average)
- 🔴 **<30%**: Red (Needs improvement)

### Visual Highlights
- Current player row highlighted in purple
- Top 3 players get medal emojis
- Hover effects on rows
- Smooth animations
- Responsive grid layout

### Mobile Responsive
- Stacks columns on small screens
- Hides "Games" column on mobile
- Touch-friendly buttons
- Optimized spacing

## Performance

### Optimization
- Leaderboard cached in memory
- Firebase queries on-demand
- Efficient sorting algorithms
- Minimal re-renders

### Scalability
- Supports 1000s of players
- Pagination support
- Query limits prevent overload
- Firebase handles storage scaling

## Future Enhancements

### Potential Features
- [ ] Weekly/Monthly leaderboards
- [ ] Seasonal rankings
- [ ] ELO rating system
- [ ] Match history
- [ ] Head-to-head records
- [ ] Streak tracking
- [ ] More achievements
- [ ] Profile pages
- [ ] Custom avatars
- [ ] Friend lists
- [ ] Tournaments

### Advanced Stats
- [ ] Average game duration
- [ ] Win streak (current/best)
- [ ] Favorite position (X or O)
- [ ] Time-based rankings
- [ ] Performance graphs
- [ ] Rating changes over time

## Troubleshooting

### Stats Not Saving
1. Check Firebase configuration
2. Verify `.env` variables
3. Check Firestore security rules
4. Look for errors in server console

### Leaderboard Not Loading
1. Check server is running
2. Verify API endpoint accessible
3. Check browser console for errors
4. Ensure CORS is configured

### Stats Not Updating After Game
1. Verify game completes properly
2. Check socket connection
3. Look for `playerStats` event
4. Check server logs

## Code Examples

### Server: Record Game Result
```javascript
// Automatically called when game ends
const playerStats = leaderboardManager.recordGameResult(
  player1Id, 
  player1Name, 
  player2Id, 
  player2Name, 
  winnerId, 
  isDraw
);

// Emit to players
io.to(player1Id).emit('playerStats', playerStats.player1);
io.to(player2Id).emit('playerStats', playerStats.player2);
```

### Client: Show Stats Modal
```javascript
const [showPlayerStats, setShowPlayerStats] = useState(false);

socket.on('playerStats', (stats) => {
  setPlayerStats(stats);
  setTimeout(() => setShowPlayerStats(true), 2000);
});
```

### Client: Navigate to Leaderboard
```javascript
const handleViewLeaderboard = () => {
  setView('leaderboard');
};

<button onClick={handleViewLeaderboard}>
  🏆 Leaderboard
</button>
```

## Conclusion

The leaderboard system adds competitive depth to the game by:
- ✅ Tracking comprehensive player statistics
- ✅ Providing clear ranking system
- ✅ Encouraging continued play
- ✅ Creating friendly competition
- ✅ Rewarding skill and consistency
- ✅ Preserving historical data
- ✅ Offering multiple view perspectives

Players can now see their progress, compare with others, and strive to climb the ranks!

---

**Need Help?** Check the main [README.md](./README.md) or [QUICKSTART.md](./QUICKSTART.md) for setup instructions.

