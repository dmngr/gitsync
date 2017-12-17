"use strict";

var Promise = require('bluebird');

const exec = Promise.promisify(require('child_process').exec, {
  multiArgs: true
});
const home = require('os').homedir();

const is_path_valid = require('./is_path_valid');

/**
 * Clones a repo in path specified if path is valid. Else, clones to cwd
 * @module
 */
/**
 *
 * @param  {object} repo Repository info
 * @param  {string} repo.name
 * @param  {string} repo.full_name
 * @param  {string} repo.local_path local path to which the repo will be cloned
 * @param  {string} at   Github authentication token
 * @return {Promise} Resolves to the path under which the repo was cloned
 */
module.exports = function(repo, at) {
  var path = "";
  var url = 'https://';

  if (is_path_valid(repo.local_path)) path += `${repo.local_path}/${repo.name}`;
  if (at) url += `${at}@`;

  url += `github.com/${repo.full_name}.git`;
  return exec(`git clone -o upstream "${url}" ${path}`)
    .spread((stdout, stderr) => {
      if (stderr) console.log(stderr);
      console.log(stdout);
      return Promise.resolve(path);
    });
};
