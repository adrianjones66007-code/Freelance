# 🚀 QUICKSTART - Get Running in 5 Minutes

## Prerequisites

- Node.js v14+ installed ([Download](https://nodejs.org/))
- MongoDB running locally or [Atlas account](https://www.mongodb.com/cloud/atlas) (free)

## Option 1: Using Local MongoDB (Fastest)

### Step 1: Start MongoDB

```bash
# Windows - if installed
mongod

# Or using Docker (if Docker installed)
docker run -d -p 27017:27017 --name mongodb mongo

# Mac with Homebrew
brew services start mongodb-community
```

### Step 2: Setup Backend

```bash
cd freelance-marketplace/backend
npm install
npm start
```

✅ Backend running on http://localhost:5000

### Step 3: Setup Frontend

```bash
# In a new terminal
cd freelance-marketplace/frontend
npm install
npm start
```

✅ Frontend running on http://localhost:3000

### Step 4: Test It Out

1. Open http://localhost:3000 in browser
2. Click "Sign Up"
3. Create account (try both Client and Freelancer)
4. Login and explore!

---

## Option 2: Using MongoDB Atlas (Cloud)

### Step 1: Create MongoDB Cluster

1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up (free tier available)
3. Create a new cluster
4. Add Database User
5. Get connection string (looks like: `mongodb+srv://user:password@cluster0.mongodb.net/...`)

### Step 2: Update Backend .env

```env
MONGODB_URI=mongodb+srv://your_username:your_password@cluster0.mongodb.net/freelance_marketplace?retryWrites=true&w=majority
PORT=5000
JWT_SECRET=your-secret-key-here
JWT_EXPIRE=7d
```

### Step 3: Start Backend & Frontend (same as Option 1, Steps 2-4)

---

## Testing the Application

### Create a Test Account

1. Go to http://localhost:3000
2. Sign up with email (e.g., client@test.com)
3. Choose "Client"
4. Create another account for "Freelancer"

### As Client:

1. Click "Dashboard" → "Post New Project"
2. Fill in project details
3. Submit project
4. View incoming bids

### As Freelancer:

1. Browse Projects
2. Click on project
3. Submit a bid
4. Track bids in Dashboard

### Test Messaging:

1. Click "Find Freelancers"
2. View freelancer profile
3. Use "Messages" to communicate

---

## Common Issues

### "Port 5000 already in use"

```bash
# Kill process on port 5000
# Windows
netstat -ano | findstr :5000
taskkill /PID {PID} /F
```

### "Cannot connect to MongoDB"

- Check MongoDB is running: `mongosh` or `mongo`
- Verify connection string in `.env`
- For Atlas: Allow your IP in Network Access

### "CORS error"

- Backend and frontend both running?
- Backend port 5000, frontend port 3000?

### Authentication not working

```javascript
// Clear localStorage in browser console
localStorage.clear();
// Then login again
```

---

## Project Features to Try

✅ **Authentication** - Register and login with different accounts

✅ **Browse Projects** - Filter projects by category and budget

✅ **Post Project** - Create new project (as client)

✅ **Bidding** - Submit bids (as freelancer)

✅ **Messaging** - Chat between users

✅ **Reviews** - Leave ratings and reviews

✅ **Profiles** - View and edit user profiles

✅ **Dashboard** - Track your projects/bids

---

## File Structure

```
freelance-marketplace/
├── backend/
│   ├── models/          (Database schemas)
│   ├── routes/          (API endpoints)
│   ├── server.js        (Main server)
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/  (Reusable UI)
│   │   ├── pages/       (Full pages)
│   │   └── App.js       (Main app)
│   └── package.json
└── README.md            (Full docs)
```

---

## Next Steps

1. **Customize Colors** - Edit `frontend/src/index.css`
2. **Add More Features** - Check README.md for guides
3. **Deploy** - Use Vercel (frontend) + Heroku (backend)
4. **Setup Payment** - Integrate Stripe (ready in `.env`)

---

## Commands Reference

```bash
# Backend
cd backend
npm install           # Install dependencies
npm start             # Run server
npm run dev           # Run with auto-reload

# Frontend
cd frontend
npm install           # Install dependencies
npm start             # Run dev server
npm run build         # Build for production

# MongoDB
mongod                # Start MongoDB (local)
mongosh              # Connect to MongoDB CLI
```

---

## Architecture Overview

```
┌─────────────┐         ┌──────────────┐         ┌──────────────┐
│   Browser   │ ────────│   Frontend   │ ────────│   Backend    │
│  React App  │ HTTP    │  Port 3000   │ HTTP    │  Port 5000   │
└─────────────┘         └──────────────┘         └──────────────┘
                                                         │
                                                         │
                                                   ┌──────────────┐
                                                   │  MongoDB     │
                                                   │  Port 27017  │
                                                   └──────────────┘
```

---

## Support

- 📖 Check full documentation in README.md
- 🐛 Check backend/README.md for API details
- 🎨 Check frontend/README.md for component docs

---

**You're all set! Start building! 🎉**
