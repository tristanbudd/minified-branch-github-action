'use strict';

const { readFile } = require('fs/promises');

/**
 * Reads the content of a file at the specified path and returns it as a string.
 * Handles errors gracefully and logs them.
 *
 * @param filePath
 * @returns {Promise<string>}
 */
const read = async (filePath) => {
  try {
    return await readFile(filePath, 'utf8');
  } catch (error) {
    console.error(`Failed to read file: ${filePath}`);
    throw error;
  }
};

module.exports = { read };
