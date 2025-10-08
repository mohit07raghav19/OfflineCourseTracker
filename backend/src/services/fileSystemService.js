import fs from 'fs-extra';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import {
  isSupportedFile,
  getFileCategory,
} from '../utils/fileTypes.js';
import { logger } from '../utils/logger.js';

// Scan directory and build file tree structure
export const scanDirectory = async (dirPath) => {
  try {
    const stats = await fs.stat(dirPath);

    if (!stats.isDirectory()) {
      throw new Error('Path is not a directory');
    }

    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    const files = [];
    const folders = [];

    // Sort entries alphabetically (case-insensitive)
    entries.sort((a, b) =>
      a.name.toLowerCase().localeCompare(b.name.toLowerCase())
    );

    for (const entry of entries) {
      // Skip hidden files and system files
      if (entry.name.startsWith('.')) {
        continue;
      }

      const fullPath = path.join(dirPath, entry.name);
      const entryStats = await fs.stat(fullPath);

      if (entry.isDirectory()) {
        // Recursively scan subdirectories
        const subStructure = await scanDirectory(fullPath);
        folders.push({
          name: entry.name,
          path: fullPath,
          files: subStructure.files,
          folders: subStructure.folders,
        });
      } else if (entry.isFile() && isSupportedFile(entry.name)) {
        // Add supported files
        files.push({
          id: uuidv4(),
          name: entry.name,
          type: getFileCategory(entry.name),
          path: fullPath,
          relativePath: path.relative(dirPath, fullPath),
          size: entryStats.size,
          modifiedDate: entryStats.mtime.toISOString(),
        });
      }
    }

    return { files, folders };
  } catch (error) {
    logger.error('Error scanning directory', { error: error.message, dirPath });
    throw error;
  }
};

// Get total file count in structure (recursive)
export const getTotalFileCount = (structure) => {
  let count = structure.files ? structure.files.length : 0;

  if (structure.folders) {
    for (const folder of structure.folders) {
      count += getTotalFileCount(folder);
    }
  }

  return count;
};

// Flatten file structure to get all files in order
export const flattenFileStructure = (structure, basePath = '') => {
  const allFiles = [];

  // Add files from current level
  if (structure.files) {
    allFiles.push(...structure.files);
  }

  // Recursively add files from folders
  if (structure.folders) {
    for (const folder of structure.folders) {
      const folderFiles = flattenFileStructure(folder, folder.path);
      allFiles.push(...folderFiles);
    }
  }

  return allFiles;
};

// Check if file exists
export const fileExists = async (filePath) => {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
};

// Get file stats
export const getFileStats = async (filePath) => {
  try {
    const stats = await fs.stat(filePath);
    return {
      size: stats.size,
      modified: stats.mtime.toISOString(),
      isFile: stats.isFile(),
      isDirectory: stats.isDirectory(),
    };
  } catch (error) {
    logger.error('Error getting file stats', {
      error: error.message,
      filePath,
    });
    throw error;
  }
};
