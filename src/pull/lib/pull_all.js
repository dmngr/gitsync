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
 * @param  {string} dir Path to repo
 * @return {string} Success message
 */
module.exports = function(dir) {
  return exec('git pull --all')
    .spread((stdout, stderr) => {
      if (stderr) console.log(stderr);
      // console.log('stdout:', stdout);

      // console.log('dir:', dir);
      return `Pulled ${dir}`;
    });
};
