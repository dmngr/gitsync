#!/usr/bin/env node

"use strict";

var Promise = require('bluebird');

const exec = Promise.promisify(require('child_process').exec);
const find = Promise.promisifyAll(require('find'));
const homedir = require('os').homedir();
const colors = require('colors/safe');
const path = require('path');
const minimist = require('minimist');
const _ = require('lodash');

const Clone = require('./src/clone');
const clone = new Clone();

const pull = require('./src/pull');

// console.log('clone:', clone.clone_repo);

module.exports = function() {

  process.env.UV_THREADPOOL_SIZE = 10;

  var args = minimist(process.argv.slice(2), {
    boolean: ['all', 'pull', 'clone']
  });

  var start = process.hrtime();

  var invalid_desc_repos = [];
  var err_repos = [];

  // util
  function pull_local(local_repos) {
    console.log('local_repos:', local_repos.length);
    // var root_dir = process.cwd();
    // console.log('root_dir:', root_dir);

    return Promise.map(local_repos, repo_path => {
      // console.log('repo_path:', repo_path);
      var full_path = path.resolve(repo_path);

      return pull.get_status(full_path)
        .then(status => {
          switch (status) {
            case 'fast-forward':
              return pull.pull_all(full_path)
                .catch(err => {
                  console.log(colors.red(`Repo ${full_path} could not pull\n`));
                  err_repos.push(repo_path);
                  return;
                });
            case 'diverged':
              console.log(colors.red(`Repo ${full_path} has diverged\n`));
              return;
            case 'ahead':
              console.log(colors.rainbow(`Repo ${full_path} is ahead of remote\n`));
              return;
            case 'no-remote':
              console.log(colors.yellow(`Repo ${full_path} has no remote\n`));
              return;
            case 'unsaved-changes':
              console.log(colors.red(`Repo ${full_path} has unsaved-changes\n`));
              return;
            default:
              console.log(colors.green(`Repo ${full_path} is up-to-date\n`));
              return;
          }
        });
    }, {
      concurrency: 20
    });
  }

  function filter_repos(remote_repos, local_repos) {
    var repos_to_clone = [];
    // remove local repos from remote repos

    remote_repos = _.filter(remote_repos, remote_repo => local_repos.findIndex(local_repo => local_repo.slice(local_repo.lastIndexOf('/') !== -1 ? (local_repo.lastIndexOf('/') + 1) : 0) === remote_repo.name) === -1);

    remote_repos.forEach(repo => {
      // console.log('repo.local_path:', repo.local_path);
      if (repo.local_path && clone.is_path_valid(repo.local_path)) {
        console.log('valid repo desc:', colors.green(repo.local_path));
        repos_to_clone.push(repo);

      } else if (!repo.local_path || repo.local_path.indexOf('ignore:') === -1) {
        console.log('invalid repo desc:', colors.red(repo.local_path));
        invalid_desc_repos.push(repo);
      }
    });

    console.log('remote_repos:', repos_to_clone.length);
    console.log('local_repos:', local_repos.length);

    return {
      remote_repos: repos_to_clone,
      local_repos: local_repos
    };
  }
  //

  function all() {
    return Promise.all([
        clone.get_all_repos_names('dmngr', true, 'ioanniswd'),
        pull.get_existing_repos()
      ])
      // clone all remotes that do not exist locally
      .then(results => {
        var remote_repos = results[0];
        var local_repos = results[1];

        var filtered_repos = filter_repos(remote_repos, local_repos);

        // used for testing
        // return local_repos;

        console.log('cloning repos');
        return Promise.map(filtered_repos.remote_repos, clone.clone_repo)
          .then(() => Promise.resolve(filtered_repos.local_repos));

      })
      // pull all local repos that need to update
      .then(pull_local);
  }

  function pull_repos() {
    return pull.get_existing_repos()
      .then(pull_local);
  }

  function clone_repos() {
    return Promise.all([
        clone.get_all_repos_names('dmngr', true, 'ioanniswd'),
        pull.get_existing_repos()
      ])
      // clone all remotes that do not exist locally
      .then(results => {
        var remote_repos = results[0];
        var local_repos = results[1];

        var filtered_repos = filter_repos(remote_repos, local_repos);


        // used for testing
        // return local_repos;

        console.log('cloning repos');
        return Promise.map(filtered_repos.remote_repos, clone.clone_repo);
      });
  }


  Promise.try(function() {
    switch (true) {
      case args.all:
        return all();
      case args.pull:
        return pull_repos();
      case args.clone:
        return clone_repos();
      default:
        return Promise.reject('Arguments required: --pull to pull repos, --clone to clone repos, --all to both pull and clone');
    }
  }).then(() => {

    if (invalid_desc_repos.length > 0) {
      console.log(colors.red('Invalid Description Repos:'));
      invalid_desc_repos.forEach(repo => {
        console.log(`Repo Name: ${repo.name}`);
        console.log(`Description: ${repo.local_path}`);
      });
    }

    if (err_repos.length > 0) {
      console.log(colors.red('Repos that returned error:'));
      console.log(err_repos);
    }

    console.log('Success');
    console.log('seconds:', process.hrtime(start)[0]);
    process.exit();
  }).catch(err => {
    console.log(err);
    console.log('seconds:', process.hrtime(start)[0]);
    process.exit(1);
  });

};
