"use strict";

var Promise = require('bluebird');

const request = Promise.promisify(require('request'), {multiArgs: true});


/**
 *
 * @module
 */
/**
 *
 * @param  {string} name Github username
 * @param  {boolean} org  Whether the account belongs to an organization
 * @param  {string} user User-Agent Header
 * @param  {string} at   Github authentication token
 * @return {repos}      Mapped to have attributes name, full_name, local_path
 */
module.exports = function(name, org, user, at) {

  var url = "https://api.github.com/";

  // if searching for organization
  url += org ? 'orgs/' : `users/`;

  url += `${name}/repos`;

  if (at) url += `?access_token=${at}`;

  // console.log('url:', url);

  return request({
      url: url,
      headers: {
        'User-Agent': user
      }
    })
    .spread((res, body) => {
      // console.log(body);
      // console.log('res:', res);
      body = JSON.parse(body);
      // console.log(body[0]);
      // console.log('body[0]:', Object.keys(body[0]));

      let repos = [];

      body.forEach(function(repo) {
        repos.push({
          name: repo.name,
          full_name: repo.full_name,
          local_path: repo.description,
        });
      });
      // console.log('repos: ', repos);
      return Promise.resolve(repos);
    })
    .catch(err => {
      console.log(err);
      return Promise.reject(err);
    });
};
