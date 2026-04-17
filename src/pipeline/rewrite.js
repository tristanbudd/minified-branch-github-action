'use strict';

const { walk } = require('../fs/walk');
const { read } = require('../fs/read');
const { write } = require('../fs/write');
const path = require('path');

const rewriteLinks = async (sourceDir, mappings) => {
  const htmlFiles = await walk(sourceDir, '.html');
  const phpFiles = await walk(sourceDir, '.php');
  const targetFiles = [...htmlFiles, ...phpFiles];

  if (targetFiles.length === 0) return;

  await Promise.all(
    targetFiles.map(async (filePath) => {
      let content = await read(filePath);
      let modified = false;

      for (const { original, updated } of mappings) {
        const originalName = path.basename(original);
        const updatedName = path.basename(updated);

        const escapeRegExp = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const safeOriginalName = escapeRegExp(originalName);

        const regex = new RegExp(`(["'])(.*?)(${safeOriginalName})(\\?.*?)?\\1`, 'g');

        if (regex.test(content)) {
          content = content.replace(regex, (match, p1, p2, p3, p4) => {
            const query = p4 || '';
            return `${p1}${p2}${updatedName}${query}${p1}`;
          });
          modified = true;
        }
      }

      if (modified) {
        await write(filePath, content);
      }
    }),
  );
};

module.exports = { rewriteLinks };
