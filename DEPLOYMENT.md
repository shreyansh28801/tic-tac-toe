# 🚀 Detailed Deployment Guide

This guide covers multiple deployment options for your Tic-Tac-Toe multiplayer game.

## Table of Contents
1. [Render Deployment (Easiest)](#1-render-deployment)
2. [Vercel + Railway](#2-vercel--railway)
3. [AWS Deployment](#3-aws-deployment)
4. [Google Cloud Platform](#4-google-cloud-platform)
5. [Docker Deployment](#5-docker-deployment)
6. [Custom VPS](#6-custom-vps)

---

## 1. Render Deployment (Easiest) ⭐

Render offers free tier and is the easiest option for beginners.

### Step 1: Prepare Your Repository

1. Push your code to GitHub:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <your-github-repo-url>
git push -u origin main
```

### Step 2: Deploy Server

1. Go to [render.com](https://render.com) and sign up
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure:
   - **Name**: `tic-tac-toe-server`
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

5. Add Environment Variables:
   - Click **"Environment"** tab
   - Add:
     ```
     NODE_ENV=production
     PORT=3001
     CLIENT_URL=https://your-client-app.onrender.com
     ```
   - Optional Firebase vars (if using Firebase):
     ```
     FIREBASE_PROJECT_ID=your-project-id
     FIREBASE_PRIVATE_KEY=your-private-key
     FIREBASE_CLIENT_EMAIL=your-client-email
     ```

6. Click **"Create Web Service"**
7. Wait for deployment (5-10 minutes)
8. Note your server URL: `https://tic-tac-toe-server.onrender.com`

### Step 3: Deploy Client

1. Click **"New +"** → **"Static Site"**
2. Connect your GitHub repository
3. Configure:
   - **Name**: `tic-tac-toe-client`
   - **Root Directory**: `client`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`

4. Add Environment Variable:
   - Click **"Environment"** tab
   - Add:
     ```
     VITE_SERVER_URL=https://tic-tac-toe-server.onrender.com
     ```

5. Click **"Create Static Site"**
6. Wait for deployment
7. Your app is live! 🎉

### Step 4: Update CORS

1. Go back to your server on Render
2. Update `CLIENT_URL` environment variable with your actual client URL
3. Trigger manual deploy or wait for auto-redeploy

### Notes on Render Free Tier
- ✅ Free for both frontend and backend
- ⚠️ Server spins down after 15 minutes of inactivity
- ⚠️ First request after spin-down takes 30-60 seconds
- 💡 Upgrade to paid plan ($7/month) for always-on servers

---

## 2. Vercel + Railway

Vercel for frontend (best React hosting), Railway for backend.

### Deploy Backend on Railway

1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Click **"New Project"** → **"Deploy from GitHub repo"**
4. Select your repository
5. Click **"Add variables"** and add:
   ```
   NODE_ENV=production
   PORT=3001
   CLIENT_URL=https://your-vercel-app.vercel.app
   ```
6. Railway auto-detects Node.js and deploys
7. Go to **Settings** → **Generate Domain** to get your URL
8. Note the URL: `https://your-app.railway.app`

### Deploy Frontend on Vercel

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Navigate to client directory:
```bash
cd client
```

3. Deploy:
```bash
vercel
```

4. Follow prompts:
   - **Set up and deploy?** Yes
   - **Scope**: Your account
   - **Link to existing project?** No
   - **Project name**: tic-tac-toe
   - **Directory**: `./` (current directory)
   - **Override settings?** Yes
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

5. Set environment variable:
```bash
vercel env add VITE_SERVER_URL
# Enter: https://your-app.railway.app
```

6. Redeploy with env variable:
```bash
vercel --prod
```

7. Your app is live at `https://your-app.vercel.app`

### Update Backend CORS

Go back to Railway and update `CLIENT_URL` to your Vercel URL.

---

## 3. AWS Deployment

### Deploy Backend on AWS Elastic Beanstalk

1. Install AWS CLI and EB CLI:
```bash
pip install awscli awsebcli
aws configure
```

2. Navigate to server directory:
```bash
cd server
```

3. Initialize Elastic Beanstalk:
```bash
eb init
# Select region
# Select Node.js platform
# Set up SSH: Yes
```

4. Create environment:
```bash
eb create tic-tac-toe-server-env
```

5. Set environment variables:
```bash
eb setenv NODE_ENV=production PORT=3001 CLIENT_URL=https://your-s3-bucket.s3-website.amazonaws.com
```

6. Deploy:
```bash
eb deploy
```

7. Open app:
```bash
eb open
```

### Deploy Frontend on AWS S3 + CloudFront

1. Build client:
```bash
cd client
npm run build
```

2. Create S3 bucket:
```bash
aws s3 mb s3://tic-tac-toe-client
```

3. Configure bucket for static website hosting:
```bash
aws s3 website s3://tic-tac-toe-client --index-document index.html --error-document index.html
```

4. Set bucket policy (make public):
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::tic-tac-toe-client/*"
    }
  ]
}
```

5. Upload build:
```bash
aws s3 sync dist/ s3://tic-tac-toe-client
```

6. Get website URL:
```bash
aws s3 website s3://tic-tac-toe-client
```

---

## 4. Google Cloud Platform

### Deploy Backend on Cloud Run

1. Install gcloud CLI

2. Build Docker image:
```bash
cd server
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/tic-tac-toe-server
```

3. Deploy to Cloud Run:
```bash
gcloud run deploy tic-tac-toe-server \
  --image gcr.io/YOUR_PROJECT_ID/tic-tac-toe-server \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

4. Set environment variables:
```bash
gcloud run services update tic-tac-toe-server \
  --set-env-vars NODE_ENV=production,CLIENT_URL=https://your-firebase-app.web.app
```

### Deploy Frontend on Firebase Hosting

1. Install Firebase CLI:
```bash
npm install -g firebase-tools
firebase login
```

2. Initialize Firebase:
```bash
cd client
firebase init hosting
# Select existing project
# Public directory: dist
# Single-page app: Yes
# GitHub actions: No
```

3. Build and deploy:
```bash
npm run build
firebase deploy
```

4. Your app is live at `https://your-project.web.app`

---

## 5. Docker Deployment

### Create Dockerfiles

**Server Dockerfile** (`server/Dockerfile`):
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3001

CMD ["node", "src/index.js"]
```

**Client Dockerfile** (`client/Dockerfile`):
```dockerfile
FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

**Client nginx.conf** (`client/nginx.conf`):
```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### Docker Compose

Create `docker-compose.yml`:
```yaml
version: '3.8'

services:
  server:
    build: ./server
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - PORT=3001
      - CLIENT_URL=http://localhost:80
    restart: unless-stopped

  client:
    build: ./client
    ports:
      - "80:80"
    environment:
      - VITE_SERVER_URL=http://localhost:3001
    depends_on:
      - server
    restart: unless-stopped
```

### Run with Docker Compose

```bash
docker-compose up -d
```

### Deploy Docker to DigitalOcean

1. Create DigitalOcean account
2. Install doctl CLI
3. Push images to registry:
```bash
docker tag server registry.digitalocean.com/your-registry/server
docker tag client registry.digitalocean.com/your-registry/client
docker push registry.digitalocean.com/your-registry/server
docker push registry.digitalocean.com/your-registry/client
```

4. Create App on DigitalOcean App Platform using Docker images

---

## 6. Custom VPS (Ubuntu)

### Setup VPS (DigitalOcean, Linode, etc.)

1. Create Ubuntu 22.04 server

2. SSH into server:
```bash
ssh root@your-server-ip
```

3. Install Node.js:
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
```

4. Install Nginx:
```bash
sudo apt update
sudo apt install nginx
```

5. Install PM2:
```bash
sudo npm install -g pm2
```

### Deploy Backend

1. Clone repository:
```bash
cd /var/www
git clone <your-repo-url>
cd tic-tac-toe/server
npm install
```

2. Create `.env` file with production variables

3. Start with PM2:
```bash
pm2 start src/index.js --name tic-tac-toe-server
pm2 save
pm2 startup
```

### Deploy Frontend

1. Build client:
```bash
cd /var/www/tic-tac-toe/client
npm install
npm run build
```

2. Configure Nginx:
```bash
sudo nano /etc/nginx/sites-available/tic-tac-toe
```

Add:
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/tic-tac-toe/client/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /socket.io {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}
```

3. Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/tic-tac-toe /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

4. Setup SSL with Let's Encrypt:
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

## Environment Variables Summary

### Server
```env
NODE_ENV=production
PORT=3001
CLIENT_URL=https://your-client-url
FIREBASE_PROJECT_ID=optional
FIREBASE_PRIVATE_KEY=optional
FIREBASE_CLIENT_EMAIL=optional
```

### Client
```env
VITE_SERVER_URL=https://your-server-url
```

---

## Testing Deployment

1. Check server health:
```bash
curl https://your-server-url/health
```

2. Check WebSocket connection:
- Open browser console on client
- Look for "Connected to server" message

3. Test gameplay:
- Open two browser windows
- Create game in one, join in other
- Play a full game

---

## Monitoring & Maintenance

### Logs

**Render**: Built-in logs in dashboard

**Vercel**: `vercel logs`

**Railway**: Built-in logs in dashboard

**PM2**: `pm2 logs tic-tac-toe-server`

### Uptime Monitoring

Use services like:
- [UptimeRobot](https://uptimerobot.com) (Free)
- [Pingdom](https://www.pingdom.com)
- [StatusCake](https://www.statuscake.com)

---

## Cost Comparison

| Platform | Backend | Frontend | Total/Month | Notes |
|----------|---------|----------|-------------|-------|
| Render | Free/$7 | Free | $0-$7 | Best for beginners |
| Vercel + Railway | $5 | Free | $5 | Great performance |
| AWS | $10-20 | $1-5 | $11-25 | Most scalable |
| GCP | $10-15 | Free | $10-15 | Good integration |
| DigitalOcean | $5-12 | $0 | $5-12 | Simple VPS |
| Custom VPS | $5-10 | $0 | $5-10 | Full control |

---

## Troubleshooting Deployment

### CORS Errors
- Verify `CLIENT_URL` on server matches client URL
- Check if server allows client origin in CORS config

### WebSocket Connection Failed
- Ensure server supports WebSocket upgrades
- Check firewall/security group allows port 3001
- Verify Socket.io client points to correct server URL

### Build Failures
- Check Node.js version compatibility
- Verify all dependencies are in package.json
- Clear cache and rebuild

### 502 Bad Gateway
- Server not running or crashed
- Check server logs
- Verify server is listening on correct port

---

## Need Help?

- Check server logs first
- Test locally with production env vars
- Verify all environment variables are set correctly
- Check platform-specific documentation

---

**Recommendation**: Start with **Render** (easiest) or **Vercel + Railway** (best performance).

