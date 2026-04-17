'use strict';

const core = require('@actions/core');
require('./utils/logger');
const { getInputs } = require('./config/inputs');
const { runBuild } = require('./pipeline/build');
const { pushToBranch } = require('./github/branch');

/**
 * Main function that orchestrates the entire action workflow.
 * It reads inputs, runs the minification pipeline, pushes changes to the target branch,
 * and sets outputs for use in subsequent steps. It also handles errors gracefully and logs
 * detailed information about the process.
 *
 * @returns {Promise<void>}
 */
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

    // Run the build process which includes minification and file handling based on inputs
    await runBuild();
    core.endGroup();

    // Push changes to the target branch if there are any
    core.startGroup('Git Deployment');
    await pushToBranch();
    core.endGroup();

    core.setOutput('target_branch', inputs.targetBranch);
    core.setOutput('timestamp', new Date().toISOString());

    // Add a summary of the pipeline results to the GitHub Actions summary tab
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

    // Log the total execution time of the pipeline
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
