"use strict";

var Promise = require('bluebird');

const request = Promise.promisify(require('request'), {
  multiArgs: true
});

const is_path_valid = require('./is_path_valid');


/**
 * Gets all user's or org's repos names
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
      // console.log('headers: ', res.headers);
      // console.log('link:', res.headers.link);
      // console.log('typeof link:', typeof res.headers.link);

      var next_link;

      res.headers.link.split(',').forEach(str => {
        var arr = str.trim().split(';');
        if (arr[1].indexOf('next') !== -1) next_link = arr[0].slice(1, -1);
      });

      console.log('next_link:', next_link);

      body = JSON.parse(body);
      // console.log(body[0]);
      // console.log('body[0]:', Object.keys(body[0]));

      let repos = [];

      body.forEach(function(repo) {
        if (is_path_valid(repo.description)) {
          repos.push({
            name: repo.name,
            full_name: repo.full_name,
            local_path: repo.description,
          });
        }
      });

      console.log('repos: ', repos.length);
      return Promise.resolve(repos);
    })
    .catch(err => {
      console.log(err);
      return Promise.reject(err);
    });
};
