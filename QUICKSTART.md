# 🚀 Quick Start Guide

## Running the Application

You have **3 simple ways** to start both frontend and backend servers:

### Option 1: Using the Startup Script (Recommended)

**macOS/Linux:**

```bash
./start-dev.sh
```

**Windows:**

```cmd
start-dev.bat
```

### Option 2: Using npm (All Platforms)

From the root directory:

```bash
npm start
```

or

```bash
npm run dev
```

### Option 3: Manual Start (Separate Terminals)

**Terminal 1 - Frontend:**

```bash
cd frontend
npm run dev
```

**Terminal 2 - Backend:**

```bash
cd backend
npm run dev
```

## First Time Setup

If you haven't installed dependencies yet:

```bash
npm run install:all
```

This will install dependencies for both frontend and backend.

## Available Scripts

From the root directory:

- `npm start` or `npm run dev` - Start both servers
- `npm run dev:frontend` - Start only frontend
- `npm run dev:backend` - Start only backend
- `npm run install:all` - Install all dependencies
- `npm run build` - Build frontend for production

## Server URLs

- **Frontend:** http://localhost:5173
- **Backend:** http://localhost:3000

## Stopping the Servers

Press `Ctrl+C` in the terminal to stop both servers.

## Troubleshooting

**Port already in use?**

- Frontend (5173): Check if another Vite dev server is running
- Backend (3000): Check if another Node.js server is running

**Dependencies issues?**

```bash
# Clean install
rm -rf frontend/node_modules backend/node_modules
npm run install:all
```

**Script permission denied (macOS/Linux)?**

```bash
chmod +x start-dev.sh
```
