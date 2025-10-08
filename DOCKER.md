# 🐳 Docker Setup Guide

## Quick Start with Docker

The easiest way to run the Offline Course Tracker is using Docker. This eliminates the need to install Node.js or manage dependencies manually.

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed
- Docker Compose (included with Docker Desktop)

### Running with Docker Compose

1. **Clone the repository**:

   ```bash
   git clone <repository-url>
   cd OfflineCourseTracker
   ```

2. **Start the application**:

   ```bash
   docker-compose up
   ```

   Or run in detached mode (background):

   ```bash
   docker-compose up -d
   ```

3. **Access the application**:

   - Frontend: http://localhost:5173
   - Backend: http://localhost:3000

4. **Stop the application**:

   ```bash
   docker-compose down
   ```

### Docker Commands Cheatsheet

```bash
# Start services
docker-compose up

# Start in background
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs

# View logs for specific service
docker-compose logs frontend
docker-compose logs backend

# Rebuild containers (after code changes)
docker-compose up --build

# Remove all containers and volumes
docker-compose down -v

# Restart a specific service
docker-compose restart frontend
docker-compose restart backend
```

### Development with Docker

The Docker setup includes hot-reload for both frontend and backend:

- **Frontend**: Vite dev server with HMR (Hot Module Replacement)
- **Backend**: Nodemon for automatic server restart

Changes to your code will automatically reflect in the running containers.

### Building for Production

To build optimized production images:

1. **Create production Dockerfile** (optional - for deployment):

   ```dockerfile
   # Frontend Production
   FROM node:18-alpine AS build
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --only=production
   COPY . .
   RUN npm run build

   FROM nginx:alpine
   COPY --from=build /app/dist /usr/share/nginx/html
   EXPOSE 80
   CMD ["nginx", "-g", "daemon off;"]
   ```

2. **Build production image**:

   ```bash
   docker build -t course-tracker-frontend:prod ./frontend
   ```

### Troubleshooting

**Port already in use**:

```bash
# Change ports in docker-compose.yml
ports:
  - "5174:5173"  # Use different host port
```

**Containers not starting**:

```bash
# Check logs
docker-compose logs

# Rebuild from scratch
docker-compose down -v
docker-compose build --no-cache
docker-compose up
```

**Changes not reflecting**:

```bash
# Restart services
docker-compose restart

# Or rebuild
docker-compose up --build
```

**Permission issues**:

```bash
# Fix ownership (Linux/macOS)
sudo chown -R $USER:$USER .
```

### Docker vs Local Development

| Feature     | Docker                          | Local                           |
| ----------- | ------------------------------- | ------------------------------- |
| Setup Time  | Fast (no Node.js install)       | Slower (install Node.js + deps) |
| Isolation   | Complete isolation              | Shares system resources         |
| Consistency | Same on all machines            | May vary by system              |
| Hot Reload  | ✅ Yes                          | ✅ Yes                          |
| Performance | Slightly slower on some systems | Native performance              |
| Sharing     | Easy (docker-compose.yml)       | Need setup instructions         |

### Recommended Approach

**For Development**:

- Use **Local** if you already have Node.js installed
- Use **Docker** for consistent team environments

**For Sharing**:

- Always use **Docker** - recipient just needs Docker Desktop

**For Production**:

- Use **Docker** with optimized production images

## Environment Variables

Create `.env` files if needed:

**Frontend** (`frontend/.env`):

```env
VITE_API_URL=http://localhost:3000
```

**Backend** (`backend/.env`):

```env
NODE_ENV=development
PORT=3000
```

These are automatically loaded by Docker Compose.

## Next Steps

Once running, see the [main README](README.md) for:

- Loading courses
- Keyboard shortcuts
- Feature documentation
