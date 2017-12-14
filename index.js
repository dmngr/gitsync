#!/usr/bin/env node

"use strict";

var Promise = require('bluebird');

const exec = Promise.promisify(require('child_process').exec);
const find = Promise.promisifyAll(require('find'));
const homedir = require('os').homedir();
const colors = require('colors/safe');
const Git = require("nodegit");

// exec('find . -type d -regextype sed -regex ".*/^(.git)^(node_modules)/g"');

find.fileAsync(/^((?!(node_modules|\.git|\.idea|\.vscode|\.dropbox|\.zip)).)*index\.js$/, './', dirs => {
  dirs = dirs.map(dir => dir.substring(0, dir.indexOf('/index.js')));
  console.log('dirs:', dirs);
  console.log(dirs[0].substring(0, dirs[0].indexOf('/index.js')));
});
