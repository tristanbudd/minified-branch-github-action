'use strict';

const core = require('@actions/core');
require('./utils/logger');
const { getInputs } = require('./config/inputs');
const { runBuild } = require('./pipeline/build');
const { pushToBranch } = require('./github/branch');

const main = async () => {
  try {
    const startTime = performance.now();
    core.info('Starting Minified Branch GitHub Action...');

    core.startGroup('Action Configuration');
    const inputs = getInputs();
    core.info(`Target Branch: ${inputs.targetBranch}`);
    core.info(`Source Directory: ${inputs.sourceDir}`);
    core.info(`Minify CSS: ${inputs.minifyCss ? 'Enabled' : 'Disabled'}`);
    core.info(`Minify JS: ${inputs.minifyJs ? 'Enabled' : 'Disabled'}`);
    core.endGroup();

    core.startGroup('Minification Pipeline');

    await runBuild();
    core.endGroup();

    core.startGroup('Git Deployment');
    await pushToBranch();
    core.endGroup();

    core.setOutput('target_branch', inputs.targetBranch);
    core.setOutput('timestamp', new Date().toISOString());

    await core.summary
      .addHeading('Minification Pipeline Results')
      .addTable([
        [
          { data: 'Pipeline', header: true },
          { data: 'Status', header: true },
        ],
        ['CSS', inputs.minifyCss ? 'Processed' : 'Skipped'],
        ['JavaScript', inputs.minifyJs ? 'Processed' : 'Skipped'],
      ])
      .addLink('Action Repository', 'https://github.com/tristanbudd/minified-branch-github-action')
      .write();

    const endTime = performance.now();
    core.info(`Pipeline completed successfully in ${((endTime - startTime) / 1000).toFixed(2)}s!`);
  } catch (error) {
    core.setFailed(`Action failed: ${error.message}`);

    if (error.stack) {
      core.debug(error.stack);
    }
  }
};

main().then(() => {});
