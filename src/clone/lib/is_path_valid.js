"use strict";


/**
 * Checks for validity of path, must be string and satisfy
 * @module
 */
/**
 *
 * @param  {string} path Path under which to clone a repo
 * @return {boolean} Whether path is valid
 */
module.exports = function(path) {
  if (!path || ((typeof path !== 'string' || path.indexOf(' ') != -1) && path.indexOf('ignore:') !== -1)) return false;
  else return true;
};
