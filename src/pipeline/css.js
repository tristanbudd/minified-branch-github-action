'use strict';

const CleanCSS = require('clean-css');

/**
 * Minifies CSS content using clean-css.
 * Handles errors gracefully and logs warnings.
 *
 * @param content
 * @returns {Promise<*>}
 */
const minifyCss = async (content) => {
  const output = new CleanCSS({
    returnPromise: true,
    level: 2,
  }).minify(content);

  const result = await output;

  if (result.errors.length > 0) {
    throw new Error(result.errors.join('\n'));
  }

  if (result.warnings.length > 0) {
    result.warnings.forEach((warning) => console.warn(warning));
  }

  return result.styles;
};

module.exports = { minifyCss };
