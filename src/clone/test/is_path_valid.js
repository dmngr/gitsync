"use strict";

const expect = require('chai').expect;
const index = require('../index');
const is_path_valid = new index().is_path_valid;

it('returns true for correct path without subfolders', function() {
  const path = 'path';
  const correct_path = is_path_valid(path);
  expect(correct_path).to.equal(true);
});

it('returns true for correct path with subfolders', function() {
  const path = 'path/without/spaces';
  const correct_path = is_path_valid(path);
  expect(correct_path).to.equal(true);
});

it('returns false for path with spaces', function() {
  const path = 'path with spaces';
  const correct_path = is_path_valid(path);
  expect(correct_path).to.equal(false);
});

it('returns true for path with ignore:', function() {
  const path = 'ignore:some other repo';
  const correct_path = is_path_valid(path);
  expect(correct_path).to.equal(true);
});
