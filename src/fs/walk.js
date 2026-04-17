'use strict';

const { readdir } = require('fs/promises');
const path = require('path');
const { getInputs } = require('../config/inputs');

const walk = async (dir, extension, fileList = []) => {
  const { excludeDirs } = getInputs();
  const files = await readdir(dir, { withFileTypes: true });

  for (const file of files) {
    const filePath = path.join(dir, file.name);

    if (file.isDirectory() && !excludeDirs.includes(file.name)) {
      await walk(filePath, extension, fileList);
    } else if (file.isFile() && file.name.endsWith(extension)) {
      fileList.push(filePath);
    }
  }

  return fileList;
};

module.exports = { walk };
