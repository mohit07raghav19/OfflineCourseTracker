import fs from 'fs-extra';
import path from 'path';
import { logger } from '../utils/logger.js';

const PROGRESS_FILE_NAME = '.course-progress.json';

// Read progress file from course directory
export const readProgress = async (coursePath) => {
  const progressFilePath = path.join(coursePath, PROGRESS_FILE_NAME);

  try {
    const exists = await fs.pathExists(progressFilePath);

    if (!exists) {
      // Return empty progress structure if file doesn't exist
      return {
        version: '1.1.0',
        courseId: null,
        courseName: path.basename(coursePath),
        coursePath: coursePath,
        lastAccessed: new Date().toISOString(),
        progress: {},
        statistics: {
          totalFiles: 0,
          completedFiles: 0,
          totalTimeSpent: 0,
          lastSession: new Date().toISOString(),
        },
      };
    }

    const data = await fs.readJSON(progressFilePath);
    return data;
  } catch (error) {
    logger.error('Error reading progress file', {
      error: error.message,
      coursePath,
    });
    throw error;
  }
};

// Write progress to file
export const writeProgress = async (coursePath, progressData) => {
  const progressFilePath = path.join(coursePath, PROGRESS_FILE_NAME);

  try {
    // Update last accessed timestamp
    progressData.lastAccessed = new Date().toISOString();

    // Write atomically
    await fs.writeJSON(progressFilePath, progressData, { spaces: 2 });

    return true;
  } catch (error) {
    logger.error('Error writing progress file', {
      error: error.message,
      coursePath,
    });
    throw error;
  }
};

// Update progress for a specific file
export const updateFileProgress = async (
  coursePath,
  filePath,
  progressUpdate
) => {
  try {
    const progressData = await readProgress(coursePath);

    // Update or create file progress
    if (!progressData.progress[filePath]) {
      progressData.progress[filePath] = {
        completed: false,
        lastViewed: new Date().toISOString(),
        viewCount: 0,
      };
    }

    // Merge updates
    progressData.progress[filePath] = {
      ...progressData.progress[filePath],
      ...progressUpdate,
      lastViewed: new Date().toISOString(),
    };

    // Increment view count if not already set in update
    if (!progressUpdate.viewCount) {
      progressData.progress[filePath].viewCount =
        (progressData.progress[filePath].viewCount || 0) + 1;
    }

    // Update statistics
    const completedCount = Object.values(progressData.progress).filter(
      (p) => p.completed
    ).length;
    progressData.statistics.completedFiles = completedCount;
    progressData.statistics.lastSession = new Date().toISOString();

    await writeProgress(coursePath, progressData);

    return progressData;
  } catch (error) {
    logger.error('Error updating file progress', {
      error: error.message,
      coursePath,
      filePath,
    });
    throw error;
  }
};

// Toggle completion status for a file
export const toggleCompletion = async (coursePath, filePath) => {
  try {
    const progressData = await readProgress(coursePath);

    if (!progressData.progress[filePath]) {
      progressData.progress[filePath] = {
        completed: true,
        lastViewed: new Date().toISOString(),
        viewCount: 1,
      };
    } else {
      progressData.progress[filePath].completed =
        !progressData.progress[filePath].completed;
      progressData.progress[filePath].lastViewed = new Date().toISOString();
    }

    // Update statistics
    const completedCount = Object.values(progressData.progress).filter(
      (p) => p.completed
    ).length;
    progressData.statistics.completedFiles = completedCount;

    await writeProgress(coursePath, progressData);

    return progressData.progress[filePath];
  } catch (error) {
    logger.error('Error toggling completion', {
      error: error.message,
      coursePath,
      filePath,
    });
    throw error;
  }
};

// Initialize progress file with course structure
export const initializeProgress = async (courseId, coursePath, totalFiles) => {
  try {
    const progressData = {
      version: '1.1.0',
      courseId: courseId,
      courseName: path.basename(coursePath),
      coursePath: coursePath,
      lastAccessed: new Date().toISOString(),
      progress: {},
      statistics: {
        totalFiles: totalFiles,
        completedFiles: 0,
        totalTimeSpent: 0,
        lastSession: new Date().toISOString(),
      },
    };

    await writeProgress(coursePath, progressData);
    return progressData;
  } catch (error) {
    logger.error('Error initializing progress', {
      error: error.message,
      coursePath,
    });
    throw error;
  }
};
