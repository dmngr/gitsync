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

  return exec('git remote update')
    .spread((stdout, stderr) => {
      // console.log('stdout:', stdout);
      var match = stdout.match(/diverged|Unpacking|Fetching/);
      // console.log('match:', match);
      if (match) {
        switch (match[0]) {
          case 'diverged':
            return 'diverged';
          case 'Unpacking':
            return 'fast-forward';
          default:
            return exec('git status')
              .spread((stdout, stderr) => {
                if (stderr) console.log(stderr);

                // console.log(stdout);
                let match = stdout.match(/diverged|fast\-forwarded|up\-to\-date|ahead/);

                // console.log('match:', match);
                return match ? match[0] : 'unsaved changes';
              });
        }
      } else return 'no_remote';
    });
};
