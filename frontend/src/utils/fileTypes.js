import { FILE_CATEGORIES } from "./constants";

// File type extensions
const FILE_EXTENSIONS = {
  [FILE_CATEGORIES.VIDEO]: [".mp4", ".webm", ".ogg", ".mov", ".avi", ".mkv"],
  [FILE_CATEGORIES.PDF]: [".pdf"],
  [FILE_CATEGORIES.MARKDOWN]: [".md", ".markdown"],
  [FILE_CATEGORIES.HTML]: [".html", ".htm"],
  [FILE_CATEGORIES.TEXT]: [".txt"],
  [FILE_CATEGORIES.IMAGE]: [
    ".jpg",
    ".jpeg",
    ".png",
    ".gif",
    ".bmp",
    ".webp",
    ".svg",
    ".ico",
  ],
  [FILE_CATEGORIES.SUBTITLE]: [".srt", ".vtt"],
};

// Get file extension
export const getFileExtension = (filename) => {
  return filename.substring(filename.lastIndexOf(".")).toLowerCase();
};

// Get file category
export const getFileCategory = (filename) => {
  const ext = getFileExtension(filename);

  for (const [category, extensions] of Object.entries(FILE_EXTENSIONS)) {
    if (extensions.includes(ext)) {
      return category;
    }
  }

  return null;
};

// Check if file is supported
export const isSupportedFile = (filename) => {
  return getFileCategory(filename) !== null;
};

// Sort files alphanumerically
export const sortFiles = (files) => {
  return [...files].sort((a, b) => {
    return a.name.toLowerCase().localeCompare(b.name.toLowerCase(), undefined, {
      numeric: true,
      sensitivity: "base",
    });
  });
};

// Get file icon based on type
export const getFileIcon = (type) => {
  const icons = {
    [FILE_CATEGORIES.VIDEO]: "video",
    [FILE_CATEGORIES.PDF]: "pdf",
    [FILE_CATEGORIES.MARKDOWN]: "markdown",
    [FILE_CATEGORIES.HTML]: "html",
    [FILE_CATEGORIES.TEXT]: "text",
    [FILE_CATEGORIES.IMAGE]: "image",
  };

  return icons[type] || "file";
};
