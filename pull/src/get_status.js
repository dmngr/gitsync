"use strict";

var Promise = require('bluebird');

const exec = Promise.promisify(require('child_process').exec, {
  multiArgs: true
});


/**
 * Updates refs for cwd
 * @module
 */
/**
 *
 * @return {string} Repo status: diverged, fast-forward, up-to-date
 */
module.exports = function() {
  var status;

  return exec('git remote update')
    .spread((stdout, stderr) => {
      status = stdout.match(/diverged|Unpacking|Fetching/)[0];
      if (status) {
        switch (status) {
          case 'diverged':
            return 'diverged';
          case 'Unpacking':
            return 'fast-forward';
          default:
            return exec('git status')
              .spread((stdout, stderr) => {
                if (stderr) console.log(stderr);

                // console.log(stdout);
                return stdout.match(/diverged|fast\-forwarded|up\-to\-date|ahead/)[0];
              });
        }
      }
    });
};
