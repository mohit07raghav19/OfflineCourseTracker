import path from 'path';

// Validate that a path is safe and accessible
export const validatePath = (inputPath) => {
  if (!inputPath || typeof inputPath !== 'string') {
    return { valid: false, error: 'Invalid path provided' };
  }

  // Normalize the path
  const normalizedPath = path.normalize(inputPath);

  // Check if path is absolute
  if (!path.isAbsolute(normalizedPath)) {
    return { valid: false, error: 'Path must be absolute' };
  }

  return { valid: true, path: normalizedPath };
};

// Sanitize filename to prevent path traversal
export const sanitizeFilename = (filename) => {
  return filename.replace(/[^a-zA-Z0-9._-]/g, '_');
};

// Check if path is a subdirectory of another path
export const isSubdirectory = (parent, child) => {
  const relative = path.relative(parent, child);
  return relative && !relative.startsWith('..') && !path.isAbsolute(relative);
};
