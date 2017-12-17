"use strict";

var Promise = require('bluebird');

const exec = Promise.promisify(require('child_process').exec, {
  multiArgs: true
});


/**
 * Creates local branches production and branches with prodv prefix, if not found
 * @module
 */
/**
 *
 * @param  {string[]} branches All repo branches
 * @return {string[]} The branches that were added
 */
module.exports = function(branches) {
  var local_branches = branches.filter(str => str.indexOf('/') === -1);
  var remote_branches = branches.filter(str => /\/production|\/prodv/.test(str));

  // console.log('local_branches:', local_branches);
  // console.log('remote_branches:', remote_branches);

  var branches_to_add = remote_branches
    .filter(remote => local_branches.indexOf(remote.substring(remote.indexOf('/') + 1)) === -1);

  // console.log('branches_to_add:', branches_to_add);

  return Promise.map(branches_to_add, remote => {
    var local_branch_name = remote.substring(remote.indexOf('/') + 1);

    // used only for testing
    // return Promise.resolve(branches_to_add);

    return exec(`git branch -t ${local_branch_name} ${remote}`);
  }).then(() => Promise.resolve(branches_to_add));

};
