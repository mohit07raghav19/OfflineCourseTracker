# OfflineCourseTracker - Implementation Plan

**Version:** 1.0  
**Last Updated:** October 8, 2025

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Technical Architecture](#technical-architecture)
3. [Implementation Phases](#implementation-phases)
4. [Detailed Milestones](#detailed-milestones)
5. [Technology Stack](#technology-stack)
6. [File Structure](#file-structure)
7. [API Endpoints](#api-endpoints)
8. [Data Models](#data-models)
9. [UI/UX Design](#uiux-design)
10. [Open Questions](#open-questions)
11. [Risk Assessment](#risk-assessment)

---

## 📖 Project Overview

### Goal

Create a fully offline web application that allows users to track progress through locally downloaded courses containing videos, PDFs, markdown, HTML, and text files.

### Core Principles

- **Offline-First**: Must work without internet connection
- **No Database**: Use local file system for storage
- **Zero Configuration**: Should work out of the box
- **Privacy**: All data stays on user's machine
- **Performance**: Fast loading and smooth interactions

---

## 🏗️ Technical Architecture

### Architecture Pattern

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Sidebar    │  │   Content    │  │    Video     │  │
│  │  Component   │  │    Viewer    │  │    Player    │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│         │                  │                  │          │
│         └──────────────────┴──────────────────┘          │
│                           │                              │
│                  ┌────────▼────────┐                     │
│                  │  State Manager  │                     │
│                  │ (Context/Redux) │                     │
│                  └────────┬────────┘                     │
│                           │                              │
│                  ┌────────▼────────┐                     │
│                  │  API Service    │                     │
│                  └────────┬────────┘                     │
└───────────────────────────┼──────────────────────────────┘
                            │ HTTP/REST
┌───────────────────────────▼──────────────────────────────┐
│              Backend (Node.js/Express)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Course     │  │   Progress   │  │     File     │  │
│  │   Routes     │  │    Routes    │  │   Serving    │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│         │                  │                  │          │
│         └──────────────────┴──────────────────┘          │
│                           │                              │
│                  ┌────────▼────────┐                     │
│                  │  File System    │                     │
│                  │    Service      │                     │
│                  └────────┬────────┘                     │
└───────────────────────────┼──────────────────────────────┘
                            │
                  ┌─────────▼──────────┐
                  │  Local File System │
                  │  (Course Folders)  │
                  └────────────────────┘
```

### Data Flow

1. **Course Loading**

   ```
   User selects folder → Frontend sends path → Backend scans directory →
   Returns file tree → Frontend renders sidebar → Loads first file
   ```

2. **Progress Tracking**

   ```
   User interacts with content → Frontend tracks progress →
   Sends update to backend → Backend writes to .course-progress.json →
   Returns confirmation → Frontend updates UI
   ```

3. **File Rendering**
   ```
   User clicks file → Frontend requests file → Backend serves file →
   Frontend determines file type → Renders in appropriate viewer
   ```

---

## 🎯 Implementation Phases

### Phase 1: Project Setup & Foundation (Days 1-2)

- Initialize project structure
- Set up development environment
- Configure build tools
- Implement basic routing

### Phase 2: Backend Core (Days 3-4)

- File system scanning
- API endpoints
- Progress storage
- File serving

### Phase 3: Frontend Core (Days 5-7)

- Dashboard layout
- Sidebar component
- Basic navigation
- State management

### Phase 4: File Viewers (Days 8-10)

- Video player
- PDF viewer
- Markdown renderer
- HTML/Text viewer

### Phase 5: Progress Tracking (Days 11-12)

- Progress calculation logic
- Auto-complete detection
- Manual override functionality
- Progress persistence

### Phase 6: UI/UX Polish (Days 13-14)

- Dark theme implementation
- Responsive design
- Animations & transitions
- Keyboard shortcuts

### Phase 7: Testing & Optimization (Days 15-16)

- Cross-browser testing
- Performance optimization
- Bug fixes
- Documentation updates

---

## 📊 Detailed Milestones

### Milestone 1: Project Bootstrap

**Duration:** 1 day  
**Status:** Pending

#### Tasks

- [ ] Create project folder structure
- [ ] Initialize frontend (React with Vite/CRA)
- [ ] Initialize backend (Node.js/Express)
- [ ] Set up package.json files
- [ ] Configure ESLint and Prettier
- [ ] Create .gitignore files
- [ ] Set up environment variables

#### Deliverables

- Working dev servers (frontend on :3000, backend on :3001)
- Basic "Hello World" displays

---

### Milestone 2: Backend File System Service

**Duration:** 2 days  
**Status:** Pending

#### Tasks

- [ ] Create file system scanner utility
  - Recursively read directory structure
  - Filter supported file types
  - Sort files alphanumerically
  - Handle errors gracefully
- [ ] Implement course loading endpoint
  - Accept folder path
  - Return structured file tree
  - Include file metadata (size, modified date)
- [ ] Implement file serving endpoint
  - Serve static files securely
  - Handle range requests (for video seeking)
  - Set appropriate MIME types
- [ ] Create progress management service
  - Read .course-progress.json
  - Write progress updates atomically
  - Handle concurrent access
  - Create file if doesn't exist

#### Deliverables

- API endpoints:
  - `POST /api/course/load` - Load course from path
  - `GET /api/course/:courseId/structure` - Get file tree
  - `GET /api/files/*` - Serve course files
  - `GET /api/progress/:courseId` - Get progress
  - `POST /api/progress/:courseId` - Update progress

#### Technical Considerations

```javascript
// File tree structure
{
  "id": "unique-course-id",
  "name": "Course Name",
  "path": "/absolute/path/to/course",
  "files": [
    {
      "id": "file-1",
      "name": "01-Introduction.mp4",
      "type": "video",
      "path": "01-Introduction.mp4",
      "size": 1024000,
      "modifiedDate": "2025-01-01T00:00:00Z"
    }
  ],
  "folders": [
    {
      "name": "Section 1",
      "files": [],
      "folders": []
    }
  ]
}
```

---

### Milestone 3: Frontend State Management

**Duration:** 1 day  
**Status:** Pending

#### Tasks

- [ ] Set up React Context or Redux
- [ ] Create state slices:
  - Course state (loaded course data)
  - UI state (sidebar open/closed, current file)
  - Progress state (completion data)
  - Player state (video position, volume, etc.)
- [ ] Implement actions and reducers
- [ ] Create custom hooks for state access
  - `useCourse()`
  - `useProgress()`
  - `useCurrentFile()`

#### State Structure

```javascript
{
  course: {
    loaded: false,
    data: null,
    error: null
  },
  progress: {
    courseId: null,
    data: {},
    lastSaved: null
  },
  ui: {
    sidebarOpen: true,
    currentFileId: null,
    viewMode: 'normal' // normal, cinema, fullscreen
  },
  player: {
    playing: false,
    currentTime: 0,
    duration: 0,
    volume: 1,
    muted: false
  }
}
```

---

### Milestone 4: Dashboard Layout & Sidebar

**Duration:** 2 days  
**Status:** Pending

#### Tasks

- [ ] Create main Dashboard component
- [ ] Implement Sidebar component
  - Collapsible folder structure
  - File type icons (SVG from Flowbite)
  - Completion indicators (checkmarks)
  - Progress bars for sections
  - Smooth animations
- [ ] Implement course loader UI
  - Folder picker button
  - Loading states
  - Error handling
- [ ] Create responsive layout
  - Mobile: Collapsible sidebar
  - Tablet: Side-by-side with toggle
  - Desktop: Fixed sidebar + content area

#### Component Structure

```
<Dashboard>
  <Sidebar>
    <CourseHeader />
    <ProgressOverview />
    <FileTree>
      <Folder>
        <FileItem />
      </Folder>
    </FileTree>
  </Sidebar>

  <ContentArea>
    <ContentViewer />
  </ContentArea>
</Dashboard>
```

#### Sidebar Features

- Recursive folder rendering
- Smooth expand/collapse animations
- Active file highlighting
- Hover states
- Click to navigate
- Right-click context menu (mark complete/incomplete)

---

### Milestone 5: Video Player Component

**Duration:** 2 days  
**Status:** Pending

#### Tasks

- [ ] Create custom video player
  - Use HTML5 `<video>` element
  - Custom controls overlay
  - Progress bar with seek functionality
  - Volume control with slider
  - Play/pause toggle
  - Display mode buttons
- [ ] Implement keyboard shortcuts
  - Space: Play/Pause
  - Arrow keys: Seek & Volume
  - F: Fullscreen
  - M: Mute
  - C: Cinema mode
- [ ] Add playback features
  - Time display (current/total)
  - Buffer indicator
  - Loading spinner
  - Error handling
- [ ] Implement progress tracking
  - Track current time
  - Auto-mark complete at 90%
  - Save position every 5 seconds
  - Resume from last position

#### Player UI Components

```
<VideoPlayer>
  <video ref={videoRef} />

  <Controls visible={showControls}>
    <ProgressBar />
    <TimeDisplay />
    <PlayPauseButton />
    <VolumeControl />
    <DisplayModeButtons />
    <FullscreenButton />
  </Controls>

  <LoadingSpinner />
  <ErrorMessage />
</VideoPlayer>
```

#### Progress Tracking Logic

```javascript
// Track every 5 seconds
useEffect(() => {
  const interval = setInterval(() => {
    if (isPlaying) {
      saveProgress(currentTime, duration);

      // Auto-complete at 90%
      if (currentTime / duration >= 0.9) {
        markAsComplete();
      }
    }
  }, 5000);

  return () => clearInterval(interval);
}, [isPlaying, currentTime, duration]);
```

---

### Milestone 6: Document Viewers

**Duration:** 2 days  
**Status:** Pending

#### Tasks

- [ ] PDF Viewer
  - Integrate PDF.js
  - Render all pages
  - Scroll detection for progress
  - Zoom controls
  - Page navigation
- [ ] Markdown Viewer
  - Integrate marked.js or react-markdown
  - Syntax highlighting for code blocks
  - Custom styling for dark theme
  - Scroll detection
- [ ] HTML Viewer
  - Render in iframe or sandboxed div
  - Style injection for dark theme
  - Scroll detection
- [ ] Text Viewer
  - Simple scrollable text area
  - Monospace font option
  - Line numbers (optional)
  - Scroll detection

#### Scroll Detection Logic

```javascript
const handleScroll = (e) => {
  const element = e.target;
  const scrollHeight = element.scrollHeight;
  const scrollTop = element.scrollTop;
  const clientHeight = element.clientHeight;

  const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;

  // Mark complete when scrolled to bottom (>95%)
  if (scrollPercentage > 0.95 && !isComplete) {
    markAsComplete();
  }
};
```

---

### Milestone 7: Progress Tracking System

**Duration:** 1.5 days  
**Status:** Pending

#### Tasks

- [ ] Implement progress calculation
  - Per-file completion status
  - Folder/section progress percentages
  - Overall course progress
- [ ] Create progress indicators
  - Checkmarks for completed items
  - Progress bars for folders
  - Overall progress in header
- [ ] Manual override functionality
  - Toggle completion status
  - Update UI immediately
  - Persist to backend
- [ ] Auto-navigation
  - Detect completion
  - Load next file automatically
  - Show "Course Complete" message at end

#### Progress Calculation

```javascript
const calculateProgress = (fileTree, progressData) => {
  let totalFiles = 0;
  let completedFiles = 0;

  const traverse = (node) => {
    if (node.files) {
      totalFiles += node.files.length;
      completedFiles += node.files.filter(
        (f) => progressData[f.path]?.completed
      ).length;
    }

    if (node.folders) {
      node.folders.forEach(traverse);
    }
  };

  traverse(fileTree);

  return {
    total: totalFiles,
    completed: completedFiles,
    percentage: (completedFiles / totalFiles) * 100,
  };
};
```

---

### Milestone 8: Dark Theme & Styling

**Duration:** 1.5 days  
**Status:** Pending

#### Tasks

- [ ] Create design tokens
  - Color palette
  - Typography scale
  - Spacing system
  - Border radius values
  - Shadow definitions
- [ ] Implement global styles
  - CSS reset
  - Base typography
  - Scrollbar styling
  - Focus states
- [ ] Style all components
  - Consistent padding/margins
  - Hover effects
  - Active states
  - Transitions
- [ ] Add SVG icons
  - Download from Flowbite
  - Create icon components
  - Ensure proper sizing

#### Design Tokens

```css
:root {
  /* Colors */
  --color-bg-primary: #1a1a1a;
  --color-bg-secondary: #2d2d2d;
  --color-bg-tertiary: #3d3d3d;
  --color-text-primary: #ffffff;
  --color-text-secondary: #b0b0b0;
  --color-accent: #3b82f6;
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-error: #ef4444;

  /* Typography */
  --font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    sans-serif;
  --font-size-xs: 0.75rem;
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;
  --font-size-2xl: 1.5rem;

  /* Spacing */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;

  /* Borders */
  --border-radius-sm: 0.25rem;
  --border-radius-md: 0.5rem;
  --border-radius-lg: 0.75rem;

  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.3);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.3);
}
```

---

### Milestone 9: Responsive Design

**Duration:** 1 day  
**Status:** Pending

#### Tasks

- [ ] Mobile layout (< 768px)
  - Hamburger menu for sidebar
  - Full-width content
  - Touch-optimized controls
  - Vertical video player controls
- [ ] Tablet layout (768px - 1024px)
  - Collapsible sidebar
  - Optimized spacing
  - Touch-friendly buttons
- [ ] Desktop layout (> 1024px)
  - Fixed sidebar
  - Cinema mode support
  - Mouse-optimized controls

#### Breakpoints

```css
/* Mobile */
@media (max-width: 767px) {
}

/* Tablet */
@media (min-width: 768px) and (max-width: 1023px) {
}

/* Desktop */
@media (min-width: 1024px) {
}

/* Large Desktop */
@media (min-width: 1440px) {
}
```

---

### Milestone 10: Testing & Bug Fixes

**Duration:** 1 day  
**Status:** Pending

#### Tasks

- [ ] Cross-browser testing
  - Chrome
  - Firefox
  - Safari
  - Edge
- [ ] Device testing
  - Desktop
  - Tablet
  - Mobile
- [ ] Edge case testing
  - Very large courses (1000+ files)
  - Large video files (2GB+)
  - Special characters in filenames
  - Deep folder nesting
  - Empty folders
  - Corrupted progress files
- [ ] Performance testing
  - Initial load time
  - File switching speed
  - Memory usage
  - Scroll performance

---

### Milestone 11: Documentation & Polish

**Duration:** 0.5 days  
**Status:** Pending

#### Tasks

- [ ] Update README.md with final instructions
- [ ] Add code comments
- [ ] Create user guide with screenshots
- [ ] Document known limitations
- [ ] Add troubleshooting section

---

## 🛠️ Technology Stack

### Frontend

| Purpose                 | Technology        | Rationale                                             |
| ----------------------- | ----------------- | ----------------------------------------------------- |
| **Framework**           | React 18          | Component-based, efficient rendering, large ecosystem |
| **Build Tool**          | Vite              | Fast dev server, optimized builds                     |
| **State Management**    | React Context API | Built-in, sufficient for app complexity               |
| **Routing**             | React Router v6   | Industry standard, declarative routing                |
| **Styling**             | CSS Modules       | Scoped styles, no runtime overhead                    |
| **PDF Rendering**       | PDF.js            | Mozilla's library, reliable                           |
| **Markdown Parsing**    | marked.js         | Fast, lightweight, extensible                         |
| **Syntax Highlighting** | highlight.js      | For code blocks in markdown                           |
| **Icons**               | Inline SVG        | From Flowbite, no extra dependency                    |

### Backend

| Purpose           | Technology   | Rationale                               |
| ----------------- | ------------ | --------------------------------------- |
| **Runtime**       | Node.js 16+  | JavaScript throughout, mature ecosystem |
| **Framework**     | Express.js   | Minimal, flexible, well-documented      |
| **CORS**          | cors package | Handle cross-origin requests            |
| **File System**   | fs-extra     | Enhanced fs methods with promises       |
| **Path Handling** | path module  | Cross-platform path operations          |
| **Security**      | helmet       | HTTP headers security                   |

### Development Tools

| Purpose         | Technology             |
| --------------- | ---------------------- |
| **Linting**     | ESLint                 |
| **Formatting**  | Prettier               |
| **Git Hooks**   | Husky (optional)       |
| **API Testing** | Postman/Thunder Client |

---

## 📁 File Structure

### Frontend Structure

```
frontend/
├── public/
│   ├── index.html
│   └── favicon.ico
├── src/
│   ├── components/
│   │   ├── Dashboard/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Dashboard.module.css
│   │   │   └── index.js
│   │   ├── Sidebar/
│   │   │   ├── Sidebar.jsx
│   │   │   ├── CourseHeader.jsx
│   │   │   ├── FileTree.jsx
│   │   │   ├── FileItem.jsx
│   │   │   ├── FolderItem.jsx
│   │   │   ├── ProgressBar.jsx
│   │   │   ├── Sidebar.module.css
│   │   │   └── index.js
│   │   ├── ContentViewer/
│   │   │   ├── ContentViewer.jsx
│   │   │   ├── VideoPlayer.jsx
│   │   │   ├── PDFViewer.jsx
│   │   │   ├── MarkdownViewer.jsx
│   │   │   ├── HTMLViewer.jsx
│   │   │   ├── TextViewer.jsx
│   │   │   ├── ContentViewer.module.css
│   │   │   └── index.js
│   │   ├── VideoPlayer/
│   │   │   ├── VideoPlayer.jsx
│   │   │   ├── Controls.jsx
│   │   │   ├── ProgressBar.jsx
│   │   │   ├── VolumeControl.jsx
│   │   │   ├── TimeDisplay.jsx
│   │   │   ├── DisplayModeButtons.jsx
│   │   │   ├── VideoPlayer.module.css
│   │   │   └── index.js
│   │   ├── CourseLoader/
│   │   │   ├── CourseLoader.jsx
│   │   │   ├── CourseLoader.module.css
│   │   │   └── index.js
│   │   └── common/
│   │       ├── Button/
│   │       ├── Icon/
│   │       ├── Spinner/
│   │       └── ErrorMessage/
│   ├── context/
│   │   ├── CourseContext.jsx
│   │   ├── ProgressContext.jsx
│   │   └── UIContext.jsx
│   ├── hooks/
│   │   ├── useCourse.js
│   │   ├── useProgress.js
│   │   ├── useCurrentFile.js
│   │   ├── useKeyboardShortcuts.js
│   │   └── useScrollDetection.js
│   ├── services/
│   │   ├── api.js
│   │   ├── courseService.js
│   │   ├── progressService.js
│   │   └── fileService.js
│   ├── utils/
│   │   ├── fileTypes.js
│   │   ├── formatTime.js
│   │   ├── sortFiles.js
│   │   └── constants.js
│   ├── styles/
│   │   ├── global.css
│   │   ├── variables.css
│   │   └── reset.css
│   ├── App.jsx
│   ├── App.css
│   └── main.jsx
├── .eslintrc.js
├── .prettierrc
├── package.json
├── vite.config.js
└── README.md
```

### Backend Structure

```
backend/
├── src/
│   ├── routes/
│   │   ├── courseRoutes.js
│   │   ├── progressRoutes.js
│   │   └── fileRoutes.js
│   ├── controllers/
│   │   ├── courseController.js
│   │   ├── progressController.js
│   │   └── fileController.js
│   ├── services/
│   │   ├── fileSystemService.js
│   │   ├── progressService.js
│   │   └── courseService.js
│   ├── utils/
│   │   ├── fileTypes.js
│   │   ├── pathValidator.js
│   │   ├── errorHandler.js
│   │   └── logger.js
│   ├── middleware/
│   │   ├── errorMiddleware.js
│   │   ├── corsMiddleware.js
│   │   └── securityMiddleware.js
│   └── server.js
├── .env.example
├── .eslintrc.js
├── .prettierrc
├── package.json
└── README.md
```

---

## 🌐 API Endpoints

### Course Management

#### Load Course

```
POST /api/course/load
Content-Type: application/json

Request:
{
  "path": "/absolute/path/to/course"
}

Response:
{
  "success": true,
  "data": {
    "id": "course-uuid",
    "name": "Course Name",
    "path": "/absolute/path",
    "structure": { ... }
  }
}
```

#### Get Course Structure

```
GET /api/course/:courseId/structure

Response:
{
  "success": true,
  "data": {
    "files": [...],
    "folders": [...]
  }
}
```

### Progress Management

#### Get Progress

```
GET /api/progress/:courseId

Response:
{
  "success": true,
  "data": {
    "courseId": "course-uuid",
    "progress": {
      "file1.mp4": {
        "completed": false,
        "lastPosition": 120,
        "duration": 600
      }
    }
  }
}
```

#### Update Progress

```
POST /api/progress/:courseId
Content-Type: application/json

Request:
{
  "filePath": "relative/path/to/file.mp4",
  "completed": false,
  "lastPosition": 150,
  "duration": 600
}

Response:
{
  "success": true,
  "message": "Progress updated"
}
```

#### Toggle Completion

```
POST /api/progress/:courseId/toggle
Content-Type: application/json

Request:
{
  "filePath": "relative/path/to/file.mp4"
}

Response:
{
  "success": true,
  "data": {
    "completed": true
  }
}
```

### File Serving

#### Serve File

```
GET /api/files/:courseId/*

Response: File stream with appropriate MIME type
Supports: Range requests for video seeking
```

---

## 📦 Data Models

### Course Structure

```typescript
interface Course {
  id: string;
  name: string;
  path: string;
  structure: FileNode;
  createdAt: Date;
  lastAccessed: Date;
}

interface FileNode {
  files: FileItem[];
  folders: FolderNode[];
}

interface FileItem {
  id: string;
  name: string;
  type: "video" | "pdf" | "markdown" | "html" | "text";
  path: string;
  relativePath: string;
  size: number;
  modifiedDate: Date;
}

interface FolderNode {
  name: string;
  path: string;
  files: FileItem[];
  folders: FolderNode[];
}
```

### Progress Data

```typescript
interface ProgressData {
  courseId: string;
  courseName: string;
  coursePath: string;
  lastAccessed: Date;
  progress: {
    [relativePath: string]: FileProgress;
  };
}

interface FileProgress {
  completed: boolean;
  lastPosition?: number; // For videos
  duration?: number; // For videos
  scrollPosition?: number; // For documents
  lastViewed: Date;
  viewCount: number;
}
```

### Progress File Format (.course-progress.json)

```json
{
  "version": "1.0",
  "courseId": "uuid-v4",
  "courseName": "My Course",
  "coursePath": "/absolute/path/to/course",
  "lastAccessed": "2025-10-08T12:00:00Z",
  "progress": {
    "01-intro.mp4": {
      "completed": true,
      "lastPosition": 589,
      "duration": 600,
      "lastViewed": "2025-10-08T11:30:00Z",
      "viewCount": 2
    },
    "Section1/lecture.pdf": {
      "completed": false,
      "scrollPosition": 0.45,
      "lastViewed": "2025-10-08T12:00:00Z",
      "viewCount": 1
    }
  },
  "statistics": {
    "totalFiles": 50,
    "completedFiles": 12,
    "totalTimeSpent": 3600,
    "lastSession": "2025-10-08T12:00:00Z"
  }
}
```

---

## 🎨 UI/UX Design

### Color Palette

```css
/* Primary Colors */
--color-bg-primary: #1a1a1a; /* Main background */
--color-bg-secondary: #2d2d2d; /* Sidebar, cards */
--color-bg-tertiary: #3d3d3d; /* Hover states */

/* Text Colors */
--color-text-primary: #ffffff; /* Main text */
--color-text-secondary: #b0b0b0; /* Secondary text */
--color-text-muted: #808080; /* Disabled, hints */

/* Accent Colors */
--color-accent-blue: #3b82f6; /* Links, buttons */
--color-accent-green: #10b981; /* Success, complete */
--color-accent-yellow: #f59e0b; /* Warnings */
--color-accent-red: #ef4444; /* Errors */

/* Functional Colors */
--color-border: #404040;
--color-hover: #4a4a4a;
--color-active: #5a5a5a;
```

### Typography

```css
/* Font Family */
--font-primary: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
  "Helvetica Neue", Arial, sans-serif;
--font-mono: "Courier New", Courier, monospace;

/* Font Sizes */
--text-xs: 0.75rem; /* 12px */
--text-sm: 0.875rem; /* 14px */
--text-base: 1rem; /* 16px */
--text-lg: 1.125rem; /* 18px */
--text-xl: 1.25rem; /* 20px */
--text-2xl: 1.5rem; /* 24px */
--text-3xl: 1.875rem; /* 30px */

/* Font Weights */
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

### Layout Specifications

#### Desktop (1024px+)

```
┌─────────────────────────────────────────────────────┐
│              Header (if any) - 60px                  │
├──────────────┬──────────────────────────────────────┤
│              │                                       │
│   Sidebar    │         Content Area                 │
│              │                                       │
│   320px      │         Flexible width               │
│   fixed      │                                       │
│              │                                       │
│   Scrollable │         Video/Document Viewer        │
│              │                                       │
└──────────────┴──────────────────────────────────────┘
```

#### Tablet (768px - 1023px)

```
┌─────────────────────────────────────────────────────┐
│  [☰] Header - 60px                                   │
├─────────────────────────────────────────────────────┤
│                                                      │
│              Content Area (Full width)               │
│                                                      │
│              Video/Document Viewer                   │
│                                                      │
└─────────────────────────────────────────────────────┘

Sidebar: Overlay from left (280px) when hamburger clicked
```

#### Mobile (< 768px)

```
┌──────────────────────┐
│  [☰] Header - 50px   │
├──────────────────────┤
│                      │
│   Content Area       │
│   (Full width)       │
│                      │
│   Video/Document     │
│   Viewer             │
│                      │
└──────────────────────┘

Sidebar: Full-screen overlay when hamburger clicked
```

### Component Specifications

#### Sidebar

- Width: 320px (desktop), 280px (tablet overlay), 100% (mobile overlay)
- Background: `var(--color-bg-secondary)`
- Border: 1px solid `var(--color-border)` on right
- Padding: 16px
- Scroll: Auto with custom scrollbar

#### File Item

- Height: 40px
- Padding: 8px 12px
- Hover: `var(--color-bg-tertiary)`
- Active: `var(--color-accent-blue)` with 10% opacity background
- Icon size: 20x20px
- Font size: `var(--text-sm)`

#### Video Player

- Aspect ratio: 16:9 (default)
- Controls height: 50px
- Controls fade out after 3s of inactivity
- Progress bar height: 6px (12px when hovering)

#### Progress Indicators

- Checkmark size: 20x20px
- Progress bar height: 4px
- Border radius: 2px
- Completed color: `var(--color-accent-green)`

---

## ❓ Open Questions & Clarifications Needed

### Critical Questions - ✅ ANSWERED

1. **Folder Selection Method**

   - **Question**: How should users select the course folder?
   - **Answer**: ✅ Browser's native folder picker (Option A)
   - **Implementation**: Use File System Access API with directory picker

2. **Security & Path Access**

   - **Question**: Should we restrict access to certain system folders?
   - **Answer**: ✅ No restrictions needed - user won't select system folders
   - **Implementation**: Trust user selection, no blacklisting required

3. **File Size Limits**

   - **Question**: Should we impose limits on file sizes to prevent browser crashes?
   - **Answer**: ✅ Set high limits to prevent browser crashes
   - **Implementation**: Warn for videos >5GB, PDFs >500MB (high thresholds)

4. **Subtitle Format Priority**

   - **Question**: Which subtitle format to support first in future updates?
   - **Answer**: ✅ Priority order: .srt > .vtt > .txt
   - **Implementation**: Auto-detect and use first available format in order

5. **Concurrent Access**
   - **Question**: How to handle multiple tabs/windows accessing same course?
   - **Answer**: ✅ Only one window will be opened
   - **Implementation**: No concurrent access handling needed

### Nice-to-Have Clarifications - ✅ ANSWERED

6. **Export Progress**

   - **Answer**: ✅ Mark as future work (not required for MVP)
   - **Reason**: Progress is already stored locally

7. **Multiple Courses**

   - **Answer**: ✅ Yes, implement home screen showing recent courses
   - **Implementation**: Required for MVP - course selection landing page

8. **Themes**

   - **Answer**: ✅ Dark theme only
   - **Implementation**: No theme switching, single dark theme

9. **Annotations**

   - **Answer**: ✅ Mark as future work
   - **Implementation**: Not in MVP scope

10. **Statistics**
    - **Answer**: ✅ Focus on completion rate
    - **Implementation**: Show completion percentage as primary metric

---

## ⚠️ Risk Assessment

### Technical Risks

| Risk                                        | Severity | Mitigation                                   |
| ------------------------------------------- | -------- | -------------------------------------------- |
| **Large video files causing memory issues** | High     | Implement streaming, not loading entire file |
| **Browser compatibility for file access**   | Medium   | Thorough testing, provide fallbacks          |
| **Corrupted progress files**                | Medium   | Validation, backup mechanism                 |
| **Deep folder nesting performance**         | Low      | Lazy loading, virtualization                 |
| **PDF rendering performance**               | Medium   | Page-by-page rendering, caching              |

### User Experience Risks

| Risk                            | Severity | Mitigation                        |
| ------------------------------- | -------- | --------------------------------- |
| **Confusing folder selection**  | Medium   | Clear instructions, examples      |
| **Lost progress data**          | High     | Frequent auto-save, validation    |
| **Slow initial course loading** | Medium   | Loading indicators, optimization  |
| **Unclear progress indicators** | Low      | User testing, clear visual design |

### Development Risks

| Risk                    | Severity | Mitigation                             |
| ----------------------- | -------- | -------------------------------------- |
| **Scope creep**         | Medium   | Stick to MVP, document future features |
| **Over-engineering**    | Low      | Simple solutions first                 |
| **Poor code structure** | Low      | Follow plan, regular refactoring       |

---

## 📝 Implementation Checklist

### Phase 1: Setup ✅

- [ ] Create project folders
- [ ] Initialize npm projects
- [ ] Install dependencies
- [ ] Configure dev servers
- [ ] Set up linting/formatting

### Phase 2: Backend Core

- [ ] File system scanner
- [ ] Course loading endpoint
- [ ] File serving endpoint
- [ ] Progress read/write
- [ ] Error handling

### Phase 3: Frontend Foundation

- [ ] State management setup
- [ ] API service layer
- [ ] Dashboard layout
- [ ] Routing
- [ ] Basic navigation

### Phase 4: Sidebar

- [ ] File tree component
- [ ] Folder component
- [ ] File item component
- [ ] Progress indicators
- [ ] Collapse/expand logic

### Phase 5: Video Player

- [ ] HTML5 video integration
- [ ] Custom controls
- [ ] Keyboard shortcuts
- [ ] Progress tracking
- [ ] Display modes

### Phase 6: Document Viewers

- [ ] PDF viewer
- [ ] Markdown viewer
- [ ] HTML viewer
- [ ] Text viewer
- [ ] Scroll detection

### Phase 7: Progress System

- [ ] Progress calculation
- [ ] Auto-complete logic
- [ ] Manual toggle
- [ ] Auto-navigation
- [ ] Persistence

### Phase 8: Styling

- [ ] Design tokens
- [ ] Dark theme
- [ ] Component styles
- [ ] Animations
- [ ] Icons

### Phase 9: Responsive

- [ ] Mobile layout
- [ ] Tablet layout
- [ ] Desktop layout
- [ ] Touch controls

### Phase 10: Polish

- [ ] Testing
- [ ] Bug fixes
- [ ] Performance optimization
- [ ] Documentation

---

## 🎯 Success Criteria

### Must Have (MVP)

- ✅ Load course from local folder
- ✅ Display course structure in sidebar
- ✅ Play videos with custom controls
- ✅ View PDFs, markdown, HTML, text
- ✅ Track progress automatically
- ✅ Persist progress locally
- ✅ Dark theme UI
- ✅ Responsive design
- ✅ Keyboard shortcuts for video

### Should Have (v1.1)

- ⏳ Subtitle support
- ⏳ Playback speed control
- ⏳ Recent courses list
- ⏳ Search within course
- ⏳ Export progress

### Could Have (Future)

- 💭 Note-taking
- 💭 Bookmarks
- 💭 Course statistics
- 💭 Multiple themes
- 💭 Cloud sync

---

## 📅 Timeline Estimate

**Total Duration:** ~16 days (assuming full-time work)

- **Week 1**: Backend + Frontend core (Days 1-7)
- **Week 2**: Viewers + Progress (Days 8-12)
- **Week 3**: Polish + Testing (Days 13-16)

**Note**: Timeline may vary based on:

- Complexity of encountered issues
- Scope adjustments
- Testing requirements
- Documentation depth

---

## 🔄 Next Steps

1. **Review this plan** with stakeholders
2. **Clarify open questions** (see Open Questions section)
3. **Set up development environment**
4. **Begin Phase 1: Project Setup**
5. **Regular progress reviews** after each milestone

---

## 📚 References & Resources

### Libraries Documentation

- [React Documentation](https://react.dev)
- [Express.js Guide](https://expressjs.com)
- [PDF.js Documentation](https://mozilla.github.io/pdf.js/)
- [Marked.js](https://marked.js.org)
- [Flowbite Icons](https://flowbite.com/icons/)

### Design Inspiration

- Udemy course player
- YouTube video player
- VS Code file explorer
- Modern learning platforms

### Technical References

- [HTML5 Video API](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement)
- [File System Access API](https://developer.mozilla.org/en-US/docs/Web/API/File_System_Access_API)
- [Media Session API](https://developer.mozilla.org/en-US/docs/Web/API/Media_Session_API)

---

**Document Status:** Draft v1.0  
**Last Updated:** October 8, 2025  
**Next Review:** After stakeholder feedback
