'use strict';

const github = require('@actions/github');
const { getInputs } = require('../config/inputs');

let octokitInstance = null;

/**
 * Returns a singleton instance of the GitHub API client (Octokit).
 * Initializes the client with the provided GitHub token if it hasn't been created yet.
 *
 * @returns {*}
 */
const getClient = () => {
  if (!octokitInstance) {
    const { githubToken } = getInputs();
    octokitInstance = github.getOctokit(githubToken);
  }
  return octokitInstance;
};

const getContext = () => github.context;

module.exports = { getClient, getContext };
