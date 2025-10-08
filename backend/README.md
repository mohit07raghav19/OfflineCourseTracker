# OfflineCourseTracker Backend

Backend server for OfflineCourseTracker application.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment:
```bash
cp .env.example .env
```

3. Start the server:

Development:
```bash
npm run dev
```

Production:
```bash
npm start
```

## API Endpoints

### Course Management
- `POST /api/course/load` - Load a course from directory
- `GET /api/course/:courseId` - Get course details
- `GET /api/course/:courseId/structure` - Get course structure

### Progress Management
- `GET /api/progress/:courseId` - Get progress data
- `POST /api/progress/:courseId` - Update file progress
- `POST /api/progress/:courseId/toggle` - Toggle completion status

### File Serving
- `GET /api/files/:courseId/*` - Serve course files

## Development

The server runs on port 3001 by default.
