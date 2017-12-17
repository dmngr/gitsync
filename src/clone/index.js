"use strict";

const clone_repo = require('./lib/clone_repo');
const get_all_repos_names = require('./lib/get_all_repos_names');
const is_path_valid = require('./lib/is_path_valid');
const init_cred = require('./lib/init_cred');

module.exports = {
  clone_repo: clone_repo,
  get_all_repos_names: get_all_repos_names,
  is_path_valid: is_path_valid,
  init_cred: init_cred,
  clone_all: repos_names => {

  }
};
