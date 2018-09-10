"use strict";

const Promise = require('bluebird');

const exec = Promise.promisify(require('child_process').exec, {
  multiArgs: true
});


/**
 * Updates refs for cwd
 * @module
 */
/**
 * @param {string} path The absolute path to use as an cwd with exec
 * @return {string} Repo status: diverged, fast-forward, up-to-date
 */
module.exports = function(path) {

  // console.log('path:', path);
  // console.log('__dirname:', __dirname);
  return exec('git remote update', {
      cwd: path || __dirname
    })
    .spread((stdout) => {
      // console.log('stdout:', stdout);
      const match = stdout.match(/diverged|Unpacking|Fetching/);
      // console.log('match:', match);
      if (match) {
        switch (match[0]) {
          case 'diverged':
            return 'diverged';
          case 'Unpacking':
            return 'fast-forward';
          default:
            return exec('git status', {
                cwd: path || __dirname
              })
              .spread((stdout, stderr) => {
                if (stderr) console.log(stderr);

                // console.log(stdout);
                const match = stdout.match(/diverged|fast-forward|Changes to be committed|Untracked|working (directory|tree) clean|ahead/);

                // console.log('match:', match);
                return match ? match[0] : 'Untracked';
              });
        }
      } else return 'no-remote';
    });
};
