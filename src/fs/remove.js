'use strict';

const { unlink } = require('fs/promises');

const remove = async (filePath) => {
  try {
    await unlink(filePath);
  } catch (error) {
    console.error(`Failed to remove file: ${filePath}`);
    throw error;
  }
};

module.exports = { remove };
