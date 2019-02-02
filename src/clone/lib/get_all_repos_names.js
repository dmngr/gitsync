"use strict";

const Promise = require('bluebird');

const request = Promise.promisify(require('request'), {
  multiArgs: true
});


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
module.exports = function (name, org, user, at) {
  const repos = [];

  let first_url = "https://api.github.com/";

  // if searching for organization
  first_url += org ? 'orgs/' : `users/`;

  first_url += `${name}/repos`;

  if (at) first_url += `?access_token=${at}`;

  // console.log('url:', url);


  /**
   * get_next
   *
   * @param  {type} url
   * @return {type}
   */
  function get_next(url) {
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
        //console.log(body[0]);
        //console.log('body[0]:', Object.keys(body[0]));


        body.forEach(function (repo) {
          if (repo.description && repo.description.indexOf('ignore:') == -1) {
            repos.push({
              name: repo.name,
              full_name: repo.full_name,
              local_path: repo.description
            });
          }
        });

        //console.log('repos: ', repos.length);

        // find next link
        // console.log('headers: ', res.headers);
        // console.log('link:', res.headers.link);
        // console.log('typeof link:', typeof res.headers.link);

        let next_link;

        if (res.headers.link) {
          res.headers.link.split(',').forEach(str => {
            const arr = str.trim().split(';');
            if (arr[1].indexOf('next') !== -1) next_link = arr[0].slice(1, -1);
          });
        }

        //console.log('next_link:', next_link);

        if (!next_link) return repos;
        else return get_next(next_link);
      });
  }

  return get_next(first_url)
    .then(() => {
      return repos;
    })
    .catch(err => {
      console.log(err);
      return Promise.reject(err);
    });
};