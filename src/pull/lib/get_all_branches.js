"use strict";

var Promise = require('bluebird');

const exec = Promise.promisify(require('child_process').exec, {
  multiArgs: true
});

/**
 * Returns all repo branches
 * @module
 */
/**
 *
 * @return {string[]}  The branch names
 */
module.exports = function() {
  return exec('git branch -a')
    .spread((stdout, stderr) => {
      if (stderr) console.log(stderr);
      // console.log(stdout);

      var arr = stdout.split('\n').map(str => str.replace(/[^A-Za-z0-9_\/]/g, '')).map(str => str.replace(/remotes\//g, '')).filter(str => str.length > 0);
      // console.log(arr);

      return arr;
    });
};
