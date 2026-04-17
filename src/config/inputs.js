'use strict';

const core = require('@actions/core');

// Function to get and validate inputs from the GitHub Action workflow
const getInputs = () => {
  return {
    githubToken: core.getInput('github_token', { required: true }),
    targetBranch: core.getInput('target_branch') || 'production',
    sourceDir: core.getInput('source_dir') || '.',
    commitMessage: core.getInput('commit_message') || 'chore: automated asset minification',

    minifyCss: core.getInput('minify_css') === 'true',
    minifyJs: core.getInput('minify_js') === 'true',
  };
};

module.exports = { getInputs };
