'use strict';

const { getInputs } = require('../config/inputs');
const { walk } = require('../fs/walk');
const { read } = require('../fs/read');
const { write } = require('../fs/write');
const { copy } = require('../fs/copy');
const { minifyCss } = require('./css');
const { minifyJs } = require('./javascript');

const formatBytes = (bytes) => {
  if (bytes === 0 || isNaN(bytes)) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const processPipeline = async (type, extension, minifierFn, sourceDir) => {
  console.log(`--- Starting ${type} Pipeline ---`);

  const files = await walk(sourceDir, extension);

  const targetFiles = files.filter(
    (f) => !f.endsWith(`.min${extension}`) && !f.includes('.config.'),
  );

  if (targetFiles.length === 0) {
    console.log(`No unminified ${extension} files found. Skipping.`);
    return;
  }

  let totalSaved = 0;
  let successCount = 0;
  let failCount = 0;

  await Promise.all(
    targetFiles.map(async (filePath) => {
      try {
        const originalContent = await read(filePath);
        const originalSize = Buffer.byteLength(originalContent, 'utf8');

        const minifiedContent = await minifierFn(originalContent);
        const newSize = Buffer.byteLength(minifiedContent, 'utf8');

        const minFilePath = filePath.replace(new RegExp(`${extension}$`), `.min${extension}`);

        await copy(filePath, `${filePath}.backup`);

        await write(minFilePath, minifiedContent);

        const saved = originalSize - newSize;
        const percent = originalSize > 0 ? ((saved / originalSize) * 100).toFixed(1) : 0;

        totalSaved += saved;
        successCount++;

        console.log(`${filePath} | Saved: ${formatBytes(saved)} (${percent}%)`);
      } catch (error) {
        failCount++;
        console.error(`Failed to process ${filePath}: ${error.message}`);
      }
    }),
  );

  console.log(`--- ${type} Pipeline Summary ---`);
  console.log(`Processed: ${successCount} successful, ${failCount} failed.`);
  console.log(`Total space saved: ${formatBytes(totalSaved)}\n`);
};

const runBuild = async () => {
  const inputs = getInputs();
  const start = performance.now();

  console.log(
    `Build Settings - CSS: ${inputs.minifyCss ? 'ON' : 'OFF'}, JS: ${inputs.minifyJs ? 'ON' : 'OFF'}\n`,
  );

  if (inputs.minifyCss) {
    await processPipeline('CSS', '.css', minifyCss, inputs.sourceDir);
  } else {
    console.log('Skipping CSS Pipeline...\n');
  }

  if (inputs.minifyJs) {
    await processPipeline('JavaScript', '.js', minifyJs, inputs.sourceDir);
  } else {
    console.log('Skipping JavaScript Pipeline...\n');
  }

  const end = performance.now();
  console.log(`Build completed in ${((end - start) / 1000).toFixed(2)}s`);
};

module.exports = { runBuild };
