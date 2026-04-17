'use strict';

const { copyFile } = require('fs/promises');
const path = require('path');
const fs = require('fs');

const copy = async (source, destination) => {
  try {
    const destDir = path.dirname(destination);

    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }

    await copyFile(source, destination);
  } catch (error) {
    console.error(`Failed to copy file from ${source} to ${destination}`);
    throw error;
  }
};

module.exports = { copy };
