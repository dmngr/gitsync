#!/usr/bin/env node

"use strict";

var Promise = require('bluebird');

const exec = Promise.promisify(require('child_process').exec);
const find = Promise.promisifyAll(require('find'));
const homedir = require('os').homedir();
const colors = require('colors/safe');

const Clone = require('./src/clone');
const clone = new Clone();

const pull = require('./src/pull');

// console.log('clone:', clone.clone_repo);

module.exports = function() {
  // get all local and remote repos
  return Promise.all([
      clone.get_all_repos_names('dmngr', true, 'ioanniswd'),
      pull.get_existing_repos()
    ])
    // clone all remotes that do not exist locally
    .then(results => {
      var remote_repos = results[0];
      var local_repos = results[1];

      // remove local repos from remote repos
      remote_repos = remote_repos.filter(remote_repo => local_repos.findIndex(local_repo => {
        // console.log('local_repo:', local_repo);
        // console.log('remote_repo: ', remote_repo);
        return local_repo.indexOf(remote_repo.name) === -1;
      }) === -1);

      // console.log('remote_repos:', remote_repos);
      // console.log('local_repos:', local_repos);

      console.log('cloning repos');
      return Promise.map(remote_repos, clone.clone_repo)
        .then(() => Promise.resolve(local_repos));

    })
    // pull all local repos that need to update
    .then(local_repos => {
      console.log('local_repos:', local_repos.length);
      process.exit();
    })
    .catch(err => {
      console.log(err);
      process.exit(1);
    });
};
