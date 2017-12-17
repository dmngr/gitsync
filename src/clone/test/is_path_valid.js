"use strict";

const expect = require('chai').expect;
const is_path_valid = require('../index').is_path_valid;

it('returns true for correct path without subfolders', function() {
  var path = 'path';
  var correct_path = is_path_valid(path);
  expect(correct_path).to.equal(true);
});

it('returns true for correct path with subfolders', function() {
  var path = 'path/without/spaces';
  var correct_path = is_path_valid(path);
  expect(correct_path).to.equal(true);
});

it('returns false for path with spaces', function() {
  var path = 'path with spaces';
  var correct_path = is_path_valid(path);
  expect(correct_path).to.equal(false);
});
