"use strict";

const Promise = require('bluebird');

const exec = Promise.promisify(require('child_process').exec, {
  multiArgs: true
});

/**
 * Returns all repo branches
 * @module
 */
/**
 *
 * @param {string} path The absolute path to use as an cwd with exec
 * @return {string[]}  The branch names
 */
module.exports = function (path) {
  return exec('git branch -a', {
      cwd: path || __dirname
    })
    .spread((stdout, stderr) => {
      if (stderr) console.log(stderr);
      // console.log(stdout);

      const arr = stdout.split('\n').map(str => str.replace(/[^A-Za-z0-9_/]/g, '')).map(str => str.replace(/remotes\//g, '')).filter(str => str.length > 0);
      // console.log(arr);

      return arr;
    });
};