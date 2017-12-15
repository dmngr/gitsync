"use strict";


/**
 * Checks for validity of path, must be string and satisfy
 * @module
 */
/**
 *
 * @param  {string} path
 * @return {boolean} Whether path is valid
 */
module.exports = function(path) {
  if (!path || path.indexOf(' ') != -1 || typeof path !== 'string') return false;
  else return true;
};
