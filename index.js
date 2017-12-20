#!/usr/bin/env node

"use strict";

var Promise = require('bluebird');

const exec = Promise.promisify(require('child_process').exec);
const find = Promise.promisifyAll(require('find'));
const homedir = require('os').homedir();
const colors = require('colors/safe');
const path = require('path');

const Clone = require('./src/clone');
const clone = new Clone();

const pull = require('./src/pull');

// console.log('clone:', clone.clone_repo);

module.exports = function() {

  process.env.UV_THREADPOOL_SIZE = 20;

  var start = process.hrtime();

  var invalid_desc_repos = [];
  var repos_to_clone = [];
  var err_repos = [];
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

      remote_repos.forEach(repo => {
        console.log('repo.local_path:', repo.local_path);
        if (!repo.local_path || repo.local_path.indexOf('ignore:') === -1) {
          console.log('not ignore');
          if (clone.is_path_valid(repo.local_path)) repos_to_clone.push(repo);
          else invalid_desc_repos.push(repo);
        }
      });

      console.log('invalid_desc_repos:', invalid_desc_repos);

      // console.log('remote_repos:', remote_repos);
      // console.log('local_repos:', local_repos);

      // used for testing
      // return local_repos;

      console.log('cloning repos');
      return Promise.map(remote_repos, clone.clone_repo)
        .then(() => Promise.resolve(local_repos));

    })
    // pull all local repos that need to update
    .then(local_repos => {
      console.log('local_repos:', local_repos.length);
      var root_dir = process.cwd();
      console.log('root_dir:', root_dir);

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
    })
    .then(() => {
      console.log('seconds:', process.hrtime(start)[0]);
      process.exit();
    })
    .catch(err => {
      console.log(err);
      console.log('seconds:', process.hrtime(start)[0]);
      process.exit(1);
    });
};
