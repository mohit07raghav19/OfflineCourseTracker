import express from 'express';
import {
  getProgressController,
  updateProgressController,
  toggleCompletionController,
} from '../controllers/progressController.js';
import { asyncHandler } from '../utils/errorHandler.js';

const router = express.Router();

// GET /api/progress/:courseId - Get progress for a course
router.get('/:courseId', asyncHandler(getProgressController));

// POST /api/progress/:courseId - Update progress for a file
router.post('/:courseId', asyncHandler(updateProgressController));

// POST /api/progress/:courseId/toggle - Toggle completion status
router.post('/:courseId/toggle', asyncHandler(toggleCompletionController));

export default router;
