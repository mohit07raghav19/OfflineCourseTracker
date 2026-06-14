# OfflineCourseTracker 🚀

![Version](https://img.shields.io/badge/version-1.0-blue.svg)
![Privacy](https://img.shields.io/badge/privacy-focused-green.svg)
![Offline](https://img.shields.io/badge/offline--first-yes-orange.svg)
![AI-Assisted](https://img.shields.io/badge/ai--assisted-yes-blueviolet.svg)

**Local Course Progress Dashboard** – A fully offline, privacy-focused web application for tracking your learning journey through downloaded courses.

---

## 🌟 Overview

OfflineCourseTracker is a modern, offline-first application designed for self-learners who prefer locally stored content. Load any folder containing videos, PDFs, or documentation, and the app will organize them into a clean, intuitive dashboard with automatic progress tracking.

### Key Features

- 🎯 **Offline-First**: Works 100% offline once cloned.
- 📁 **Zero-Config Loading**: Just select your course folder and start learning.
- 🎬 **Rich Media Support**: Integrated viewers for Videos (MP4, WebM), PDFs, Markdown, HTML, and Text.
- 📊 **Smart Progress Tracking**: Automatically remembers where you left off.
- 🎨 **Minimalist Dark UI**: Distraction-free interface inspired by top learning platforms.
- 📱 **Fully Responsive**: Learn on your desktop, tablet, or mobile.
- 💾 **Local Persistence**: Progress is saved directly in your course folder via `.course-progress.json`.
- 🤖 **AI-Assisted**: Developed with modern AI-assisted engineering practices for high performance and reliability.

---

## 🚀 Quick Start

### Option A: Docker (Recommended)

The easiest way to get up and running. Requires [Docker Desktop](https://www.docker.com/products/docker-desktop/).

```bash
git clone https://github.com/mohit07raghav19/OfflineCourseTracker.git
cd OfflineCourseTracker
docker-compose up
```

Access the dashboard at: **http://localhost:3000**

### Option B: Local Development

Requires [Node.js](https://nodejs.org/) (v18+).

1.  **Clone & Install**:

    ```bash
    git clone https://github.com/mohit07raghav19/OfflineCourseTracker.git
    cd OfflineCourseTracker
    npm run install:all
    ```

2.  **Start Servers**:

    ```bash
    npm start
    ```

Access the dashboard at: **http://localhost:3000** (Frontend) and **http://localhost:3001** (Backend).

---

## 📖 How to Use

1.  **Load a Course**: Click "Select Course Folder" and pick the directory on your computer containing your materials.
2.  **Learn**: Navigate through the sidebar. The app supports nested folders and sorts files alphanumerically.
3.  **Track**:
    - **Videos**: Auto-complete at 90% watch time.
    - **Documents**: Auto-complete when you scroll to the bottom.
    - **Manual**: Toggle the checkmark next to any file to override progress.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, Vite, Context API, CSS Modules.
- **Backend**: Node.js, Express, File System API.
- **Viewers**: PDF.js, Marked (Markdown), HTML5 Video.

---

## 🔒 Privacy & Security

OfflineCourseTracker is built with privacy in mind.

- **No Analytics**: We don't track your usage.
- **No Cloud**: Your data never leaves your machine.
- **No Database**: We use a simple JSON file in your course folder to store progress.

---

## 🤝 Contributing

Contributions are welcome! If you have a feature request or found a bug, please open an issue or submit a pull request.

---

## 📄 License

This project is licensed under the ISC License.

---
