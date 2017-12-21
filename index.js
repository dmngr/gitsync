#!/usr/bin/env node

"use strict";

var Promise = require('bluebird');

const exec = Promise.promisify(require('child_process').exec);
const find = Promise.promisifyAll(require('find'));
const fs = Promise.promisifyAll(require('fs'));
const homedir = require('os').homedir();
const colors = require('colors/safe');
const path = require('path');
const minimist = require('minimist');
const _ = require('lodash');
const Spinner = require('cli-spinner').Spinner;
const prompt = require('prompt-promise');

const Clone = require('./src/clone');
const clone = new Clone();

const pull = require('./src/pull');

// console.log('clone:', clone.clone_repo);

module.exports = function() {

  process.env.UV_THREADPOOL_SIZE = 10;

  var args = minimist(process.argv.slice(2), {
    boolean: ['all', 'a', 'pull', 'clone', 'org']
  });

  var start = process.hrtime();

  var invalid_desc_repos = [];
  var err_repos = [];

  // util
  function get_sync_info() {

    function init(cred) {
      console.log('Creating Configuration File..');

      if (!cred) cred = {};

      return prompt('User agent: ')
        .then(user_agent => {
          cred.user_agent = user_agent;
          return prompt('Sync account: ');
        })
        .then(sync_account => {
          cred.sync_account = sync_account;
          return prompt('Is account an organization? (no): ');
        })
        .then(org => {
          cred.org = org.toLowerCase().indexOf('y') !== -1;
          let data = JSON.stringify(cred, null, '\t');
          return fs.writeFileAsync(`${homedir}/.gitsync.json`, data);
        })
        .then(() => cred);
    }

    if (args.init) return init().then(clone.init_cred);
    else if (args.user && args.acount) {
      return {
        user_agent: args.user,
        sync_account: args.account
      };
    } else {
      return fs.readFileAsync(`${homedir}/.gitsync.json`, 'utf-8')
        .then(data => {
          data = JSON.parse(data);
          if (data.user_agent && data.sync_account) return data;
          else return init(data);

        })
        .catch(err => {
          if (err.code != 'ENOENT') throw err;
          else return init().then(clone.init_cred);
        });
    }
  }

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
                // console.log(colors.green(`Repo ${full_path} is up-to-date\n`));
                return;
            }
          });
      }, {
        concurrency: 20
      })
      .then(() => local_repos);
  }

  function filter_repos(remote_repos, local_repos) {
    var repos_to_clone = [];
    // remove local repos from remote repos

    remote_repos = _.filter(remote_repos, remote_repo => local_repos.findIndex(local_repo => local_repo.slice(local_repo.lastIndexOf('/') !== -1 ? (local_repo.lastIndexOf('/') + 1) : 0) === remote_repo.name) === -1);

    remote_repos.forEach(repo => {
      // console.log('repo.local_path:', repo.local_path);
      if (repo.local_path && clone.is_path_valid(repo.local_path)) {
        // console.log('valid repo desc:', colors.green(repo.local_path));
        repos_to_clone.push(repo);

      } else if (!repo.local_path || repo.local_path.indexOf('ignore:') === -1) {
        // console.log('invalid repo desc:', colors.red(repo.local_path));
        invalid_desc_repos.push(repo);
      }
    });

    // console.log('\nremote_repos:', repos_to_clone.length);
    // console.log('\nlocal_repos:', local_repos.length);

    return {
      remote_repos: repos_to_clone,
      local_repos: local_repos
    };
  }

  function create_missing_branches(local_repos) {

    return Promise.map(local_repos, repo_path => {
      // console.log('repo_path:', repo_path);
      var full_path = path.resolve(repo_path);

      return pull.get_all_branches(full_path)
        .then(branches => pull.track_missing_branches(branches, full_path));
    });
  }
  //

  function all() {

    return get_sync_info()
      .then(cred => {
        var spinner = new Spinner('Getting remote and local repos....');
        spinner.start();

        return Promise.all([
            clone.get_all_repos_names(cred.sync_account, cred.org, cred.user_agent),
            pull.get_existing_repos()
          ])
          // clone all remotes that do not exist locally
          .then(results => {
            spinner.stop();

            var remote_repos = results[0];
            var local_repos = results[1];

            var filtered_repos = filter_repos(remote_repos, local_repos);

            // used for testing
            // return local_repos;

            spinner = new Spinner('Cloning missing repos, Pulling, Creating Branches....');
            spinner.start();
            return Promise.map(filtered_repos.remote_repos, clone.clone_repo)
              .then(() => create_missing_branches(filtered_repos.remote_repos.map(repo => `${repo.local_path}/${repo.name}`)))
              .then(() => Promise.resolve(filtered_repos.local_repos));

          })
          // pull all local repos that need to update
          .then(pull_local)
          .then(create_missing_branches)
          .then(() => spinner.stop());
      });
  }

  function pull_repos() {
    var spinner = new Spinner('Finding existing repos and pulling...');
    spinner.start();
    return pull.get_existing_repos()
      .then(pull_local)
      .then(create_missing_branches)
      .then(() => spinner.stop());
  }

  function clone_repos() {
    return get_sync_info()
      .then(cred => {
        return Promise.all([
          clone.get_all_repos_names(cred.sync_account, cred.org, cred.user_agent),
          pull.get_existing_repos()
        ]);
      })
      // clone all remotes that do not exist locally
      .then(results => {
        var remote_repos = results[0];
        var local_repos = results[1];

        var filtered_repos = filter_repos(remote_repos, local_repos);

        // used for testing
        // return local_repos;
        var spinner = new Spinner('Cloning missing repos and creating branches....');
        spinner.start();

        console.log('cloning repos');
        return Promise.map(filtered_repos.remote_repos, clone.clone_repo)
          .then(() => create_missing_branches(filtered_repos.remote_repos.map(repo => `${repo.local_path}/${repo.name}`)))
          .then(() => spinner.stop());
      });
  }


  Promise.try(function() {
    switch (true) {
      case args.init:
        return get_sync_info();
      case (args.all || args.a):
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
      console.log(colors.red('\nInvalid Description Repos:'));
      invalid_desc_repos.forEach(repo => {
        console.log(`Repo Name: ${repo.name}`);
        console.log(`Description: ${colors.red(repo.local_path)}`);
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
