#!/usr/bin/env node

"use strict";

var Promise = require('bluebird');

const find = require('find');
const exec = Promise.promisify(require('child_process').exec, {
  multiArgs: true
});

/**
 * Finds all repository folder paths under cwd. Used to update repos status
 * @module
 */
/**
 *
 * @return {string[]} The repository folder paths under cwd
 */
return new Promise(function(resolve, reject) {
    find.file(/^((?!(node_modules|\.git|\.idea|\.vscode|\.dropbox|\.zip|test\/)).)*\.js$/, './', files => {
      // console.log('files:', files);

      resolve(files);
    });
  })
  .then(files => {
    // console.log('files:', files);
    // console.log("${files.join(' '):", files.join(' '));
    return exec(`jsdoc2md -t jsdoc2md/README.hbs ${files.join(' ')} > README.md`);
  })
  // .spread((stdout, stderr) => {
  //   console.log('stdout:', stdout);
  //   console.log('stderr:', stderr);
  // })
  .catch(err => {
    throw err;
  });
