# 🚀 Quick Start Guide

Get your Tic-Tac-Toe multiplayer game running in 5 minutes!

## Prerequisites

- Node.js 16+ installed ([Download](https://nodejs.org))
- npm (comes with Node.js)
- A code editor (VS Code recommended)
- Two browser windows (to test multiplayer)

## Installation

### 1. Navigate to Project

```bash
cd /Users/shreyansh/Desktop/Tech/Interview/LilaGames/tic-tac-toe
```

### 2. Setup Server

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Create .env file (copy from example)
cp .env.example .env

# Start the server
npm run dev
```

You should see:
```
╔════════════════════════════════════════════╗
║   🎮 Tic-Tac-Toe Server Running           ║
║   Port: 3001                               ║
╚════════════════════════════════════════════╝
```

✅ Server is now running at `http://localhost:3001`

### 3. Setup Client (New Terminal Window)

```bash
# Open a new terminal
# Navigate to client directory
cd /Users/shreyansh/Desktop/Tech/Interview/LilaGames/tic-tac-toe/client

# Install dependencies
npm install

# Create .env file
echo "VITE_SERVER_URL=http://localhost:3001" > .env

# Start the client
npm run dev
```

You should see:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

✅ Client is now running at `http://localhost:5173`

## 🎮 Play Your First Game

### Option 1: Quick Match (Easiest)

1. Open `http://localhost:5173` in **two browser windows**
2. In **both windows**:
   - Enter your name
   - Click **"Quick Match"**
3. They'll automatically connect to the same game!
4. Play! 🎉

### Option 2: Create & Join with Game ID

1. **Window 1** (Create):
   - Open `http://localhost:5173`
   - Enter name: "Alice"
   - Click **"Create Game"**
   - Copy the Game ID shown on screen

2. **Window 2** (Join):
   - Open `http://localhost:5173` in new window
   - Enter name: "Bob"
   - Click **"Join Game"**
   - Paste the Game ID
   - Click **"Join Game"**

3. Play! 🎉

## 🔍 Verify Everything Works

### Check Server Health

Open in browser or run:
```bash
curl http://localhost:3001/health
```

Should return:
```json
{
  "status": "OK",
  "timestamp": "...",
  "stats": {
    "totalGames": 1,
    "waitingGames": 0,
    "playingGames": 1,
    "totalPlayers": 2
  }
}
```

### Check Console Logs

**Server Console** should show:
```
🔌 Player connected: ABC123
🎮 Game created: xyz-abc-123 by Alice
👥 Player Bob joined game: xyz-abc-123
```

**Browser Console** should show:
```
Connected to server
Game created: ...
```

## 📱 Test on Mobile Device

1. Find your computer's IP address:
   ```bash
   # Mac/Linux
   ifconfig | grep "inet "
   
   # Windows
   ipconfig
   ```

2. Update client `.env`:
   ```env
   VITE_SERVER_URL=http://YOUR_IP:3001
   ```

3. Restart client

4. On mobile, open: `http://YOUR_IP:5173`

## 🐛 Troubleshooting

### "Cannot connect to server"

**Solution 1**: Check server is running
```bash
# Should return OK
curl http://localhost:3001/health
```

**Solution 2**: Check server URL in client `.env`
```bash
cd client
cat .env
# Should show: VITE_SERVER_URL=http://localhost:3001
```

**Solution 3**: Restart both server and client

### "Port already in use"

**Server (Port 3001)**:
```bash
# Find process using port
lsof -ti:3001

# Kill it
kill -9 $(lsof -ti:3001)
```

**Client (Port 5173)**:
```bash
# Find process using port
lsof -ti:5173

# Kill it
kill -9 $(lsof -ti:5173)
```

### "npm install" fails

```bash
# Clear cache
npm cache clean --force

# Delete node_modules
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

### CORS errors in browser console

1. Make sure server `.env` has correct `CLIENT_URL`:
   ```env
   CLIENT_URL=http://localhost:5173
   ```

2. Restart server

### Game not updating

1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for WebSocket connection errors
4. Check Network tab for Socket.io requests
5. Verify both players are connected (should see green dot)

## 🎯 Next Steps

### Add Firebase (Optional)

See [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) for detailed instructions.

1. Create Firebase project
2. Get credentials
3. Add to server `.env`:
   ```env
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_PRIVATE_KEY="your-key"
   FIREBASE_CLIENT_EMAIL=your-email
   ```
4. Restart server

### Deploy to Production

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

**Quick Deploy Options**:
- **Render** (Easiest): Free tier, auto-deploy from GitHub
- **Vercel + Railway**: Best performance, generous free tier
- **Docker**: `docker-compose up -d` (see docker-compose.yml)

### Customize the Game

**Change Colors** (client/src/index.css):
```css
body {
  @apply bg-gradient-to-br from-green-900 via-blue-900 to-purple-900;
}
```

**Change Board Size** (would require logic changes):
- Edit `server/src/models/Game.js` - board size
- Edit `client/src/components/Board.jsx` - grid layout

**Add Sound Effects**:
```javascript
// In client/src/components/Game.jsx
const moveSound = new Audio('/sounds/move.mp3');
const winSound = new Audio('/sounds/win.mp3');

// Play on events
moveSound.play();
```

**Add Chat**:
- Add chat events to Socket.io handlers
- Create Chat component in client
- Emit/listen for chat messages

## 📚 Project Structure

```
tic-tac-toe/
├── server/           # Backend (Node.js + Socket.io)
├── client/           # Frontend (React + Vite)
├── README.md         # Full documentation
├── DEPLOYMENT.md     # Deployment guide
├── FIREBASE_SETUP.md # Firebase guide
└── QUICKSTART.md     # This file!
```

## 🎓 Learn More

- **Socket.io**: [socket.io/docs](https://socket.io/docs)
- **React**: [react.dev](https://react.dev)
- **Vite**: [vitejs.dev](https://vitejs.dev)
- **Tailwind CSS**: [tailwindcss.com](https://tailwindcss.com)
- **Firebase**: [firebase.google.com/docs](https://firebase.google.com/docs)

## ⚡ Development Tips

### Hot Reload

Both server and client support hot reload:
- **Server**: Uses nodemon - auto-restarts on file changes
- **Client**: Vite HMR - instant updates in browser

### Debug Mode

Add to server console logs:
```javascript
// server/src/handlers/socketHandlers.js
console.log('Debug:', { gameId, playerId, position });
```

Add to client console logs:
```javascript
// client/src/App.jsx
console.log('Debug:', { gameState, playerId, playerSymbol });
```

### Test Multiple Players

Use Chrome DevTools Device Mode:
1. Open DevTools (F12)
2. Click device icon (top-left)
3. Open multiple device windows
4. Each acts as separate player!

## 🎮 Game Features

- ✅ Real-time multiplayer
- ✅ Server-authoritative (no cheating!)
- ✅ Auto matchmaking
- ✅ Game ID sharing
- ✅ Beautiful UI
- ✅ Mobile responsive
- ✅ Toast notifications
- ✅ Live stats
- ✅ Connection status
- ✅ Disconnect handling
- ✅ Win detection
- ✅ Draw detection
- ✅ Turn indicators

## 💡 Pro Tips

1. **Test with Incognito Windows** - separate browser sessions
2. **Use Network Throttling** - test slow connections
3. **Check Mobile View** - responsive design
4. **Monitor Server Logs** - see all events
5. **Use React DevTools** - inspect component state

## 🆘 Still Having Issues?

1. Check all prerequisites are installed
2. Verify Node.js version: `node --version` (should be 16+)
3. Make sure ports 3001 and 5173 are free
4. Try restarting everything
5. Check for errors in console (server and browser)

## ✅ Success Checklist

- [ ] Server running on port 3001
- [ ] Client running on port 5173
- [ ] `/health` endpoint returns OK
- [ ] Browser shows "Connected" (green dot)
- [ ] Can create a game
- [ ] Can join a game
- [ ] Can make moves
- [ ] Game detects winner
- [ ] Can start new game

---

**Ready to deploy?** Check out [DEPLOYMENT.md](./DEPLOYMENT.md)

**Need persistence?** Check out [FIREBASE_SETUP.md](./FIREBASE_SETUP.md)

**Enjoy your game!** 🎮🎉

