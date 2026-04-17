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

const formatBytes = (bytes) => {
  if (bytes === 0 || isNaN(bytes)) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const generateHash = (content, filePath) => {
  return crypto
    .createHash('md5')
    .update(content + filePath)
    .digest('hex')
    .slice(0, 8);
};

const processPipeline = async (type, extension, minifierFn, sourceDir, inputs) => {
  console.log(`--- Starting ${type} Pipeline ---`);

  const files = await walk(sourceDir, extension);
  const targetFiles = files.filter(
    (f) => !f.endsWith(`.min${extension}`) && !f.includes('.config.') && !f.endsWith('.backup'),
  );

  if (targetFiles.length === 0) {
    console.log(`No unminified ${extension} files found. Skipping.`);
    return [];
  }

  let totalSaved = 0;
  let successCount = 0;
  let failCount = 0;
  const mappings = [];

  const worker = async (filePath) => {
    try {
      const originalContent = await read(filePath);
      const originalSize = Buffer.byteLength(originalContent, 'utf8');

      const minifiedContent = await minifierFn(originalContent);
      const newSize = Buffer.byteLength(minifiedContent, 'utf8');

      let minFileName = `.min${extension}`;
      if (inputs.hashFiles) {
        const hash = generateHash(minifiedContent, filePath);
        minFileName = `.${hash}.min${extension}`;
      }

      const minFilePath = filePath.replace(new RegExp(`${extension}$`), minFileName);

      if (inputs.generateBackupFile) {
        await copy(filePath, `${filePath}.backup`);
      }

      await write(minFilePath, minifiedContent);

      if (!inputs.keepOriginalFile) {
        await remove(filePath);
      }

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

  await asyncPool(targetFiles, worker, 10);

  console.log(`--- ${type} Pipeline Summary ---`);
  console.log(`Processed: ${successCount} successful, ${failCount} failed.`);
  console.log(`Total space saved: ${formatBytes(totalSaved)}\n`);

  return mappings;
};

const runBuild = async () => {
  const inputs = getInputs();
  const start = performance.now();
  let allMappings = [];

  console.log(
    `Build Settings - CSS: ${inputs.minifyCss ? 'ON' : 'OFF'}, JS: ${inputs.minifyJs ? 'ON' : 'OFF'}\n`,
  );

  if (inputs.minifyCss) {
    const cssMappings = await processPipeline('CSS', '.css', minifyCss, inputs.sourceDir, inputs);
    allMappings = allMappings.concat(cssMappings);
  } else {
    console.log('Skipping CSS Pipeline...\n');
  }

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

  if (allMappings.length > 0) {
    console.log('--- Rewriting Links in HTML/PHP Files ---');
    await rewriteLinks(inputs.sourceDir, allMappings);
    console.log(`Successfully rewrote links for ${allMappings.length} assets.\n`);
  }

  const end = performance.now();
  console.log(`Build completed in ${((end - start) / 1000).toFixed(2)}s`);
};

module.exports = { runBuild };
