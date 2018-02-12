#!/usr/bin/env node

"use strict";

var Promise = require('bluebird');

const exec = Promise.promisify(require('child_process').exec, {
  multiArgs: true
});
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
    boolean: ['all', 'a', 'pull', 'clone', 'init', 'checkout']
  });

  var start = process.hrtime();

  var invalid_desc_repos = [];
  var err_repos = [];
  var diverged = [];
  var ahead = [];
  var no_remote = [];
  var unsaved_changes = [];
  var repos_pulled = [];
  var repos_cloned = [];

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
          return prompt('Default Root Folder: ');
        })
        .then(default_root_path => {
          default_root_path = path.resolve(default_root_path);

          cred.default_root_path = default_root_path;
          let data = JSON.stringify(cred, null, '\t');
          return fs.writeFileAsync(`${homedir}/.gitsync.json`, data);
        })
        .then(() => {
          if (cred.default_root_path) process.chdir(cred.default_root_path);
          return cred;
        });
    }

    if (args.init) {
      return fs.readFileAsync(`${homedir}/.gitsync.json`, 'utf-8')
        .then(data => init(JSON.parse(data)).then(clone.init_cred))
        .catch(err => {
          if (err.code != 'ENOENT') throw err;
          else return init().then(clone.init_cred);
        });

    } else {
      return fs.readFileAsync(`${homedir}/.gitsync.json`, 'utf-8')
        .then(data => {
          data = JSON.parse(data);
          if (args.account) data.sync_account = args.account;
          if (args.org) data.org = args.org;
          if (args.user) data.user_agent = args.user;
          if (args.cwd) data.default_root_path = args.cwd;

          if (data.default_root_path) process.chdir(data.default_root_path);

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
            // console.log('status:', status);
            switch (status) {
              case 'fast-forward':
                return pull.pull_all(full_path)
                  .then(() => {
                    repos_pulled.push(full_path);
                    return;
                  })
                  .catch(err => {
                    err_repos.push(repo_path);
                    return;
                  });
              case 'diverged':
                diverged.push(full_path);
                return;
              case 'ahead':
                ahead.push(full_path);
                return;
              case 'no-remote':
                no_remote.push(full_path);
                return;
              case 'Untracked':
                unsaved_changes.push(full_path);
                return;
              case 'Changes to be committed':
                unsaved_changes.push(full_path);
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
        .then(branches => pull.track_missing_branches(branches, full_path))
        .then(branches_added => checkout(branches_added, full_path));
    });
  }

  function checkout(branches, full_path) {
    // console.log('branches: ', branches);
    var stable_branch;
    if (branches.indexOf('prodv4_6') !== -1) stable_branch = 'prodv4_6';
    else if (branches.indexOf('production') !== -1) stable_branch = 'production';

    // console.log('stable_branch:', stable_branch);

    if (!stable_branch) return Promise.resolve();
    else return exec(`git checkout ${stable_branch}`, {
      cwd: full_path
    });
  }
  //

  function all() {

    return get_sync_info()
      .then(cred => {
        var spinner = new Spinner('Getting remote and local repos....');
        spinner.start();

        return Promise.all([
            clone.get_all_repos_names(cred.sync_account, cred.org, cred.user_agent, cred.at),
            pull.get_existing_repos()
          ])
          // clone all remotes that do not exist locally
          .then(results => {
            spinner.stop();

            var remote_repos = results[0];
            var local_repos = results[1];

            var filtered_repos = filter_repos(remote_repos, local_repos);

            repos_cloned = filtered_repos.remote_repos;

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
    var spinner;
    return get_sync_info()
      .then(() => {
        spinner = new Spinner('Finding existing repos and pulling...');
        spinner.start();
        return pull.get_existing_repos();
      })
      .then(pull_local)
      .then(create_missing_branches)
      .then(() => spinner.stop());
  }

  function clone_repos() {
    return get_sync_info()
      .then(cred => {
        return Promise.all([
          clone.get_all_repos_names(cred.sync_account, cred.org, cred.user_agent, cred.at),
          pull.get_existing_repos()
        ]);
      })
      // clone all remotes that do not exist locally
      .then(results => {
        var remote_repos = results[0];
        var local_repos = results[1];

        var filtered_repos = filter_repos(remote_repos, local_repos);

        repos_cloned = filtered_repos.remote_repos;

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

  function checkout_stable() {
    var spinner;
    spinner = new Spinner('Checking out to stable branches...');
    spinner.start();
    return get_sync_info()
      .then(pull.get_existing_repos)
      .then(repos => {
        return Promise.map(repos, repo_path => {
          var full_path = path.resolve(repo_path);
          // console.log('full_path:', full_path);

          return pull.get_all_branches(full_path)
            .then(branches => checkout(branches, full_path));
        }, {
          concurrency: 20
        });
      })
      .then(() => spinner.stop());
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
        case args.checkout:
          return checkout_stable();
        default:
          return Promise.reject('Arguments required: --pull to pull repos, --clone to clone repos, --all to both pull and clone');
      }
    })
    .then(() => {
      if (invalid_desc_repos.length > 0) {
        console.log(colors.red('\nInvalid Description Repos:'));
        invalid_desc_repos.forEach(repo => {
          console.log(`Repo Name: ${repo.name}`);
          console.log(`Description: ${colors.red(repo.local_path)}`);
        });
      }

      if (err_repos.length > 0) {
        console.log(colors.red('\nRepos that returned error:'));
        console.log(err_repos);
      }

      if (diverged.length > 0) {
        console.log(colors.red('\nRepos that have diverged:'));
        console.log(diverged);
      }

      if (ahead.length > 0) {
        console.log(colors.green('\nRepos that are ahead of remote:'));
        console.log(ahead);
      }
      if (no_remote.length > 0) {
        console.log(colors.yellow('\nRepos that have no remote:'));
        console.log(no_remote);
      }

      if (unsaved_changes.length > 0) {
        console.log(colors.rainbow('\nRepos that have unsaved changes:'));
        console.log(unsaved_changes);
      }

      if (!args.clone && !args.init) console.log('\nrepos pulled:', repos_pulled);
      if (!args.pull && !args.init) console.log('\nrepos cloned:', repos_cloned);

      console.log(colors.green('\nSuccess'));
      console.log('seconds:', process.hrtime(start)[0]);
      process.exit();
    }).catch(err => {
      console.log(colors.red(err));
      console.log('seconds:', process.hrtime(start)[0]);
      process.exit(1);
    });

};
