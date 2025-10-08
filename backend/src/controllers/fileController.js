import fs from 'fs-extra';
import path from 'path';
import { getCoursePath } from '../services/courseService.js';
import { fileExists } from '../services/fileSystemService.js';
import { getMimeType } from '../utils/fileTypes.js';
import { NotFoundError, ValidationError } from '../utils/errorHandler.js';
import { logger } from '../utils/logger.js';

// Serve a file from course directory
export const serveFileController = async (req, res) => {
  const { courseId } = req.params;
  const filePath = req.params[0]; // Capture everything after /api/files/:courseId/

  if (!filePath) {
    throw new ValidationError('File path is required');
  }

  const coursePath = getCoursePath(courseId);
  if (!coursePath) {
    throw new NotFoundError('Course not found');
  }

  // Construct absolute file path
  const absoluteFilePath = path.join(coursePath, filePath);

  // Security check: ensure file is within course directory
  if (!absoluteFilePath.startsWith(coursePath)) {
    throw new ValidationError('Invalid file path');
  }

  // Check if file exists
  const exists = await fileExists(absoluteFilePath);
  if (!exists) {
    throw new NotFoundError('File not found');
  }

  try {
    const stats = await fs.stat(absoluteFilePath);

    // Set headers
    const mimeType = getMimeType(absoluteFilePath);
    res.setHeader('Content-Type', mimeType);
    res.setHeader('Accept-Ranges', 'bytes');

    // Handle range requests (for video seeking)
    const range = req.headers.range;

    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : stats.size - 1;
      const chunkSize = end - start + 1;

      res.status(206);
      res.setHeader('Content-Range', `bytes ${start}-${end}/${stats.size}`);
      res.setHeader('Content-Length', chunkSize);

      const stream = fs.createReadStream(absoluteFilePath, { start, end });
      stream.pipe(res);
    } else {
      // Serve entire file
      res.setHeader('Content-Length', stats.size);
      const stream = fs.createReadStream(absoluteFilePath);
      stream.pipe(res);
    }
  } catch (error) {
    logger.error('Error serving file', {
      error: error.message,
      filePath: absoluteFilePath,
    });
    throw error;
  }
};
