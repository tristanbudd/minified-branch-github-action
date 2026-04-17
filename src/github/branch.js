'use strict';

const exec = require('@actions/exec');
const core = require('@actions/core');
const { getInputs } = require('../config/inputs');
const { writeFile } = require('fs/promises');
const path = require('path');

const pushToBranch = async () => {
  const { targetBranch, commitMessage, dryRun, forcePush } = getInputs();

  core.info('Configuring git user identity...');
  await exec.exec('git', ['config', '--global', 'user.name', 'github-actions[bot]']);
  await exec.exec('git', [
    'config',
    '--global',
    'user.email',
    'github-actions[bot]@users.noreply.github.com',
  ]);

  await exec.exec('git', ['config', '--global', '--add', 'safe.directory', process.cwd()]);

  core.info(`Switching/Creating target branch: ${targetBranch}`);

  await exec.exec('git', ['checkout', '-B', targetBranch]);

  try {
    await writeFile(path.join(process.cwd(), '.nojekyll'), '');
    core.info('Added .nojekyll file.');
  } catch (err) {
    core.warning(`Could not create .nojekyll: ${err.message}`);
  }

  core.info('Staging modified files...');

  await exec.exec('git', ['add', '-A']);

  const exitCode = await exec.exec('git', ['diff', '--staged', '--quiet'], {
    ignoreReturnCode: true,
  });

  if (exitCode === 0) {
    core.info('No changes detected compared to existing branch. Skipping commit.');
    return;
  }

  core.info(`Committing changes: ${commitMessage}`);
  await exec.exec('git', ['commit', '-m', commitMessage]);

  if (dryRun) {
    core.info('Dry run enabled. Skipping git push.');
    return;
  }

  core.info(`Pushing to origin/${targetBranch}...`);
  const pushArgs = ['push'];
  if (forcePush) {
    pushArgs.push('-f');
  }
  pushArgs.push('origin', targetBranch);

  await exec.exec('git', pushArgs);
  core.info('Branch deployment completed successfully.');
};

module.exports = { pushToBranch };
