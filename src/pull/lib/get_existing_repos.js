"use strict";

const find = require('find');

/**
 * Finds all repository folder paths under cwd. Used to update repos status
 * @module
 */
/**
 *
 * @return {string[]} The repository folder paths under cwd
 */
module.exports = function() {
  return new Promise(function(resolve) {
    find.dir(/^((?!(node_modules|\.idea|\.vscode|\.dropbox|\.zip)).)*.git$/, './', dirs => {
      // console.log('dirs:', dirs);
      // console.log(dirs[0].substring(0, dirs[0].indexOf('/index.js')));
      dirs = dirs.map(dir => dir.substring(0, dir.indexOf('/.git')));
      // console.log('dirs:', dirs);

      resolve(dirs);
    });
  });
};
