"use strict";

const get_existing_repos = require('./lib/get_existing_repos');
const get_status = require('./lib/get_status');
const pull_all = require('./lib/pull_all');
const get_all_branches = require('./lib/get_all_branches');
const track_missing_branches = require('./lib/track_missing_branches');

module.exports = {
  get_existing_repos: get_existing_repos,
  get_status: get_status,
  pull_all: pull_all,
  get_all_branches: get_all_branches,
  track_missing_branches: track_missing_branches
};
