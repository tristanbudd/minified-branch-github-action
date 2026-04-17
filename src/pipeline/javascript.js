'use strict';

const { minify } = require('terser');

const minifyJs = async (content) => {
  try {
    const result = await minify(content, {
      mangle: true,
      compress: {
        passes: 2,
        drop_console: false,
      },
    });

    if (!result.code) {
      throw new Error('Terser returned empty code');
    }

    return result.code;
  } catch (error) {
    throw new Error(`Minification failed: ${error.message}`);
  }
};

module.exports = { minifyJs };
