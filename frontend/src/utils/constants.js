// API Base URL
export const API_BASE_URL = "http://localhost:3001/api";

// File type categories
export const FILE_CATEGORIES = {
  VIDEO: "video",
  PDF: "pdf",
  MARKDOWN: "markdown",
  HTML: "html",
  TEXT: "text",
  IMAGE: "image",
  SUBTITLE: "subtitle",
};

// Video completion threshold (90%)
export const VIDEO_COMPLETION_THRESHOLD = 0.9;

// Document scroll completion threshold (95%)
export const DOCUMENT_COMPLETION_THRESHOLD = 0.95;

// Progress save interval (5 seconds)
export const PROGRESS_SAVE_INTERVAL = 5000;

// Keyboard shortcuts
export const KEYBOARD_SHORTCUTS = {
  PLAY_PAUSE: " ", // Space
  SEEK_FORWARD: "ArrowRight",
  SEEK_BACKWARD: "ArrowLeft",
  VOLUME_UP: "ArrowUp",
  VOLUME_DOWN: "ArrowDown",
  MUTE: "m",
  FULLSCREEN: "f",
  CINEMA: "c",
};

// View modes
export const VIEW_MODES = {
  NORMAL: "normal",
  CINEMA: "cinema",
  FULLSCREEN: "fullscreen",
};

// Local storage keys
export const STORAGE_KEYS = {
  RECENT_COURSES: "oct_recent_courses",
  VOLUME: "oct_volume",
  MUTED: "oct_muted",
};
