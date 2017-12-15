"use strict";

var Promise = require('bluebird');

const exec = Promise.promisify(require('child_process').exec);
const find = Promise.promisifyAll(require('find'));
const homedir = require('os').homedir();

module.exports = function() {
  return find.fileAsync(/^((?!(node_modules|\.git|\.idea|\.vscode|\.dropbox|\.zip)).)*index\.js$/, './')
    .then(dirs => {
      console.log('dirs:', dirs);
      console.log(dirs[0].substring(0, dirs[0].indexOf('/index.js')));
      dirs = dirs.map(dir => dir.substring(0, dir.indexOf('/index.js')));
      return dirs;
    });
};
