"use strict";

var Promise = require('bluebird');

const exec = Promise.promisify(require('child_process').exec, {
  multiArgs: true
});


/**
 * Pulls all branches for repo
 * @module
 */
/**
 *
 * @param {string} path The absolute path to use as an cwd with exec
 * @return {string} Success message
 */
module.exports = function(path) {
  return exec('git pull --all', {
      cwd: path || __dirname
    })
    .spread((stdout, stderr) => {
      if (stderr) console.log(stderr);
      // console.log('stdout:', stdout);

      // console.log('dir:', dir);
      return `Pulled ${path}`;
    });
};
