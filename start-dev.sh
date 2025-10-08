#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  Offline Course Tracker - Development Startup${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════${NC}"
echo ""

# Check if node_modules exist
if [ ! -d "frontend/node_modules" ] || [ ! -d "backend/node_modules" ]; then
    echo -e "${YELLOW}📦 Installing dependencies...${NC}"
    npm run install:all
    echo ""
fi

echo -e "${GREEN}🚀 Starting servers...${NC}"
echo -e "${BLUE}   Frontend:${NC} http://localhost:5173"
echo -e "${BLUE}   Backend:${NC}  http://localhost:3000"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop both servers${NC}"
echo ""

# Start both servers
npm run dev
