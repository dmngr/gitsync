"use strict";

const find = require('find');
const homedir = require('os').homedir();

/**
 * Finds all repository folder paths under cwd. Used to update repos status
 * @module
 */
/**
 *
 * @return {string[]} The repository folder paths under cwd
 */
module.exports = function() {
  return new Promise(function(resolve, reject) {
    find.file(/^((?!(node_modules|\.git|\.idea|\.vscode|\.dropbox|\.zip)).)*index\.js$/, './', dirs => {
      // console.log('dirs:', dirs);
      // console.log(dirs[0].substring(0, dirs[0].indexOf('/index.js')));
      dirs = dirs.map(dir => dir.substring(0, dir.indexOf('/index.js')));
      // console.log('dirs:', dirs);

      resolve(dirs);
    });
  });
};
