'use strict';

const core = require('@actions/core');

const parseBoolean = (input, defaultValue) => {
  if (input === undefined || input === '') return defaultValue;
  return input.trim().toLowerCase() === 'true';
};

const parseArray = (input, defaultArray = []) => {
  if (!input || input.trim() === '') return defaultArray;
  return input
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
};

const getInputs = () => {
  try {
    const inputs = {
      githubToken: core.getInput('github_token', { required: true }),
      targetBranch: core.getInput('target_branch') || 'production',
      sourceDir: core.getInput('source_dir') || '.',
      commitMessage: core.getInput('commit_message') || 'chore: automated asset minification',

      minifyCss: parseBoolean(core.getInput('minify_css'), true),
      minifyJs: parseBoolean(core.getInput('minify_js'), true),

      excludeDirs: parseArray(core.getInput('exclude_dirs'), ['node_modules', '.git', 'dist']),
      dryRun: parseBoolean(core.getInput('dry_run'), false),
      forcePush: parseBoolean(core.getInput('force_push'), true),

      keepOriginalFile: parseBoolean(core.getInput('keep_original_file'), false),
      generateBackupFile: parseBoolean(core.getInput('generate_backup_file'), true),

      hashFiles: parseBoolean(core.getInput('hash_files'), false),
    };

    if (inputs.sourceDir.startsWith('/')) {
      core.warning(
        'The source_dir appears to be an absolute path. A relative path is recommended.',
      );
    }

    if (!inputs.minifyCss && !inputs.minifyJs) {
      core.warning(
        'Both CSS and JS minification are disabled. The pipeline will not modify any files.',
      );
    }

    if (inputs.dryRun) {
      core.info(
        'Dry run is enabled. Files will be minified but no git commits or pushes will occur.',
      );
    }

    return inputs;
  } catch (error) {
    core.setFailed(`Failed to parse workflow inputs: ${error.message}`);
    throw error;
  }
};

module.exports = { getInputs };
