'use strict';

const { writeFile } = require('fs/promises');

const write = async (filePath, content) => {
  try {
    await writeFile(filePath, content, 'utf8');
  } catch (error) {
    console.error(`Failed to write file: ${filePath}`);
    throw error;
  }
};

module.exports = { write };
