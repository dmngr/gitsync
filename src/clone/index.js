"use strict";

const Promise = require('bluebird');

const fs = Promise.promisifyAll(require('fs'));
const home = require('os').homedir();

const clone_repo = require('./lib/clone_repo');
const get_all_repos_names = require('./lib/get_all_repos_names');
const is_path_valid = require('./lib/is_path_valid');
const init_cred = require('./lib/init_cred');

module.exports = function() {

  let at;

  // used to check for authentication token before operations that require it
  /**
   * check_at
   *
   * @return {type}
   */
  function check_at() {
    if (!at) {
      return fs.readFileAsync(`${home}/.gitsync.json`, 'utf-8')
        .then(data => {
          if (data) {
            at = JSON.parse(data).at;
            return Promise.resolve();
          } else return init_cred();

        }).
      catch(err => {
        if (err.code != 'ENOENT') throw err;
        else return init_cred();
      });
    } else return Promise.resolve();
  }

  this.init_cred = init_cred;
  this.clone_repo = repo => check_at().then(() => clone_repo(repo, at)).catch(err => {
    console.log(err);
    process.exit(1);
  });
  this.get_all_repos_names = (name, org, user) => check_at().then(() => get_all_repos_names(name, org, user, at)).catch(err => {
    console.log(err);
    process.exit(1);
  });
  this.is_path_valid = is_path_valid;

};
