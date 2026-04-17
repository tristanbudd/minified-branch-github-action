'use strict';

const crypto = require('crypto');
const { getInputs } = require('../config/inputs');
const { walk } = require('../fs/walk');
const { read } = require('../fs/read');
const { write } = require('../fs/write');
const { copy } = require('../fs/copy');
const { asyncPool } = require('../utils/pool');
const { remove } = require('../fs/remove');
const { minifyCss } = require('./css');
const { minifyJs } = require('./javascript');
const { rewriteLinks } = require('./rewrite');

/**
 * Formats a byte size into a human-readable string with appropriate units (B, KB, MB).
 * Handles zero and invalid inputs gracefully.
 *
 * @param bytes
 * @returns {string}
 */
const formatBytes = (bytes) => {
  if (bytes === 0 || isNaN(bytes)) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Generates a short hash based on the content and file path.
 * This can be used to create unique filenames for minified assets.
 *
 * @param content
 * @param filePath
 * @returns {string}
 */
const generateHash = (content, filePath) => {
  return crypto
    .createHash('md5')
    .update(content + filePath)
    .digest('hex')
    .slice(0, 8);
};

/**
 * Processes a minification pipeline for a given file type (CSS or JS).
 * It finds all relevant files, minifies them, and handles file operations based on user inputs.
 * Logs detailed information about the process and returns mappings of original to updated paths.
 *
 * @param type
 * @param extension
 * @param minifierFn
 * @param sourceDir
 * @param inputs
 * @returns {Promise<*[]>}
 */
const processPipeline = async (type, extension, minifierFn, sourceDir, inputs) => {
  console.log(`--- Starting ${type} Pipeline ---`);

  // Step 1: Find all relevant files
  const files = await walk(sourceDir, extension);
  const targetFiles = files.filter(
    (f) => !f.endsWith(`.min${extension}`) && !f.includes('.config.') && !f.endsWith('.backup'),
  );

  // Step 2: Check if there are files to process
  if (targetFiles.length === 0) {
    console.log(`No unminified ${extension} files found. Skipping.`);
    return [];
  }

  let totalSaved = 0;
  let successCount = 0;
  let failCount = 0;
  const mappings = [];

  // Step 3: Process files in parallel with a worker function
  const worker = async (filePath) => {
    try {
      const originalContent = await read(filePath);
      const originalSize = Buffer.byteLength(originalContent, 'utf8');

      const minifiedContent = await minifierFn(originalContent);
      const newSize = Buffer.byteLength(minifiedContent, 'utf8');

      // Step 4: Determine the new file name, optionally with a hash
      let minFileName = `.min${extension}`;
      if (inputs.hashFiles) {
        const hash = generateHash(minifiedContent, filePath);
        minFileName = `.${hash}.min${extension}`;
      }

      const minFilePath = filePath.replace(new RegExp(`${extension}$`), minFileName);

      // Step 5: Generate backup if enabled, then write the minified file
      if (inputs.generateBackupFile) {
        await copy(filePath, `${filePath}.backup`);
      }

      await write(minFilePath, minifiedContent);

      if (!inputs.keepOriginalFile) {
        await remove(filePath);
      }

      // Step 6: Store the mapping for link rewriting
      mappings.push({ original: filePath, updated: minFilePath });

      const saved = originalSize - newSize;
      const percent = originalSize > 0 ? ((saved / originalSize) * 100).toFixed(1) : 0;

      totalSaved += saved;
      successCount++;

      console.log(`${filePath} | Saved: ${formatBytes(saved)} (${percent}%)`);
    } catch (error) {
      failCount++;
      console.error(`Failed to process ${filePath}: ${error.message}`);
    }
  };

  // Step 7: Run the worker function with a concurrency limit
  await asyncPool(targetFiles, worker, 10);

  console.log(`--- ${type} Pipeline Summary ---`);
  console.log(`Processed: ${successCount} successful, ${failCount} failed.`);
  console.log(`Total space saved: ${formatBytes(totalSaved)}\n`);

  return mappings;
};

/**
 * Main function to run the build process. It orchestrates the CSS and JS pipelines based on user
 * inputs, collects mappings of original to minified files, and then rewrites links in HTML/PHP
 * files accordingly. Logs detailed information about each step and the overall build time.
 *
 * @returns {Promise<void>}
 */
const runBuild = async () => {
  const inputs = getInputs();
  const start = performance.now();
  let allMappings = [];

  console.log(
    `Build Settings - CSS: ${inputs.minifyCss ? 'ON' : 'OFF'}, JS: ${inputs.minifyJs ? 'ON' : 'OFF'}\n`,
  );

  // Process CSS files if enabled
  if (inputs.minifyCss) {
    const cssMappings = await processPipeline('CSS', '.css', minifyCss, inputs.sourceDir, inputs);
    allMappings = allMappings.concat(cssMappings);
  } else {
    console.log('Skipping CSS Pipeline...\n');
  }

  // Process JS files if enabled
  if (inputs.minifyJs) {
    const jsMappings = await processPipeline(
      'JavaScript',
      '.js',
      minifyJs,
      inputs.sourceDir,
      inputs,
    );
    allMappings = allMappings.concat(jsMappings);
  } else {
    console.log('Skipping JavaScript Pipeline...\n');
  }

  // Rewrite links in HTML/PHP files if there are any mappings
  if (allMappings.length > 0) {
    console.log('--- Rewriting Links in HTML/PHP Files ---');
    await rewriteLinks(inputs.sourceDir, allMappings);
    console.log(`Successfully rewrote links for ${allMappings.length} assets.\n`);
  }

  const end = performance.now();
  console.log(`Build completed in ${((end - start) / 1000).toFixed(2)}s`);
};

module.exports = { runBuild };
