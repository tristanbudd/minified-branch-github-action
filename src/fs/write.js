'use strict';

const { writeFile } = require('fs/promises');

/**
 * Writes content to a file at the specified path.
 * Handles errors gracefully and logs them.
 *
 * @param filePath
 * @param content
 * @returns {Promise<void>}
 */
const write = async (filePath, content) => {
  try {
    await writeFile(filePath, content, 'utf8');
  } catch (error) {
    console.error(`Failed to write file: ${filePath}`);
    throw error;
  }
};

module.exports = { write };
