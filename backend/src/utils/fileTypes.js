// Supported file types and their categories
export const FILE_TYPES = {
  VIDEO: {
    extensions: ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv'],
    category: 'video',
    mimeTypes: {
      '.mp4': 'video/mp4',
      '.webm': 'video/webm',
      '.ogg': 'video/ogg',
      '.mov': 'video/quicktime',
      '.avi': 'video/x-msvideo',
      '.mkv': 'video/x-matroska',
    },
  },
  PDF: {
    extensions: ['.pdf'],
    category: 'pdf',
    mimeTypes: {
      '.pdf': 'application/pdf',
    },
  },
  MARKDOWN: {
    extensions: ['.md', '.markdown'],
    category: 'markdown',
    mimeTypes: {
      '.md': 'text/markdown',
      '.markdown': 'text/markdown',
    },
  },
  HTML: {
    extensions: ['.html', '.htm'],
    category: 'html',
    mimeTypes: {
      '.html': 'text/html',
      '.htm': 'text/html',
    },
  },
  TEXT: {
    extensions: ['.txt'],
    category: 'text',
    mimeTypes: {
      '.txt': 'text/plain',
    },
  },
  IMAGE: {
    extensions: [
      '.jpg',
      '.jpeg',
      '.png',
      '.gif',
      '.bmp',
      '.webp',
      '.svg',
      '.ico',
    ],
    category: 'image',
    mimeTypes: {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.bmp': 'image/bmp',
      '.webp': 'image/webp',
      '.svg': 'image/svg+xml',
      '.ico': 'image/x-icon',
    },
  },
  SUBTITLE: {
    extensions: ['.srt', '.vtt'],
    category: 'subtitle',
    mimeTypes: {
      '.srt': 'text/srt',
      '.vtt': 'text/vtt',
    },
  },
};

// Get all supported extensions
export const getAllSupportedExtensions = () => {
  return Object.values(FILE_TYPES).flatMap((type) => type.extensions);
};

// Get file type category from extension
export const getFileCategory = (filename) => {
  const ext = filename.substring(filename.lastIndexOf('.')).toLowerCase();

  for (const [, typeConfig] of Object.entries(FILE_TYPES)) {
    if (typeConfig.extensions.includes(ext)) {
      return typeConfig.category;
    }
  }

  return null;
};

// Check if file is supported
export const isSupportedFile = (filename) => {
  const ext = filename.substring(filename.lastIndexOf('.')).toLowerCase();
  return getAllSupportedExtensions().includes(ext);
};

// Get MIME type for file
export const getMimeType = (filename) => {
  const ext = filename.substring(filename.lastIndexOf('.')).toLowerCase();

  for (const [, typeConfig] of Object.entries(FILE_TYPES)) {
    if (typeConfig.mimeTypes[ext]) {
      return typeConfig.mimeTypes[ext];
    }
  }

  return 'application/octet-stream';
};
