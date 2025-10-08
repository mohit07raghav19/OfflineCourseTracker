# OfflineCourseTracker

**Local Course Progress Dashboard** – A fully offline web application for tracking learning progress through downloaded courses.

---

## 📋 Overview

OfflineCourseTracker is a modern, offline-first web application that allows you to load and track progress through locally downloaded courses. The application supports multiple file types including videos, PDFs, markdown, HTML, and text files, all while maintaining your progress locally without any external database.

### Key Features

- 🎯 **Offline-First**: Works completely offline once set up
- 📁 **Folder-Based Course Loading**: Load any course from your local filesystem
- 🎬 **Multi-Format Support**: Videos (MP4, WebM, etc.), PDFs, Markdown, HTML, Text files
- 📊 **Automatic Progress Tracking**: Smart progress detection for all file types
- 🎨 **Modern Dark Theme**: Clean, minimalistic UI inspired by popular learning platforms
- ⚡ **Auto-Navigation**: Automatically advance to next lesson on completion
- ⌨️ **Keyboard Shortcuts**: Enhanced video player controls
- 📱 **Fully Responsive**: Works seamlessly across all devices
- 💾 **Local Storage**: Progress saved within the course folder itself

---

## 🚀 Quick Start

### Choose Your Setup Method

#### 🐳 Option A: Docker (Recommended - Easiest)

**Prerequisites**: [Docker Desktop](https://www.docker.com/products/docker-desktop/)

```bash
# Clone and start
git clone <repository-url>
cd OfflineCourseTracker
docker-compose up
```

Access at: http://localhost:5173

> 📖 **Detailed Docker guide**: See [DOCKER.md](DOCKER.md)

#### 💻 Option B: Local Development

**Prerequisites**: Node.js (v16+), npm/yarn, Modern browser

### Installation & Running

1. **Clone the repository**:

   ```bash
   git clone <repository-url>
   cd OfflineCourseTracker
   ```

2. **Install dependencies** (first time only):

   ```bash
   npm run install:all
   ```

3. **Start both servers** (choose one method):

   **Method 1: Using startup script (Recommended)**

   macOS/Linux:

   ```bash
   ./start-dev.sh
   ```

   Windows:

   ```cmd
   start-dev.bat
   ```

   **Method 2: Using npm**

   ```bash
   npm start
   ```

   **Method 3: Manual (separate terminals)**

   ```bash
   # Terminal 1 - Frontend
   cd frontend && npm run dev

   # Terminal 2 - Backend
   cd backend && npm run dev
   ```

4. **Access the application**:
   - Frontend: `http://localhost:5173`
   - Backend: `http://localhost:3000`

> 💡 **Tip**: See [QUICKSTART.md](QUICKSTART.md) for detailed startup instructions

---

## 📖 Usage Guide

### Loading a Course

1. Click the **"Load Course"** button in the dashboard
2. Select the folder containing your course materials
3. The application will scan and organize all course files
4. Course structure will appear in the left sidebar

### Supported File Types

| Type         | Extensions                      | Auto-Complete Trigger |
| ------------ | ------------------------------- | --------------------- |
| **Video**    | `.mp4`, `.webm`, `.ogg`, `.mov` | ≥90% watched          |
| **PDF**      | `.pdf`                          | Scroll to bottom      |
| **Markdown** | `.md`, `.markdown`              | Scroll to bottom      |
| **HTML**     | `.html`, `.htm`                 | Scroll to bottom      |
| **Text**     | `.txt`                          | Scroll to bottom      |

### Progress Tracking

- **Automatic Tracking**: Progress is automatically saved as you watch/read
- **Manual Override**: Click the checkmark icon to manually mark items complete/incomplete
- **Persistent Storage**: All progress is saved in `.course-progress.json` within your course folder
- **Visual Indicators**: Progress bars and checkmarks show completion status

### Video Player Controls

#### Mouse Controls

- Click player to play/pause
- Volume slider for audio control
- Progress bar for seeking
- Display mode buttons (Normal/Cinema/Fullscreen)

#### Keyboard Shortcuts

- `Space` - Play/Pause
- `←` / `→` - Seek backward/forward (10s)
- `↑` / `↓` - Volume up/down
- `M` - Mute/Unmute
- `F` - Toggle fullscreen
- `Esc` - Exit fullscreen

### Navigation

- **Sidebar Navigation**: Click any item in the sidebar to jump to it
- **Auto-Advance**: Automatically proceeds to next item upon completion
- **Collapsible Sections**: Folders can be expanded/collapsed for easier navigation

---

## 🏗️ Project Structure

```code
OfflineCourseTracker/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── Sidebar/     # Course navigation sidebar
│   │   │   ├── ContentViewer/ # File rendering components
│   │   │   ├── VideoPlayer/ # Custom video player
│   │   │   └── Dashboard/   # Main dashboard layout
│   │   ├── services/        # API and file handling services
│   │   ├── hooks/           # Custom React hooks
│   │   ├── utils/           # Utility functions
│   │   └── styles/          # Global styles and themes
│   └── package.json
├── backend/                  # Node.js/Express backend
│   ├── src/
│   │   ├── routes/          # API routes
│   │   ├── controllers/     # Request handlers
│   │   ├── services/        # Business logic
│   │   └── utils/           # Helper functions
│   └── package.json
├── README.md
└── PLAN.md
```

---

## 🎨 Design Philosophy

### Dark Theme

- Primary background: `#1a1a1a`
- Secondary background: `#2d2d2d`
- Accent color: Customizable
- Text: High contrast for readability

### Minimalistic UI

- Clean, distraction-free interface
- Focus on content
- Intuitive navigation
- No unnecessary UI elements

### Responsive Design

- Mobile-first approach
- Adaptive layouts for all screen sizes
- Touch-friendly controls

---

## 🔧 Configuration

### Default Ports

- **Frontend**: 5173 (Vite dev server)
- **Backend**: 3000 (Express server)

To change ports, modify the configuration in:

- Frontend: `frontend/vite.config.js`
- Backend: `backend/src/index.js` or `backend/.env`

### Course Folder Requirements

- No specific folder structure required
- Files are automatically sorted by filename (alphanumeric)
- Nested folders are supported and preserved
- Hidden files (starting with `.`) are ignored

---

## 💾 Data Storage

### Progress File

- **Filename**: `.course-progress.json`
- **Location**: Root of the course folder
- **Format**: JSON

### Progress Data Structure

```json
{
  "courseId": "unique-course-identifier",
  "courseName": "Course Folder Name",
  "lastAccessed": "2025-10-08T12:00:00Z",
  "progress": {
    "relativePath/to/file.mp4": {
      "completed": false,
      "lastPosition": 145.5,
      "duration": 600,
      "lastViewed": "2025-10-08T12:00:00Z"
    }
  }
}
```

---

## 🔮 Future Enhancements

### Planned Features

1. **Subtitle Support**

   - `.srt`, `.vtt`, `.txt` subtitle files
   - Auto-detect subtitles for videos
   - Multi-language support
   - Customizable subtitle styling

2. **Playback Speed Control**

   - Variable speed (0.5x to 2x)
   - Speed presets
   - Persistent speed preference

3. **Notes & Bookmarks**

   - Timestamp-based notes for videos
   - Bookmarks for quick navigation
   - Export notes functionality

4. **Course Statistics**

   - Time spent per course
   - Completion percentage
   - Learning streaks
   - Estimated time to completion

5. **Multiple Course Management**

   - Recent courses list
   - Course library view
   - Search across courses

6. **Themes**
   - Light theme option
   - Custom theme colors
   - Accessibility modes

---

## 🛠️ Technology Stack

### Frontend

- **React** - UI framework
- **React Router** - Navigation
- **Context API / Redux** - State management
- **CSS Modules / Styled Components** - Styling
- **PDF.js** - PDF rendering
- **Marked.js** - Markdown parsing

### Backend

- **Node.js** - Runtime
- **Express** - Web framework
- **CORS** - Cross-origin support
- **File System API** - File operations

### Development Tools

- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Webpack / Vite** - Build tool

---

## 🐛 Troubleshooting

### Common Issues

**Course files not loading**

- Ensure the backend server is running
- Check file permissions on the course folder
- Verify supported file formats

**Progress not saving**

- Ensure write permissions for the course folder
- Check for `.course-progress.json` file creation
- Look for errors in browser console

**Video playback issues**

- Verify video codec support in your browser
- Try a different browser
- Check video file integrity

**PDF rendering problems**

- Large PDFs may take time to load
- Ensure sufficient memory available
- Try refreshing the page

---

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

## 📄 License

[Specify your license here]

---

## 📧 Support

For issues, questions, or suggestions:

- Open an issue on GitHub
- Contact: [Your contact information]

---

## 🙏 Acknowledgments

- UI inspiration from Udemy and other modern learning platforms
- Icons from [Flowbite Icons](https://flowbite.com/icons/)
- Open-source community for various libraries and tools

---
