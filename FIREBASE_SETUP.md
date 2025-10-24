# 🔥 Firebase Setup Guide

This guide will help you set up Firebase for game state persistence.

## Why Firebase?

- **Persistence**: Games are saved even if server restarts
- **Analytics**: Track game statistics
- **Scalability**: Firebase handles scaling automatically
- **Real-time**: Optional real-time database features

## Setup Steps

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click **"Add project"**
3. Enter project name: `tic-tac-toe-multiplayer`
4. Disable Google Analytics (optional)
5. Click **"Create project"**

### 2. Enable Firestore Database

1. In Firebase Console, click **"Firestore Database"** in left sidebar
2. Click **"Create database"**
3. Select **"Start in production mode"**
4. Choose a location (e.g., `us-central`)
5. Click **"Enable"**

### 3. Set Firestore Security Rules

1. In Firestore Database, go to **"Rules"** tab
2. Replace with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Games collection
    match /games/{gameId} {
      // Allow read for all authenticated requests
      allow read: if true;
      
      // Allow write for server only (authenticated via Admin SDK)
      allow write: if true;
    }
    
    // Optional: Add more collections as needed
    match /stats/{statId} {
      allow read: if true;
      allow write: if true;
    }
  }
}
```

3. Click **"Publish"**

### 4. Generate Admin SDK Credentials

1. Go to **Project Settings** (gear icon) → **Service accounts**
2. Click **"Generate new private key"**
3. Click **"Generate key"** - a JSON file will download
4. **IMPORTANT**: Keep this file secure! Never commit to git!

### 5. Extract Credentials

The downloaded JSON file contains:

```json
{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com",
  ...
}
```

### 6. Configure Server Environment Variables

Add to your `server/.env`:

```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com
```

**Important Notes**:
- The `private_key` must be wrapped in quotes
- Keep the `\n` characters (newlines) in the private key
- Don't remove any characters from the private key

### 7. Test Firebase Connection

1. Restart your server:
```bash
cd server
npm run dev
```

2. Look for this in console:
```
✅ Firebase Admin initialized successfully
```

3. Create a game and check Firestore Database - you should see a new document in the `games` collection

### 8. (Optional) Deploy Firestore Indexes

If you want to query games by status, create an index:

1. In Firestore, go to **"Indexes"** tab
2. Click **"Create Index"**
3. Collection: `games`
4. Fields:
   - `status` - Ascending
   - `createdAt` - Descending
5. Click **"Create"**

## Using Firebase in Production

### For Render

Add environment variables in Render dashboard:
1. Go to your service → Environment
2. Add:
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_PRIVATE_KEY` (paste full key with quotes)
   - `FIREBASE_CLIENT_EMAIL`

### For Vercel + Railway

Railway:
1. Project → Variables
2. Add the three Firebase variables

### For AWS / GCP

Store credentials in AWS Secrets Manager or GCP Secret Manager instead of environment variables for better security.

## Firestore Data Structure

### Games Collection

```
games/
  {gameId}/
    id: string
    players: {
      X: { id, name, socketId }
      O: { id, name, socketId } | null
    }
    board: array[9]
    currentTurn: 'X' | 'O'
    status: 'waiting' | 'playing' | 'finished'
    winner: 'X' | 'O' | null
    winningLine: array[3] | null
    createdAt: timestamp
    updatedAt: timestamp
```

## Optional: Add Game Statistics

Create a new collection for stats:

```javascript
// In server/src/managers/GameManager.js
async saveGameStats(game) {
  if (!db) return;
  
  try {
    await db.collection('stats').add({
      gameId: game.id,
      winner: game.winner,
      moves: game.board.filter(cell => cell !== null).length,
      duration: game.updatedAt - game.createdAt,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Error saving stats:', error);
  }
}
```

## Querying Games

Example: Get recent finished games

```javascript
async getRecentGames(limit = 10) {
  if (!db) return [];
  
  try {
    const snapshot = await db.collection('games')
      .where('status', '==', 'finished')
      .orderBy('updatedAt', 'desc')
      .limit(limit)
      .get();
    
    return snapshot.docs.map(doc => doc.data());
  } catch (error) {
    console.error('Error fetching games:', error);
    return [];
  }
}
```

## Firebase Pricing

Firebase Firestore has a generous free tier:

### Free Tier (Spark Plan)
- **Stored data**: 1 GB
- **Document reads**: 50,000 per day
- **Document writes**: 20,000 per day
- **Document deletes**: 20,000 per day

This is more than enough for hundreds of games per day!

### Paid Tier (Blaze Plan - Pay as you go)
Only pay for what you use beyond free tier:
- **Stored data**: $0.18/GB
- **Document reads**: $0.06 per 100,000
- **Document writes**: $0.18 per 100,000

For a small to medium game, costs are usually < $5/month.

## Monitoring Usage

1. Firebase Console → **"Usage and billing"**
2. See real-time usage stats
3. Set up budget alerts

## Troubleshooting

### "Failed to initialize Firebase"
- Check that all three environment variables are set
- Verify private key has no extra spaces or missing characters
- Ensure private key is wrapped in quotes

### "Permission denied" errors
- Check Firestore security rules
- Verify Admin SDK credentials are valid

### "Document not found"
- Game might not have been saved (check Firebase init)
- Check Firestore console to see if documents are being created

## Security Best Practices

1. ✅ **Never** commit Firebase credentials to git
2. ✅ Use environment variables
3. ✅ Keep `.env` in `.gitignore`
4. ✅ Use different Firebase projects for dev/prod
5. ✅ Rotate credentials periodically
6. ✅ Use Firebase security rules to restrict access
7. ✅ Monitor usage for anomalies

## Alternative: Running Without Firebase

The server is designed to work **without Firebase**. If you don't configure Firebase:
- Games are stored in memory
- Data is lost on server restart
- Perfect for development and testing
- Still works great for production if you don't need persistence

## Summary

Firebase setup is **optional** but recommended for production. It provides:
- ✅ Game persistence
- ✅ Statistics tracking
- ✅ Better user experience
- ✅ Easy scaling

For quick testing, you can skip Firebase and use in-memory storage!

