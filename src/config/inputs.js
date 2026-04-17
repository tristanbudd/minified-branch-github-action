'use strict';

const core = require('@actions/core');

/**
 * Parses a string input into a boolean value. If the input is undefined or empty, returns the
 * provided default value.
 *
 * @param input
 * @param defaultValue
 * @returns {*|boolean}
 */
const parseBoolean = (input, defaultValue) => {
  if (input === undefined || input === '') return defaultValue;
  return input.trim().toLowerCase() === 'true';
};

/**
 * Parses a comma-separated string input into an array of trimmed strings. If the input is
 * undefined or empty, returns the provided default array.
 *
 * @param input
 * @param defaultArray
 * @returns {(*|string)[]|*[]}
 */
const parseArray = (input, defaultArray = []) => {
  if (!input || input.trim() === '') return defaultArray;
  return input
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
};

/**
 * Reads and validates all workflow inputs, applying default values where necessary. Also logs
 * warnings for potentially misconfigured inputs.
 *
 * @returns {{githubToken: string, sourceDir: (string|string), targetBranch: (string|string),
 * keepOriginalFile: (*|boolean), dryRun: (*|boolean), commitMessage: (string|string),
 * generateBackupFile: (*|boolean), hashFiles: (*|boolean), minifyCss: (*|boolean),
 * forcePush: (*|boolean), minifyJs: (*|boolean), excludeDirs: ((*|string)[]|*[])}}
 */
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
