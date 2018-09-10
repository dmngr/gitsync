"use strict";
const Promise = require('bluebird');

const fs = Promise.promisifyAll(require('fs'));
const home = require('os').homedir();

/**
 * Returns access_token located in ${home}/.gitsync.json
 * @module
 */
/**
 *
 * @return {Promise}  Resolves to the access token
 */
module.exports.get_access_token = function() {
  fs.readFileAsync(`${home}/.gitsync.json`, 'utf-8')
    .then(data => {
      data = JSON.parse(data);
      return data.at ? Promise.resolve(data.at) : Promise.reject(`No authentication token found at: ${home}/.gitsync.json`);
    })
    .catch(err => {
      throw err;
    });
};
