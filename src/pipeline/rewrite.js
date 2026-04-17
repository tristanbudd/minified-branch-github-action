'use strict';

const { walk } = require('../fs/walk');
const { read } = require('../fs/read');
const { write } = require('../fs/write');
const { asyncPool } = require('../utils/pool');
const path = require('path');

/**
 * Rewrites links in HTML and PHP files based on the provided mappings.
 * It searches for asset references in the content and updates them to point to the new minified
 * versions. The function processes files concurrently with a limit to optimize performance while
 * avoiding resource exhaustion.
 *
 * @param sourceDir
 * @param mappings
 * @returns {Promise<void>}
 */
const rewriteLinks = async (sourceDir, mappings) => {
  const htmlFiles = await walk(sourceDir, '.html');
  const phpFiles = await walk(sourceDir, '.php');
  const targetFiles = [...htmlFiles, ...phpFiles];

  if (targetFiles.length === 0) return;

  // Worker function to process each file and rewrite links based on mappings
  const worker = async (filePath) => {
    try {
      let content = await read(filePath);
      let modified = false;

      // Iterate through each mapping and create a regex to find references to the original filename
      for (const { original, updated } of mappings) {
        const originalName = path.basename(original);
        const updatedName = path.basename(updated);

        // Escape special characters in the original filename for use in the regex
        const escapeRegExp = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const safeOriginalName = escapeRegExp(originalName);

        // Regex to match asset references in the content, accounting for optional query parameters
        const regex = new RegExp(`(["'])(?:.*?/)?${safeOriginalName}(\\?.*?)?\\1`, 'g');

        // If the regex matches, replace the original filename with the updated filename while
        // preserving any directory structure and query parameters
        if (regex.test(content)) {
          content = content.replace(regex, (match, quote, query) => {
            modified = true;
            const dirMatch = match.match(new RegExp(`${quote}(.*?)${safeOriginalName}`));
            const prefix = dirMatch ? dirMatch[1] : '';
            return `${quote}${prefix}${updatedName}${query || ''}${quote}`;
          });
        }
      }

      if (modified) {
        await write(filePath, content);
      }
    } catch (error) {
      console.error(`Failed to rewrite links in ${filePath}: ${error.message}`);
    }
  };

  // Run the worker function with a concurrency limit of 10 to process files efficiently
  await asyncPool(targetFiles, worker, 10);
};

module.exports = { rewriteLinks };
