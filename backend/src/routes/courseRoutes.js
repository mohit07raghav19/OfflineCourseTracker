import express from 'express';
import {
  loadCourseController,
  getCourseStructureController,
  getCourseController,
} from '../controllers/courseController.js';
import { asyncHandler } from '../utils/errorHandler.js';

const router = express.Router();

// POST /api/course/load - Load a course from directory
router.post('/load', asyncHandler(loadCourseController));

// GET /api/course/:courseId - Get course details
router.get('/:courseId', asyncHandler(getCourseController));

// GET /api/course/:courseId/structure - Get course structure
router.get('/:courseId/structure', asyncHandler(getCourseStructureController));

export default router;
