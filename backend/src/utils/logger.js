// Simple logger utility
const LOG_LEVELS = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG',
};

const log = (level, message, meta = {}) => {
  const timestamp = new Date().toISOString();
  const logMessage = {
    timestamp,
    level,
    message,
    ...meta,
  };

  if (level === LOG_LEVELS.ERROR) {
    console.error(JSON.stringify(logMessage, null, 2));
  } else if (level === LOG_LEVELS.WARN) {
    console.warn(JSON.stringify(logMessage, null, 2));
  } else {
    console.log(JSON.stringify(logMessage, null, 2));
  }
};

export const logger = {
  error: (message, meta) => log(LOG_LEVELS.ERROR, message, meta),
  warn: (message, meta) => log(LOG_LEVELS.WARN, message, meta),
  info: (message, meta) => log(LOG_LEVELS.INFO, message, meta),
  debug: (message, meta) => log(LOG_LEVELS.DEBUG, message, meta),
};
