import {
  readProgress,
  updateFileProgress,
  toggleCompletion,
} from '../services/progressService.js';
import { getCoursePath } from '../services/courseService.js';
import { NotFoundError, ValidationError } from '../utils/errorHandler.js';

// Get progress for a course
export const getProgressController = async (req, res) => {
  const { courseId } = req.params;

  const coursePath = getCoursePath(courseId);
  if (!coursePath) {
    throw new NotFoundError('Course not found');
  }

  const progressData = await readProgress(coursePath);

  res.json({
    success: true,
    data: progressData,
  });
};

// Update progress for a file
export const updateProgressController = async (req, res) => {
  const { courseId } = req.params;
  const { filePath, completed, lastPosition, duration, scrollPosition } =
    req.body;

  if (!filePath) {
    throw new ValidationError('File path is required');
  }

  const coursePath = getCoursePath(courseId);
  if (!coursePath) {
    throw new NotFoundError('Course not found');
  }

  const progressUpdate = {
    ...(completed !== undefined && { completed }),
    ...(lastPosition !== undefined && { lastPosition }),
    ...(duration !== undefined && { duration }),
    ...(scrollPosition !== undefined && { scrollPosition }),
  };

  const progressData = await updateFileProgress(
    coursePath,
    filePath,
    progressUpdate
  );

  res.json({
    success: true,
    message: 'Progress updated successfully',
    data: progressData,
  });
};

// Toggle completion status
export const toggleCompletionController = async (req, res) => {
  const { courseId } = req.params;
  const { filePath } = req.body;

  if (!filePath) {
    throw new ValidationError('File path is required');
  }

  const coursePath = getCoursePath(courseId);
  if (!coursePath) {
    throw new NotFoundError('Course not found');
  }

  const fileProgress = await toggleCompletion(coursePath, filePath);

  res.json({
    success: true,
    message: 'Completion status toggled',
    data: fileProgress,
  });
};
