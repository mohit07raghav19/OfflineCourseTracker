import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import {
  scanDirectory,
  getTotalFileCount,
  flattenFileStructure,
} from './fileSystemService.js';
import { readProgress, initializeProgress } from './progressService.js';
import { logger } from '../utils/logger.js';

// Store for loaded courses (in-memory for this session)
const coursesStore = new Map();

// Load a course from a directory path
export const loadCourse = async (coursePath) => {
  try {
    logger.info('Loading course', { coursePath });

    // Scan directory structure
    const structure = await scanDirectory(coursePath);

    // Generate course ID
    const courseId = uuidv4();

    // Count total files
    const totalFiles = getTotalFileCount(structure);

    // Create course object
    const course = {
      id: courseId,
      name: path.basename(coursePath),
      path: coursePath,
      structure: structure,
      totalFiles: totalFiles,
      createdAt: new Date().toISOString(),
      lastAccessed: new Date().toISOString(),
    };

    // Store course in memory
    coursesStore.set(courseId, course);

    // Read or initialize progress
    let progressData = await readProgress(coursePath);
    if (!progressData.courseId) {
      progressData = await initializeProgress(courseId, coursePath, totalFiles);
    } else {
      // Update course ID and statistics
      progressData.courseId = courseId;
      progressData.statistics.totalFiles = totalFiles;
    }

    logger.info('Course loaded successfully', {
      courseId,
      totalFiles,
    });

    return {
      course,
      progress: progressData,
    };
  } catch (error) {
    logger.error('Error loading course', {
      error: error.message,
      coursePath,
    });
    throw error;
  }
};

// Get course by ID
export const getCourse = (courseId) => {
  return coursesStore.get(courseId);
};

// Get course structure
export const getCourseStructure = (courseId) => {
  const course = coursesStore.get(courseId);
  if (!course) {
    return null;
  }
  return course.structure;
};

// Get all files in course (flattened)
export const getCourseFiles = (courseId) => {
  const course = coursesStore.get(courseId);
  if (!course) {
    return null;
  }
  return flattenFileStructure(course.structure);
};

// Get course path
export const getCoursePath = (courseId) => {
  const course = coursesStore.get(courseId);
  return course ? course.path : null;
};

// Update last accessed timestamp
export const updateCourseAccess = (courseId) => {
  const course = coursesStore.get(courseId);
  if (course) {
    course.lastAccessed = new Date().toISOString();
    coursesStore.set(courseId, course);
  }
};
