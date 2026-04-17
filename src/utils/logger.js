'use strict';

// Get current timestamp in 'YYYY-MM-DD HH:MM:SS' format
const getTimestamp = () => new Date().toISOString().replace('T', ' ').split('.')[0];

// Format log message with timestamp
const formatLogMessage = (message) => `[${getTimestamp()}] ${message}`;

// Override console methods
const originalLog = console.log;
const originalError = console.error;
const originalWarn = console.warn;

console.log = (...args) => {
  originalLog(formatLogMessage(args.join(' ')));
};

console.error = (...args) => {
  originalError(formatLogMessage(args.join(' ')));
};

console.warn = (...args) => {
  originalWarn(formatLogMessage(args.join(' ')));
};
