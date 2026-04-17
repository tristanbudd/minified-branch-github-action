'use strict';

const exec = require('@actions/exec');
const core = require('@actions/core');
const { getInputs } = require('../config/inputs');

const pushToBranch = async () => {
  const { targetBranch, commitMessage, dryRun, forcePush } = getInputs();

  await exec.exec('git', ['config', '--global', 'user.name', 'github-actions[bot]']);
  await exec.exec('git', [
    'config',
    '--global',
    'user.email',
    'github-actions[bot]@users.noreply.github.com',
  ]);

  await exec.exec('git', ['checkout', '-B', targetBranch]);

  await exec.exec('git', ['rm', '-rf', '.', '--ignore-unmatch']);

  await exec.exec('git', ['add', '.']);

  const exitCode = await exec.exec('git', ['diff', '--staged', '--quiet'], {
    ignoreReturnCode: true,
  });

  if (exitCode === 0) {
    core.info('No changes detected. Skipping commit.');
    return;
  }

  await exec.exec('git', ['commit', '-m', commitMessage]);

  if (dryRun) {
    core.info('Dry run enabled. Skipping git push.');
    return;
  }

  const pushArgs = ['push'];
  if (forcePush) {
    pushArgs.push('-f');
  }
  pushArgs.push('origin', targetBranch);

  await exec.exec('git', pushArgs);
};

module.exports = { pushToBranch };
