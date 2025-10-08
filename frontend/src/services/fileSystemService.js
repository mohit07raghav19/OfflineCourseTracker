/**
 * Browser-based File System Service
 * Uses File System Access API to read directory structure
 * No backend path required - works entirely in browser
 */

// Supported file types
const SUPPORTED_EXTENSIONS = {
  video: [".mp4", ".webm", ".mkv", ".avi", ".mov", ".flv", ".wmv", ".m4v"],
  document: [".pdf"],
  markdown: [".md", ".markdown"],
  html: [".html", ".htm"],
  text: [".txt"],
  subtitle: [".srt", ".vtt"],
};

const ALL_SUPPORTED = Object.values(SUPPORTED_EXTENSIONS).flat();

/**
 * Get file type category
 */
export const getFileType = (filename) => {
  const ext = ("." + filename.split(".").pop()).toLowerCase();

  for (const [type, extensions] of Object.entries(SUPPORTED_EXTENSIONS)) {
    if (extensions.includes(ext)) {
      return type;
    }
  }

  return "unknown";
};

/**
 * Check if file is supported
 */
export const isSupportedFile = (filename) => {
  const ext = ("." + filename.split(".").pop()).toLowerCase();
  return ALL_SUPPORTED.includes(ext);
};

/**
 * Recursively scan directory and build file structure
 * Returns tree structure with file handles
 */
export const scanDirectory = async (dirHandle, path = "") => {
  const structure = {
    name: dirHandle.name,
    path: path || dirHandle.name,
    type: "directory",
    handle: dirHandle,
    children: [],
  };

  try {
    const entries = [];

    // Collect all entries
    for await (const entry of dirHandle.values()) {
      entries.push(entry);
    }

    // Sort: directories first, then files alphabetically
    entries.sort((a, b) => {
      if (a.kind !== b.kind) {
        return a.kind === "directory" ? -1 : 1;
      }
      return a.name.localeCompare(b.name, undefined, {
        numeric: true,
        sensitivity: "base",
      });
    });

    // Process entries
    for (const entry of entries) {
      const entryPath = path
        ? `${path}/${entry.name}`
        : `${dirHandle.name}/${entry.name}`;

      if (entry.kind === "directory") {
        // Recursively scan subdirectories
        const subDir = await scanDirectory(entry, entryPath);
        if (subDir.children.length > 0) {
          // Only include non-empty directories
          structure.children.push(subDir);
        }
      } else if (entry.kind === "file") {
        // Only include supported files
        if (isSupportedFile(entry.name)) {
          const file = await entry.getFile();
          structure.children.push({
            name: entry.name,
            path: entryPath,
            type: "file",
            fileType: getFileType(entry.name),
            size: file.size,
            lastModified: file.lastModified,
            handle: entry,
          });
        }
      }
    }
  } catch (err) {
    console.error(`Error scanning directory ${dirHandle.name}:`, err);
  }

  return structure;
};

/**
 * Flatten file structure to get ordered file list
 */
export const flattenFileStructure = (structure, fileList = []) => {
  if (structure.type === "file") {
    fileList.push(structure);
  } else if (structure.children) {
    for (const child of structure.children) {
      flattenFileStructure(child, fileList);
    }
  }
  return fileList;
};

/**
 * Get total file count
 */
export const getTotalFileCount = (structure) => {
  let count = 0;

  const countFiles = (node) => {
    if (node.type === "file") {
      count++;
    } else if (node.children) {
      node.children.forEach(countFiles);
    }
  };

  countFiles(structure);
  return count;
};

/**
 * Read file content from handle
 */
export const readFileContent = async (fileHandle) => {
  const file = await fileHandle.getFile();
  return file;
};

/**
 * Create object URL for file
 */
export const createFileURL = async (fileHandle) => {
  const file = await fileHandle.getFile();
  return URL.createObjectURL(file);
};

/**
 * Find file in structure by path
 */
export const findFileByPath = (structure, path) => {
  if (structure.path === path) {
    return structure;
  }

  if (structure.children) {
    for (const child of structure.children) {
      const found = findFileByPath(child, path);
      if (found) return found;
    }
  }

  return null;
};

/**
 * Get file handle by path
 */
export const getFileHandle = (structure, path) => {
  const file = findFileByPath(structure, path);
  return file ? file.handle : null;
};

/**
 * Load progress from local storage
 * Since we can't write to the file system easily, we'll use localStorage
 * with the course name as key
 */
export const loadProgress = (courseName) => {
  const key = `course_progress_${courseName}`;
  const stored = localStorage.getItem(key);

  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (err) {
      console.error("Error parsing progress:", err);
    }
  }

  return {
    courseName,
    files: {},
    lastAccessed: Date.now(),
  };
};

/**
 * Save progress to local storage
 */
export const saveProgress = (courseName, progress) => {
  const key = `course_progress_${courseName}`;
  progress.lastAccessed = Date.now();
  localStorage.setItem(key, JSON.stringify(progress));
};

/**
 * Update file progress
 */
export const updateFileProgress = (courseName, filePath, progressData) => {
  const progress = loadProgress(courseName);

  if (!progress.files[filePath]) {
    progress.files[filePath] = {};
  }

  Object.assign(progress.files[filePath], progressData, {
    lastViewed: Date.now(),
  });

  saveProgress(courseName, progress);
  return progress;
};

/**
 * Toggle file completion
 */
export const toggleFileCompletion = (courseName, filePath) => {
  const progress = loadProgress(courseName);

  if (!progress.files[filePath]) {
    progress.files[filePath] = {};
  }

  progress.files[filePath].completed = !progress.files[filePath].completed;
  progress.files[filePath].lastViewed = Date.now();

  if (
    progress.files[filePath].completed &&
    !progress.files[filePath].completedAt
  ) {
    progress.files[filePath].completedAt = Date.now();
  }

  saveProgress(courseName, progress);
  return progress;
};

/**
 * Get file progress
 */
export const getFileProgress = (courseName, filePath) => {
  const progress = loadProgress(courseName);
  return progress.files[filePath] || {};
};

/**
 * Calculate overall progress
 */
export const calculateProgress = (courseName, totalFiles) => {
  const progress = loadProgress(courseName);
  const completed = Object.values(progress.files).filter(
    (f) => f.completed
  ).length;
  return {
    completed,
    total: totalFiles,
    percentage: totalFiles > 0 ? Math.round((completed / totalFiles) * 100) : 0,
  };
};
