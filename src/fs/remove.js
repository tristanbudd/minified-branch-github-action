'use strict';

const { unlink } = require('fs/promises');

/**
 * Removes a file at the specified path.
 * Handles errors gracefully and logs them.
 *
 * @param filePath
 * @returns {Promise<void>}
 */
const remove = async (filePath) => {
  try {
    await unlink(filePath);
  } catch (error) {
    console.error(`Failed to remove file: ${filePath}`);
    throw error;
  }
};

module.exports = { remove };
