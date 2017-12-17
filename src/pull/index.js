"use strict";

const get_existing_repos = require('./lib/get_existing_repos');
const get_status = require('./lib/get_status');
const pull_all = require('./lib/pull_all');

module.exports = {
  get_existing_repos: get_existing_repos,
  get_status: get_status,
  pull_all: pull_all
};
