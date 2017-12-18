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

Promise.all([
    clone.get_all_repos_names('ioanniswd', false, 'ioanniswd')
    .then(repos => {
      // console.log('repos:', repos);
      return repos;

      // return Promise.map(repos, clone.clone_repo);
    }),
    pull.get_existing_repos()
    .then(dirs => {
      // console.log('dirs:', dirs);
      return dirs;
    })
  ])
  .then(results => {
    console.log('results:', results);
    process.exit();
  })
  .catch(err => {
    console.log(err);
    process.exit(1);
  });
