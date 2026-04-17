'use strict';

const github = require('@actions/github');
const { getInputs } = require('../config/inputs');

let octokitInstance = null;

const getClient = () => {
  if (!octokitInstance) {
    const { githubToken } = getInputs();
    octokitInstance = github.getOctokit(githubToken);
  }
  return octokitInstance;
};

const getContext = () => github.context;

module.exports = { getClient, getContext };
