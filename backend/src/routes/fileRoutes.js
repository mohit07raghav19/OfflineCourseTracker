import express from 'express';
import { serveFileController } from '../controllers/fileController.js';
import { asyncHandler } from '../utils/errorHandler.js';

const router = express.Router();

// GET /api/files/:courseId/* - Serve a file from course directory
router.get('/:courseId/*', asyncHandler(serveFileController));

export default router;
