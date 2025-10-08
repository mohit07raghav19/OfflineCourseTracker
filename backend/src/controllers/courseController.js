import { loadCourse, getCourseStructure, getCourse } from '../services/courseService.js';
import { validatePath } from '../utils/pathValidator.js';
import { ValidationError, NotFoundError } from '../utils/errorHandler.js';

// Load a course from directory
export const loadCourseController = async (req, res) => {
  const { path } = req.body;

  // Validate path
  const validation = validatePath(path);
  if (!validation.valid) {
    throw new ValidationError(validation.error);
  }

  // Load course
  const result = await loadCourse(validation.path);

  res.json({
    success: true,
    data: result,
  });
};

// Get course structure
export const getCourseStructureController = async (req, res) => {
  const { courseId } = req.params;

  const structure = getCourseStructure(courseId);

  if (!structure) {
    throw new NotFoundError('Course not found');
  }

  res.json({
    success: true,
    data: structure,
  });
};

// Get course details
export const getCourseController = async (req, res) => {
  const { courseId } = req.params;

  const course = getCourse(courseId);

  if (!course) {
    throw new NotFoundError('Course not found');
  }

  res.json({
    success: true,
    data: course,
  });
};
