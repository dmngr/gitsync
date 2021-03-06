"use strict";

const Promise = require('bluebird');

const fs = Promise.promisifyAll(require('fs'));
const home = require('os').homedir();
const prompt = require('prompt-promise');

/**
 * Initializes/updates git credentials
 * @module
 */
/**
 *
 * @param {object} [cred={}] Credentials to keep
 *
 * Reads file with credentials, prompts for creation if not found and for update if found.
 * Creates/Updates credentials.
 * @return {Promise} Resolves to the the output of fs.writeFile or to message: 'Credentials not updated'
 */
module.exports = function(cred) {

  if (!cred) cred = {};


  /**
   * init
   *
   * @return {type}
   */
  function init() {
    console.log('Creating Credentials File..');

    return prompt('Github username: ')
      .then(username => {
        cred.user = username;
        return prompt.password('Github API access token: ');
      })
      .then(at => {
        cred.at = at;
        const data = JSON.stringify(cred, null, '\t');
        return fs.writeFileAsync(`${home}/.gitsync.json`, data)
          .then(() => cred);
      });
  }

  // check if exists first
  return fs.readFileAsync(`${home}/.gitsync.json`, 'utf-8')
    .then(data => {
      data = JSON.parse(data);
      // console.log('Credentials file already exists:');
      console.log(data);

      return prompt.confirm('Update credentials file? (yes): ');
    })
    .then(update => {
      console.log('update:', update);
      return update ? init() : Promise.resolve('Credentials not updated');
    })
    .catch(err => {
      if (err.code != 'ENOENT') throw err;
      else return init();
    });
};
