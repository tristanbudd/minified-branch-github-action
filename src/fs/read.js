'use strict';

const { readFile } = require('fs/promises');

const read = async (filePath) => {
  try {
    return await readFile(filePath, 'utf8');
  } catch (error) {
    console.error(`Failed to read file: ${filePath}`);
    throw error;
  }
};

module.exports = { read };
